// Lightweight token estimation. It is intentionally approximate because no tokenizer API is used.
export function estimateTokens(text) {
  const value = (text || "").trim();
  if (!value) return 0;

  const cjkCount = (value.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length;
  const latinWords = (value.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:[-'][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/g) || []).length;
  const totalChars = value.replace(/\s/g, "").length;

  if (cjkCount > totalChars * 0.6) return Math.ceil(totalChars / 1.6);
  if (latinWords > 0 && cjkCount < totalChars * 0.15) return Math.ceil(latinWords * 1.3);
  return Math.ceil(totalChars / 3 + latinWords * 0.7);
}

export function calculateMetrics(originalPrompt, optimizedPrompt, selectedKeywords, mindmapDepth) {
  const estimatedOriginalTokens = estimateTokens(originalPrompt);
  const estimatedOptimizedTokens = estimateTokens(optimizedPrompt);
  const addedTokens = Math.max(0, estimatedOptimizedTokens - estimatedOriginalTokens);
  const expansionRatio = estimatedOriginalTokens
    ? Math.round((estimatedOptimizedTokens / estimatedOriginalTokens) * 100)
    : 0;
  const outputConstraintCount = selectedKeywords.filter((word) => {
    const lower = word.toLowerCase();
    return lower.includes("format") || lower.includes("constraint") || lower.includes("output") ||
      lower.includes("제약") || lower.includes("출력") || lower.includes("형식");
  }).length;
  const detailScore = selectedKeywords.length * 10 + mindmapDepth * 15 + outputConstraintCount * 20;

  return {
    estimatedOriginalTokens,
    estimatedOptimizedTokens,
    addedTokens,
    expansionRatio,
    detailScore
  };
}
