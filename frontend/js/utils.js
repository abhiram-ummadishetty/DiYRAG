// js/utils.js
// Shared low-level helpers used across modules.

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const esc = (s) =>
  String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const setStage = (id, state) => {
  document.getElementById(id).className = "stage " + state;
};

export const setBadge = (id, text) => {
  document.getElementById(id).textContent = text;
};
