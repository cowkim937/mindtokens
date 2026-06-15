// SVG mindmap renderer. It keeps all nodes as textContent to avoid HTML injection.
import { getExpansions, getDetails } from "./keyword.js";

export function renderEmptyMindmap(container, message) {
  container.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "mindmap-empty";
  empty.textContent = message;
  container.appendChild(empty);
}

export function renderMindmap(options) {
  const { container, prompt, keywords, language, expandedMap, onNodeSelect, onExpand } = options;
  container.innerHTML = "";

  const width = Math.max(container.clientWidth, 640);
  const height = Math.max(container.clientHeight, 420);
  const centerX = width / 2;
  const centerY = height / 2;
  const svg = createSvg("svg", { class: "mindmap-svg", viewBox: `0 0 ${width} ${height}`, role: "img" });

  const rootLabel = summarizePrompt(prompt);
  drawNode(svg, centerX, centerY, 74, rootLabel, "node-root", () => onNodeSelect(rootLabel, 0));

  const keywordRadius = Math.min(width, height) * 0.31;
  keywords.forEach((keyword, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(keywords.length, 1) - Math.PI / 2;
    const x = clamp(centerX + Math.cos(angle) * keywordRadius, 70, width - 70);
    const y = clamp(centerY + Math.sin(angle) * keywordRadius, 70, height - 70);
    drawLine(svg, centerX, centerY, x, y);
    drawNode(svg, x, y, 48, keyword, "node-keyword", () => {
      onNodeSelect(keyword, 1);
      onExpand(keyword, "keyword");
    });

    if (expandedMap[keyword]) {
      drawExpansions(svg, keyword, x, y, angle, language, expandedMap, onNodeSelect, onExpand);
    }
  });

  container.appendChild(svg);
}

function drawExpansions(svg, keyword, parentX, parentY, baseAngle, language, expandedMap, onNodeSelect, onExpand) {
  const expansions = getExpansions(keyword, language).slice(0, 5);
  expansions.forEach((expansion, index) => {
    const spread = (index - (expansions.length - 1) / 2) * 0.32;
    const angle = baseAngle + spread;
    const x = clamp(parentX + Math.cos(angle) * 118, 62, Number(svg.getAttribute("viewBox").split(" ")[2]) - 62);
    const y = clamp(parentY + Math.sin(angle) * 88, 62, Number(svg.getAttribute("viewBox").split(" ")[3]) - 62);
    drawLine(svg, parentX, parentY, x, y);
    drawNode(svg, x, y, 38, expansion, "node-expansion", () => {
      onNodeSelect(expansion, 2);
      onExpand(`${keyword}::${expansion}`, "expansion");
    });

    if (expandedMap[`${keyword}::${expansion}`]) {
      getDetails(expansion, language).slice(0, 3).forEach((detail, detailIndex) => {
        const detailAngle = angle + (detailIndex - 1) * 0.22;
        const dx = clamp(x + Math.cos(detailAngle) * 96, 48, Number(svg.getAttribute("viewBox").split(" ")[2]) - 48);
        const dy = clamp(y + Math.sin(detailAngle) * 70, 48, Number(svg.getAttribute("viewBox").split(" ")[3]) - 48);
        drawLine(svg, x, y, dx, dy);
        drawNode(svg, dx, dy, 30, detail, "node-detail", () => onNodeSelect(detail, 3));
      });
    }
  });
}

function summarizePrompt(prompt) {
  const cleaned = (prompt || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Prompt";
  return cleaned.length > 38 ? `${cleaned.slice(0, 35)}...` : cleaned;
}

function drawLine(svg, x1, y1, x2, y2) {
  svg.appendChild(createSvg("line", { x1, y1, x2, y2, class: "mindmap-link" }));
}

function drawNode(svg, x, y, radius, label, className, handler) {
  const group = createSvg("g", { class: `mindmap-node ${className}`, tabindex: "0" });
  group.appendChild(createSvg("circle", { cx: x, cy: y, r: radius, strokeWidth: 2 }));
  const text = createSvg("text", { x, y, textAnchor: "middle", dominantBaseline: "middle" });
  text.textContent = compactLabel(label);
  group.appendChild(text);
  group.addEventListener("click", handler);
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") handler();
  });
  svg.appendChild(group);
}

function compactLabel(label) {
  const clean = String(label || "").trim();
  return clean.length > 22 ? `${clean.slice(0, 19)}...` : clean;
}

function createSvg(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.keys(attrs || {}).forEach((key) => el.setAttribute(key, attrs[key]));
  return el;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
