from app.services.vector_store import VectorStore


class RAGPipeline:
    def __init__(self, embedder, vector_store, retriever, llm):
        self.embedder = embedder
        self.vector_store = vector_store
        self.retriever = retriever
        self.llm = llm

    def chunk(self, documents, chunk_size=200):
        chunks = []
        for doc in documents:
            for i in range(0, len(doc), chunk_size):
                chunks.append(doc[i:i+chunk_size])
        return chunks

    def embed(self, chunks):
        return self.embedder.embed(chunks)

    def store(self, embeddings, chunks):
        dim = len(embeddings[0])
        self.vector_store = VectorStore(dim)
        self.retriever.vector_store = self.vector_store
        self.vector_store.add(embeddings, chunks)

    def retrieve(self, query):
        query_embedding = self.embedder.embed([query])[0]
        return self.retriever.retrieve(query_embedding)

    def generate(self, query, retrieved):
        context = "\n".join([r["text"] for r in retrieved])
        prompt = f"""
Use the context to answer:

{context}

Question: {query}
"""
        return prompt, self.llm.generate(prompt)