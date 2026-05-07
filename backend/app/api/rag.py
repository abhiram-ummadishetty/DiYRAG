from fastapi.responses import StreamingResponse
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, File , Form
import tempfile
from app.services.pdf_loader import PDFLoader
from app.services.embedder.factory import get_embedder
from app.services.vector_store import VectorStore
from app.services.retriever import Retriever
from app.services.llm import LLM
from app.core.pipeline import RAGPipeline
from typing import List

router = APIRouter()
executor = ThreadPoolExecutor()

# Load models once at startup, not per request
llm = LLM()


@router.post("/rag/stream")
async def run_rag_stream(files: List[UploadFile] = File(...), query: str = Form(...), config:str = Form(default="")):
    
    config = json.loads(config) if isinstance(config, str) else config
    embedder = config.get("embedder", "local")
    embedder = get_embedder(embedder) 
    
    async def event_generator():
        loader = PDFLoader()
        documents = []

        # STEP 1: Load PDFs
        yield f"data: {json.dumps({'step': 'loading'})}\n\n"

        for file in files:
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name

        text = loader.load(tmp_path)
        documents.append(text)

        # Init pipeline
        vector_store = VectorStore(embedder.dimension())
        retriever = Retriever(vector_store)
        pipeline = RAGPipeline(embedder, vector_store, retriever, llm)

        # STEP 2: Chunking
        yield f"data: {json.dumps({'step': 'chunking'})}\n\n"
        chunks = pipeline.chunk(documents)
        await asyncio.sleep(0)

        # STEP 3: Embedding
        yield f"data: {json.dumps({'step': 'embedding', 'count': len(chunks)})}\n\n"
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(executor, pipeline.embed, chunks)
        pipeline.store(embeddings, chunks)
        await asyncio.sleep(0)

        # STEP 4: Retrieval
        yield f"data: {json.dumps({'step': 'retrieving'})}\n\n"
        retrieved = await loop.run_in_executor(executor, pipeline.retrieve, query)
        await asyncio.sleep(0)

        # STEP 5: Generation
        yield f"data: {json.dumps({'step': 'generating'})}\n\n"
        prompt, response = await loop.run_in_executor(
            executor, lambda: pipeline.generate(query, retrieved)
        )
        await asyncio.sleep(0)

        # FINAL OUTPUT
        yield f"data: {json.dumps({
            'step': 'done',
            'response': response,
            'chunks_preview': chunks[:5],
            'retrieved': retrieved
        })}\n\n"

    # return StreamingResponse(event_generator(), media_type="text/event-stream")
    return StreamingResponse(
    event_generator(),
    media_type="text/event-stream",
    headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",  # disables nginx buffering if any proxy is involved
    }
)