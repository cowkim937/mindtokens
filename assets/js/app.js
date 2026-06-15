// Main UI controller. It wires input, mindmap clicks, i18n, metrics, copy, reset, and Firestore save.
import { i18n, getText } from "./i18n.js";
import { extractKeywords, detectLanguage } from "./keyword.js";
import { renderMindmap, renderEmptyMindmap } from "./mindmap.js";
import { calculateMetrics } from "./tokenizer.js";
import { savePromptSession } from "./firebase.js";

const state = {
  language: "en",
  originalPrompt: "",
  extractedKeywords: [],
  selectedKeywords: [],
  expandedMap: {},
  maxDepth: 0,
  metrics: calculateMetrics("", "", [], 0)
};

const els = {
  languageSelect: document.getElementById("languageSelect"),
  promptInput: document.getElementById("promptInput"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  resetBtn: document.getElementById("resetBtn"),
  copyBtn: document.getElementById("copyBtn"),
  saveBtn: document.getElementById("saveBtn"),
  statusMessage: document.getElementById("statusMessage"),
  mindmap: document.getElementById("mindmap"),
  keywordCount: document.getElementById("keywordCount"),
  selectedKeywords: document.getElementById("selectedKeywords"),
  optimizedPrompt: document.getElementById("optimizedPrompt"),
  originalTokens: document.getElementById("originalTokens"),
  optimizedTokens: document.getElementById("optimizedTokens"),
  addedTokens: document.getElementById("addedTokens"),
  expansionRatio: document.getElementById("expansionRatio"),
  detailScore: document.getElementById("detailScore")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyLanguage(state.language);
  renderEmptyMindmap(els.mindmap, getText(state.language, "emptyMindmap"));
  bindEvents();
}

function bindEvents() {
  els.languageSelect.addEventListener("change", () => applyLanguage(els.languageSelect.value));
  els.analyzeBtn.addEventListener("click", analyzePrompt);
  els.resetBtn.addEventListener("click", resetApp);
  els.copyBtn.addEventListener("click", copyOptimizedPrompt);
  els.saveBtn.addEventListener("click", saveSession);
  window.addEventListener("resize", () => renderCurrentMindmap());
}

function applyLanguage(language) {
  state.language = language;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  els.languageSelect.value = language;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = getText(language, el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", getText(language, el.dataset.i18nPlaceholder));
  });

  if (!state.extractedKeywords.length) {
    renderEmptyMindmap(els.mindmap, getText(language, "emptyMindmap"));
  } else {
    renderCurrentMindmap();
  }
}

function analyzePrompt() {
  const prompt = els.promptInput.value.trim();
  if (!prompt) {
    showStatus("promptRequired", "error");
    return;
  }

  state.originalPrompt = prompt;
  state.extractedKeywords = extractKeywords(prompt);
  state.selectedKeywords = [];
  state.expandedMap = {};
  state.maxDepth = 1;

  const detected = detectLanguage(prompt);
  if (i18n[detected]) {
    applyLanguage(detected);
  }

  renderSelectedKeywords();
  renderCurrentMindmap();
  updateOptimizedPrompt();
  showStatus("analyzed", "success");
}

function renderCurrentMindmap() {
  if (!state.extractedKeywords.length) {
    renderEmptyMindmap(els.mindmap, getText(state.language, "emptyMindmap"));
    return;
  }

  els.keywordCount.textContent = state.extractedKeywords.length;
  renderMindmap({
    container: els.mindmap,
    prompt: state.originalPrompt,
    keywords: state.extractedKeywords,
    language: state.language,
    expandedMap: state.expandedMap,
    onNodeSelect: addSelectedKeyword,
    onExpand: expandNode
  });
}

function expandNode(key, type) {
  state.expandedMap[key] = true;
  state.maxDepth = Math.max(state.maxDepth, type === "expansion" ? 3 : 2);
  renderCurrentMindmap();
  updateOptimizedPrompt();
}

function addSelectedKeyword(keyword, depth) {
  const clean = String(keyword || "").trim();
  if (!clean) return;
  if (!state.selectedKeywords.includes(clean)) {
    state.selectedKeywords.push(clean);
  }
  state.maxDepth = Math.max(state.maxDepth, depth);
  renderSelectedKeywords();
  updateOptimizedPrompt();
}

function removeSelectedKeyword(keyword) {
  state.selectedKeywords = state.selectedKeywords.filter((item) => item !== keyword);
  renderSelectedKeywords();
  updateOptimizedPrompt();
}

function renderSelectedKeywords() {
  els.selectedKeywords.innerHTML = "";
  if (!state.selectedKeywords.length) {
    const empty = document.createElement("span");
    empty.className = "text-muted small";
    empty.textContent = `${getText(state.language, "selected")}: 0`;
    els.selectedKeywords.appendChild(empty);
    return;
  }

  state.selectedKeywords.forEach((keyword) => {
    const pill = document.createElement("span");
    pill.className = "keyword-pill";
    pill.textContent = keyword;
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Remove ${keyword}`);
    button.textContent = "x";
    button.addEventListener("click", () => removeSelectedKeyword(keyword));
    pill.appendChild(button);
    els.selectedKeywords.appendChild(pill);
  });
}

function buildOptimizedPrompt() {
  const selected = state.selectedKeywords.join(", ");
  if (!state.originalPrompt) return "";
  if (!selected) return state.originalPrompt;

  if (state.language === "ko") {
    return `${state.originalPrompt}\n\n다음 요소를 반영해 더 구체적으로 작성하세요: ${selected}.\n결과는 명확한 구조, 실행 가능한 단계, 필요한 제약조건, 품질 기준을 포함해야 합니다.`;
  }

  return `${state.originalPrompt}\n\nRefine the prompt with these selected details: ${selected}.\nInclude clear structure, actionable steps, relevant constraints, quality criteria, and an appropriate output format.`;
}

function updateOptimizedPrompt() {
  const optimized = buildOptimizedPrompt();
  els.optimizedPrompt.value = optimized;
  state.metrics = calculateMetrics(state.originalPrompt, optimized, state.selectedKeywords, state.maxDepth);
  els.originalTokens.textContent = state.metrics.estimatedOriginalTokens;
  els.optimizedTokens.textContent = state.metrics.estimatedOptimizedTokens;
  els.addedTokens.textContent = state.metrics.addedTokens;
  els.expansionRatio.textContent = `${state.metrics.expansionRatio}%`;
  els.detailScore.textContent = state.metrics.detailScore;
}

async function copyOptimizedPrompt() {
  if (!els.optimizedPrompt.value.trim()) {
    showStatus("copyFailed", "error");
    return;
  }
  await navigator.clipboard.writeText(els.optimizedPrompt.value);
  showStatus("copied", "success");
}

async function saveSession() {
  if (!state.originalPrompt) {
    showStatus("promptRequired", "error");
    return;
  }

  try {
    await savePromptSession({
      originalPrompt: state.originalPrompt,
      optimizedPrompt: els.optimizedPrompt.value,
      language: state.language,
      extractedKeywords: state.extractedKeywords,
      selectedKeywords: state.selectedKeywords,
      estimatedOriginalTokens: state.metrics.estimatedOriginalTokens,
      estimatedOptimizedTokens: state.metrics.estimatedOptimizedTokens,
      detailScore: state.metrics.detailScore
    });
    showStatus("saveSuccess", "success");
  } catch (error) {
    console.error(error);
    showStatus("saveFailed", "error");
  }
}

function resetApp() {
  state.originalPrompt = "";
  state.extractedKeywords = [];
  state.selectedKeywords = [];
  state.expandedMap = {};
  state.maxDepth = 0;
  els.promptInput.value = "";
  els.keywordCount.textContent = "0";
  renderSelectedKeywords();
  updateOptimizedPrompt();
  renderEmptyMindmap(els.mindmap, getText(state.language, "emptyMindmap"));
  showStatus("resetDone", "success");
}

function showStatus(key, type) {
  els.statusMessage.className = `status-message mt-3 ${type}`;
  els.statusMessage.textContent = getText(state.language, key);
}
