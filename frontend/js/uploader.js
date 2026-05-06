// js/uploader.js
// Handles file selection, drag-and-drop, and chip rendering.

export let uploadedFiles = [];

export function initUploader() {
  const dz    = document.getElementById("drop-zone");
  const input = document.getElementById("file-input");

  input.addEventListener("change", (e) => handleFiles(e.target.files));

  dz.addEventListener("dragover", (e) => e.preventDefault());
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  });
  dz.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") input.click();
  });
}

export function handleFiles(files) {
  uploadedFiles = Array.from(files);

  const chips = document.getElementById("file-chips");
  const zone  = document.getElementById("drop-zone");

  chips.innerHTML = uploadedFiles
    .map(
      (f) =>
        `<span class="chip">` +
        `<i class="ti ti-file-type-pdf" aria-hidden="true"></i>${f.name}` +
        `</span>`,
    )
    .join("");

  zone.classList.toggle("has-files", uploadedFiles.length > 0);
  document.getElementById("run-btn").disabled = uploadedFiles.length === 0;
}
