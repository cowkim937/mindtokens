// Keyword extraction and deterministic expansion rules. No external AI API is called.
const stopwords = new Set([
  "the", "and", "for", "with", "that", "this", "from", "you", "your", "are", "was", "were", "will", "can", "into", "about",
  "create", "make", "write", "please", "using", "use", "how", "what", "when", "where", "why", "who", "to", "of", "in", "on",
  "a", "an", "is", "it", "as", "by", "be", "or", "at", "if", "then", "also", "very", "just", "more", "most", "not", "so",
  "그리고", "그러나", "하지만", "또는", "또한", "즉", "그래서", "따라서", "매우", "너무", "아주", "잘", "더", "가장", "에서", "으로", "에게",
  "하는", "하고", "이다", "있는", "없는", "위한", "대한", "사용", "작성", "만들어", "해주세요", "해줘", "관련", "통해", "위해",
  "です", "ます", "する", "これ", "それ", "ため", "そして", "しかし", "また", "请", "一个", "这个", "使用", "以及", "但是",
  "для", "что", "как", "или", "avec", "pour", "et", "mais", "und", "oder", "con", "para", "pero", "och", "eller", "maar"
]);

const koreanParticlePattern = /(으로서|으로써|에게서|에서|에게|으로|부터|까지|처럼|보다|마다|밖에|조차|마저|께서|한테|라도|이나|거나|하고|이며|이랑|랑|은|는|이|가|을|를|에|의|와|과|도|만|로)$/;
const koreanAdverbPattern = /게$|히$|도록$/;

const englishExpansionMap = {
  marketing: ["target audience", "conversion", "headline", "landing page", "emotional trigger", "call to action", "brand tone"],
  content: ["reader intent", "outline", "hook", "examples", "voice", "SEO angle", "publishing format"],
  design: ["layout", "visual hierarchy", "color system", "accessibility", "responsive state", "interaction pattern"],
  data: ["source quality", "schema", "comparison", "metric", "trend", "validation", "summary"],
  product: ["user segment", "value proposition", "feature scope", "pricing context", "success metric", "onboarding"],
  code: ["architecture", "edge cases", "tests", "security", "performance", "documentation"]
};

const categoryWords = {
  en: ["goal", "audience", "context", "format", "constraints", "style", "quality criteria", "output format"],
  ko: ["목적", "대상", "맥락", "형식", "제약조건", "스타일", "품질 기준", "출력 형식"]
};

const detailWords = {
  en: ["specific", "measurable", "step-by-step", "with examples", "concise", "actionable"],
  ko: ["구체적으로", "측정 가능하게", "단계별로", "예시 포함", "간결하게", "실행 가능하게"]
};

export function detectLanguage(text) {
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u3040-\u30ff]/.test(text)) return "ja";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh-CN";
  if (/[а-яё]/i.test(text)) return "ru";
  return "en";
}

export function extractKeywords(text) {
  const tokens = (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean)
    .filter((token) => !stopwords.has(token))
    .filter((token) => /[a-z]/i.test(token) ? token.length >= 3 : token.length >= 2);

  const scores = new Map();
  tokens.forEach((token, index) => {
    const current = scores.get(token) || { word: token, count: 0, firstIndex: index };
    current.count += 1;
    current.score = current.count * 10 + Math.min(token.length, 14);
    scores.set(token, current);
  });

  return Array.from(scores.values())
    .sort((a, b) => a.firstIndex - b.firstIndex || b.score - a.score)
    .slice(0, 20)
    .map((item) => item.word);
}

function normalizeWord(token) {
  let word = token.replace(/^-+|-+$/g, "");
  if (/[\uac00-\ud7af]/.test(word)) {
    word = word.replace(koreanParticlePattern, "");
    if (koreanAdverbPattern.test(word)) return "";
  }
  return word;
}

export function getExpansions(keyword, language) {
  const normalized = keyword.toLowerCase();
  const isKorean = language === "ko" || /[\uac00-\ud7af]/.test(keyword);
  const categories = isKorean ? categoryWords.ko : categoryWords.en;

  if (!isKorean && englishExpansionMap[normalized]) {
    return englishExpansionMap[normalized];
  }

  if (isKorean) {
    return categories.map((category) => `${keyword} ${category}`).slice(0, 8);
  }

  return categories.map((category) => `${keyword} ${category}`).slice(0, 8);
}

export function getDetails(expansion, language) {
  const isKorean = language === "ko" || /[\uac00-\ud7af]/.test(expansion);
  const details = isKorean ? detailWords.ko : detailWords.en;
  return details.slice(0, 4).map((detail) => `${expansion} ${detail}`);
}
