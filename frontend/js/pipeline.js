// js/pipeline.js
// Orchestrates a real RAG run: POSTs to the backend, reads the SSE stream,
// and dispatches each event to the event handler.

import { setStage, setBadge } from "./utils.js";
import { resetRenderers } from "./renderers.js";
import { handleEvent } from "./eventHandler.js";
import { runMockPipeline } from "./mockPipeline.js";

const API_URL = "http://localhost:8000/rag/stream";

// Reset every stage and all render targets before a new run.
function resetPipeline() {
  ["loading", "chunking", "embedding", "storing", "retrieving", "generating"]
    .forEach((s) => {
      setStage("s-" + s, "");
      setBadge("b-" + s, "—");
    });
  resetRenderers();
}

// Read a fetch Response as an SSE stream and dispatch events.
async function consumeSSE(response, uploadedFiles) {
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop(); // keep incomplete last line

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        await handleEvent(data, uploadedFiles);
      } catch {
        // malformed JSON — skip
      }
    }
  }
}

// Entry point called by the Run RAG button.
export async function runPipeline(uploadedFiles) {
  const query = document.getElementById("query-input").value.trim();
  if (!uploadedFiles.length) return;

  document.getElementById("run-btn").disabled = true;
  const pipelineEl = document.getElementById("pipeline");
  pipelineEl.style.display = "flex";

  resetPipeline();

  const formData = new FormData();
  uploadedFiles.forEach((f) => formData.append("files", f));
  formData.append("query", query);

  let response;
  try {
    response = await fetch(API_URL, { method: "POST", body: formData });
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
