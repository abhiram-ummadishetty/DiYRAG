// js/pipeline.js
import { setStage, setBadge } from "./utils.js";
import { resetRenderers } from "./renderers.js";
import { handleEvent } from "./eventHandler.js";
import { runMockPipeline } from "./mockPipeline.js";

const API_BASE = "http://localhost:8000";

function resetPipeline() {
  ["loading","chunking","embedding","storing","retrieving","generating"].forEach((s) => {
    setStage("s-" + s, "");
    setBadge("b-" + s, "—");
  });
  resetRenderers();
}

async function consumeSSE(response, uploadedFiles) {
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try { await handleEvent(JSON.parse(line.slice(6)), uploadedFiles); } catch {}
    }
  }
}

export async function runPipeline(uploadedFiles) {
  const query  = document.getElementById("query-input").value.trim();
  if (!uploadedFiles.length) return;

  document.getElementById("run-btn").disabled = true;
  document.getElementById("pipeline").style.display = "flex";
  resetPipeline();

  // Read config set by the sidebar
  const cfg = window.ragConfig || {};

  const formData = new FormData();
  uploadedFiles.forEach((f) => formData.append("files", f));
  formData.append("query", query);

  // Build URL with config query params
  const params = new URLSearchParams({
    chunker:  cfg.chunker  || "fixed",
    embedder: cfg.embedder || "local",
    retriever:cfg.retriever|| "faiss",
    llm:      cfg.llm      || "gpt-4o-mini",
  });

  let response;
  try {
    response = await fetch(`${API_BASE}/rag/stream?${params}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    console.warn("Backend unreachable, running mock pipeline.", err);
    await runMockPipeline(query, uploadedFiles);
    document.getElementById("run-btn").disabled = false;
    return;
  }

  await consumeSSE(response, uploadedFiles);
  document.getElementById("run-btn").disabled = false;
}