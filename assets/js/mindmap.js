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
  const viewport = createSvg("g", { class: "mindmap-viewport" });
  addDragPan(svg, viewport);

  const rootLabel = keywords[0] || summarizePrompt(prompt);
  drawNode(viewport, centerX, centerY, 74, rootLabel, "node-root", () => onNodeSelect(rootLabel, 0));

  const keywordRadius = Math.min(width, height) * 0.31;
  keywords.slice(1).forEach((keyword, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(keywords.length, 1) - Math.PI / 2;
    const x = clamp(centerX + Math.cos(angle) * keywordRadius, 70, width - 70);
    const y = clamp(centerY + Math.sin(angle) * keywordRadius, 70, height - 70);
    drawLine(viewport, centerX, centerY, x, y);
    drawNode(viewport, x, y, 48, keyword, "node-keyword", () => {
      onNodeSelect(keyword, 1);
      onExpand(keyword, "keyword");
    });

    if (expandedMap[keyword]) {
      drawExpansions(viewport, svg, keyword, x, y, angle, language, expandedMap, onNodeSelect, onExpand);
    }
  });

  svg.appendChild(viewport);
  container.appendChild(svg);
}

function drawExpansions(viewport, svg, keyword, parentX, parentY, baseAngle, language, expandedMap, onNodeSelect, onExpand) {
  const expansions = getExpansions(keyword, language).slice(0, 5);
  expansions.forEach((expansion, index) => {
    const spread = (index - (expansions.length - 1) / 2) * 0.32;
    const angle = baseAngle + spread;
    const x = clamp(parentX + Math.cos(angle) * 118, 62, Number(svg.getAttribute("viewBox").split(" ")[2]) - 62);
    const y = clamp(parentY + Math.sin(angle) * 88, 62, Number(svg.getAttribute("viewBox").split(" ")[3]) - 62);
    drawLine(viewport, parentX, parentY, x, y);
    drawNode(viewport, x, y, 38, expansion, "node-expansion", () => {
      onNodeSelect(expansion, 2);
      onExpand(`${keyword}::${expansion}`, "expansion");
    });

    if (expandedMap[`${keyword}::${expansion}`]) {
      getDetails(expansion, language).slice(0, 3).forEach((detail, detailIndex) => {
        const detailAngle = angle + (detailIndex - 1) * 0.22;
        const dx = clamp(x + Math.cos(detailAngle) * 96, 48, Number(svg.getAttribute("viewBox").split(" ")[2]) - 48);
        const dy = clamp(y + Math.sin(detailAngle) * 70, 48, Number(svg.getAttribute("viewBox").split(" ")[3]) - 48);
        drawLine(viewport, x, y, dx, dy);
        drawNode(viewport, dx, dy, 30, detail, "node-detail", () => onNodeSelect(detail, 3));
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

function addDragPan(svg, viewport) {
  const pan = { active: false, startX: 0, startY: 0, x: 0, y: 0 };
  const apply = () => viewport.setAttribute("transform", `translate(${pan.x} ${pan.y})`);

  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pan.active = true;
    pan.startX = event.clientX - pan.x;
    pan.startY = event.clientY - pan.y;
    svg.setPointerCapture(event.pointerId);
    svg.classList.add("is-dragging");
  });

  svg.addEventListener("pointermove", (event) => {
    if (!pan.active) return;
    pan.x = event.clientX - pan.startX;
    pan.y = event.clientY - pan.startY;
    apply();
  });

  svg.addEventListener("pointerup", (event) => {
    pan.active = false;
    svg.releasePointerCapture(event.pointerId);
    svg.classList.remove("is-dragging");
  });

  svg.addEventListener("pointerleave", () => {
    pan.active = false;
    svg.classList.remove("is-dragging");
  });
}
