// js/mockPipeline.js
// Simulates the full pipeline locally when the backend is unreachable.
// Mirrors the real SSE flow so the UI logic is exercised identically.

import { sleep, setStage, setBadge } from "./utils.js";
import {
  renderChunks,
  renderEmbedBars,
  initVsGrid,
  animateVsGrid,
  renderRetrieved,
  typeResponse,
  showWarnBanner,
} from "./renderers.js";

const MOCK_CHUNKS = [
  "The transformer architecture introduced self-attention mechanisms that allow models to weigh the importance of different tokens in a sequence.",
  "BERT uses bidirectional training of Transformers, enabling deep language understanding across many NLP benchmarks and downstream tasks.",
  "GPT models use autoregressive language modeling, predicting the next token given all previous tokens in left-to-right order.",
  "Dense vector embeddings map high-dimensional sparse representations into compact lower-dimensional spaces that capture semantic meaning.",
  "Vector databases enable efficient similarity search using approximate nearest neighbor algorithms such as HNSW or IVF-PQ.",
];

const MOCK_RETRIEVED = [
  { text: MOCK_CHUNKS[0], score: 0.91 },
  { text: MOCK_CHUNKS[3], score: 0.84 },
  { text: MOCK_CHUNKS[2], score: 0.76 },
];

function mockResponse(query) {
  if (!query) return "No query was provided. Enter a question above and click Run RAG.";
  return (
    "Based on the retrieved context, here is a summary: " +
    "The documents describe foundational NLP concepts — transformer architectures, " +
    "bidirectional (BERT) and autoregressive (GPT) pretraining, dense embeddings, " +
    "and vector stores for efficient retrieval. The passages most relevant to your " +
    "query were surfaced and used to construct this response."
  );
}

export async function runMockPipeline(query, uploadedFiles) {
  // Loading
  setStage("s-loading", "active");
  setBadge("b-loading", "reading…");
  await sleep(600);
  setStage("s-loading", "done");
  setBadge(
    "b-loading",
    `${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""}`,
  );

  // Chunking
  setStage("s-chunking", "active");
  setBadge("b-chunking", "splitting…");
  await sleep(700);
  setStage("s-chunking", "done");
  setBadge("b-chunking", `${MOCK_CHUNKS.length} chunks`);
  document.getElementById("chunk-count").textContent =
    `${MOCK_CHUNKS.length} chunks created from your PDFs`;
  renderChunks(MOCK_CHUNKS);

  // Embedding
  setStage("s-embedding", "active");
  setBadge("b-embedding", "encoding…");
  document.getElementById("embed-count").textContent =
    `Embedding ${MOCK_CHUNKS.length} chunks → 384-dim vectors`;
  renderEmbedBars(MOCK_CHUNKS.length);
  await sleep(900);

  // Storing
  setStage("s-storing", "active");
  setBadge("b-storing", "indexing…");
  initVsGrid(MOCK_CHUNKS.length);
  await animateVsGrid(MOCK_CHUNKS.length);
  setStage("s-embedding", "done");
  setBadge("b-embedding", `${MOCK_CHUNKS.length} vectors`);
  setStage("s-storing", "done");
  setBadge("b-storing", `${MOCK_CHUNKS.length} indexed`);

  // Retrieving
  setStage("s-retrieving", "active");
  setBadge("b-retrieving", "searching…");
  await sleep(700);
  renderRetrieved(MOCK_RETRIEVED);
  setStage("s-retrieving", "done");
  setBadge("b-retrieving", `${MOCK_RETRIEVED.length} matches`);

  // Generating
  setStage("s-generating", "active");
  setBadge("b-generating", "thinking…");
  await sleep(400);
  await typeResponse(mockResponse(query));
  setStage("s-generating", "done");
  setBadge("b-generating", "done");

  showWarnBanner("Could not reach localhost:8000 — showing demo data above");
}
