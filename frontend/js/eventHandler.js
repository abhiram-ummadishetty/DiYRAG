// js/eventHandler.js
// Maps each SSE step → stage transitions + renderer calls.
// Knows nothing about fetch or the DOM structure beyond IDs.

import { setStage, setBadge } from "./utils.js";
import {
  renderChunks,
  renderEmbedBars,
  initVsGrid,
  animateVsGrid,
  renderRetrieved,
  typeResponse,
} from "./renderers.js";

export async function handleEvent(data, uploadedFiles) {
  const step = data.step;

  if (step === "loading") {
    setStage("s-loading", "active");
    setBadge("b-loading", "reading…");

  } else if (step === "chunking") {
    setStage("s-loading", "done");
    setBadge(
      "b-loading",
      `${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""}`,
    );
    setStage("s-chunking", "active");
    setBadge("b-chunking", "splitting…");

  } else if (step === "embedding") {
    setStage("s-chunking", "done");
    setBadge("b-chunking", `${data.count} chunks`);
    document.getElementById("chunk-count").textContent =
      `${data.count} chunks created from your PDFs`;

    setStage("s-embedding", "active");
    setBadge("b-embedding", "encoding…");
    document.getElementById("embed-count").textContent =
      `Embedding ${data.count} chunks → 384-dim vectors`;
    renderEmbedBars(data.count);

    setStage("s-storing", "active");
    setBadge("b-storing", "indexing…");
    initVsGrid(data.count);
    await animateVsGrid(data.count);

    setStage("s-embedding", "done");
    setBadge("b-embedding", `${data.count} vectors`);
    setStage("s-storing", "done");
    setBadge("b-storing", `${data.count} indexed`);

  } else if (step === "retrieving") {
    setStage("s-retrieving", "active");
    setBadge("b-retrieving", "searching…");

  } else if (step === "generating") {
    setStage("s-retrieving", "done");
    setBadge("b-retrieving", "done");
    setStage("s-generating", "active");
    setBadge("b-generating", "thinking…");

  } else if (step === "done") {
    if (data.chunks_preview) renderChunks(data.chunks_preview);
    if (data.retrieved)      renderRetrieved(data.retrieved);
    await typeResponse(data.response || "(no response)");
    setStage("s-generating", "done");
    setBadge("b-generating", "done");
  }
}
