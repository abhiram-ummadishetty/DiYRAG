// js/renderers.js
// Pure DOM-rendering functions. Each function takes data and writes to the DOM.
// No fetch or state logic lives here.

import { sleep, esc } from "./utils.js";

let vsTotal = 0; // tracks how many vs-cells were created

// ── Chunks ────────────────────────────────────────────────────────────────────

export function renderChunks(chunks) {
  const grid = document.getElementById("chunk-grid");
  chunks.forEach((text, i) => {
    const card = document.createElement("div");
    card.className = "chunk-card";
    card.style.animationDelay = i * 60 + "ms";
    card.innerHTML =
      `<div class="chunk-label">Chunk ${i + 1}</div>` +
      `<div class="chunk-text">${esc(text)}</div>`;
    grid.appendChild(card);
  });
}

// ── Embedding bars ────────────────────────────────────────────────────────────

export function renderEmbedBars(count) {
  const vis  = document.getElementById("embed-vis");
  const show = Math.min(count, 8);

  for (let i = 0; i < show; i++) {
    const w    = 38 + Math.random() * 57;
    const dots = Array.from({ length: Math.floor(w / 5) }, () => {
      const opacity = (0.3 + Math.random() * 0.7).toFixed(2);
      return `<span class="embed-dot" style="opacity:${opacity}"></span>`;
    }).join("");

    const row = document.createElement("div");
    row.className = "embed-bar-row";
    row.innerHTML =
      `<span class="embed-bar-label">chunk_${i + 1}</span>` +
      `<div class="embed-bar" id="eb-${i}" style="width:0">` +
      `<div class="embed-sparkle">${dots}</div></div>`;
    vis.appendChild(row);

    // animate after paint
    setTimeout(() => {
      const bar = document.getElementById("eb-" + i);
      if (bar) { bar.style.width = w + "%"; bar.classList.add("show"); }
    }, i * 80 + 100);
  }

  if (count > 8) {
    const more = document.createElement("div");
    more.className = "embed-hint";
    more.textContent = `+ ${count - 8} more vectors…`;
    vis.appendChild(more);
  }
}

// ── Vector-store grid ─────────────────────────────────────────────────────────

export function initVsGrid(count) {
  const grid = document.getElementById("vs-grid");
  vsTotal = Math.min(count, 40);
  for (let i = 0; i < vsTotal; i++) {
    const cell = document.createElement("div");
    cell.className = "vs-cell";
    cell.id = "vc-" + i;
    grid.appendChild(cell);
  }
}

export async function animateVsGrid(count) {
  for (let i = 0; i < Math.min(count, 40); i++) {
    await sleep(28 + Math.random() * 22);
    const cell = document.getElementById("vc-" + i);
    if (cell) cell.classList.add("filled");
  }
}

// ── Retrieved chunks ──────────────────────────────────────────────────────────

export function renderRetrieved(items) {
  const list = document.getElementById("retrieved-list");

  items.forEach((item, i) => {
    const score =
      item.score != null ? (item.score * 100).toFixed(0) + "%" : `#${i + 1}`;

    const card = document.createElement("div");
    card.className = "retrieved-card";
    card.style.animationDelay = i * 80 + "ms";
    card.innerHTML =
      `<span class="retrieved-score">${score}</span>` +
      `<span class="retrieved-text">${esc(item.text || "")}</span>`;
    list.appendChild(card);

    // highlight matching vs-cell
    const cell = document.getElementById("vc-" + (i % Math.max(vsTotal, 1)));
    if (cell) cell.classList.add("retrieved");
  });
}

// ── LLM typed response ────────────────────────────────────────────────────────

export async function typeResponse(text) {
  const el     = document.getElementById("llm-text");
  const cursor = document.getElementById("cursor");
  cursor.style.display = "inline-block";

  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    el.textContent += (i === 0 ? "" : " ") + words[i];
    if (i % 3 === 0) await sleep(28);
  }

  cursor.style.display = "none";
}

// ── Warning banner ────────────────────────────────────────────────────────────

export function showWarnBanner(message) {
  const warn = document.createElement("div");
  warn.className = "warn";
  warn.innerHTML =
    `<i class="ti ti-alert-triangle" aria-hidden="true"></i>&nbsp;${message}`;
  document.getElementById("pipeline").appendChild(warn);
}

// ── Reset all render targets ──────────────────────────────────────────────────

export function resetRenderers() {
  vsTotal = 0;
  ["chunk-grid", "embed-vis", "vs-grid", "retrieved-list", "loading-stats"]
    .forEach((id) => { document.getElementById(id).innerHTML = ""; });
  document.getElementById("llm-text").textContent = "";
  document.getElementById("cursor").style.display = "none";
  document.getElementById("chunk-count").textContent = "";
  document.getElementById("embed-count").textContent = "";
  document.querySelectorAll(".warn").forEach((el) => el.remove());
}
