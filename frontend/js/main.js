// js/main.js
// Application entry point. Wires up modules and attaches event listeners.

import { initUploader, uploadedFiles } from "./uploader.js";
import { runPipeline } from "./pipeline.js";

// Boot once the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  initUploader();

  document.getElementById("run-btn").addEventListener("click", () => {
    // uploadedFiles is a live reference exported from uploader.js
    runPipeline(uploadedFiles);
  });
});
