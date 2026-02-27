export interface SeoCheck {
  id: string;
  label: string;
  status: "good" | "warning" | "bad";
  message: string;
  score: number; // 0-10 contribution
}

export interface SeoAnalysis {
  checks: SeoCheck[];
  score: number; // 0-100
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Flesch Reading Ease score (English only)
 * 90-100: Very easy, 60-70: Standard, 0-30: Very difficult
 */
function fleschReadingEase(text: string): number {
  const words = countWords(text);
  if (words < 10) return -1; // too short to analyze
  const sentences = countSentences(text);
  const syllables = text
    .split(/\s+/)
    .filter(Boolean)
    .reduce((sum, w) => sum + countSyllables(w), 0);

  const score =
    206.835 -
    1.015 * (words / sentences) -
    84.6 * (syllables / words);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function keywordDensity(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const words = countWords(text);
  if (words === 0) return 0;
  const kw = keyword.toLowerCase();
  const textLower = text.toLowerCase();
  const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
  const matches = textLower.match(regex);
  const count = matches ? matches.length : 0;
  return (count / words) * 100;
}

export function analyzeSeo(params: {
  title: string;
  metaTitle: string;
  metaDesc: string;
  content: string; // HTML
  focusKeyword: string;
  slug: string;
  isEnglish: boolean;
}): SeoAnalysis {
  const { title, metaTitle, metaDesc, content, focusKeyword, slug, isEnglish } =
    params;
  const plainContent = stripHtml(content);
  const wordCount = countWords(plainContent);
  const checks: SeoCheck[] = [];

  // 1. Focus keyword present
  if (focusKeyword.trim()) {
    checks.push({
      id: "keyword-set",
      label: "Focus keyword",
      status: "good",
      message: `Focus keyword: "${focusKeyword}"`,
      score: 5,
    });
  } else {
    checks.push({
      id: "keyword-set",
      label: "Focus keyword",
      status: "bad",
      message: "No focus keyword set",
      score: 0,
    });
  }

  // 2. Keyword in title
  if (focusKeyword.trim()) {
    const inTitle = title.toLowerCase().includes(focusKeyword.toLowerCase());
    checks.push({
      id: "keyword-title",
      label: "Keyword in title",
      status: inTitle ? "good" : "warning",
      message: inTitle
        ? "Focus keyword found in title"
        : "Focus keyword not found in title",
      score: inTitle ? 10 : 3,
    });
  }

  // 3. Keyword in slug
  if (focusKeyword.trim() && slug) {
    const kwSlug = focusKeyword.toLowerCase().replace(/\s+/g, "-");
    const inSlug = slug.toLowerCase().includes(kwSlug);
    checks.push({
      id: "keyword-slug",
      label: "Keyword in URL",
      status: inSlug ? "good" : "warning",
      message: inSlug
        ? "Focus keyword found in slug"
        : "Focus keyword not found in slug",
      score: inSlug ? 10 : 3,
    });
  }

  // 4. Keyword in meta description
  if (focusKeyword.trim() && metaDesc) {
    const inMeta = metaDesc.toLowerCase().includes(focusKeyword.toLowerCase());
    checks.push({
      id: "keyword-meta",
      label: "Keyword in meta description",
      status: inMeta ? "good" : "warning",
      message: inMeta
        ? "Focus keyword found in meta description"
        : "Focus keyword not in meta description",
      score: inMeta ? 10 : 3,
    });
  }

  // 5. Keyword density
  if (focusKeyword.trim() && wordCount > 0) {
    const density = keywordDensity(plainContent, focusKeyword);
    let status: SeoCheck["status"] = "good";
    let message: string;
    let score: number;

    if (density === 0) {
      status = "bad";
      message = "Focus keyword not found in content";
      score = 0;
    } else if (density < 0.5) {
      status = "warning";
      message = `Keyword density: ${density.toFixed(1)}% (low, aim for 1-2%)`;
      score = 5;
    } else if (density <= 3) {
      status = "good";
      message = `Keyword density: ${density.toFixed(1)}% (good)`;
      score = 10;
    } else {
      status = "warning";
      message = `Keyword density: ${density.toFixed(1)}% (too high, may be seen as keyword stuffing)`;
      score = 4;
    }

    checks.push({ id: "keyword-density", label: "Keyword density", status, message, score });
  }

  // 6. Meta title length
  const effectiveTitle = metaTitle || title;
  if (effectiveTitle) {
    const len = effectiveTitle.length;
    let status: SeoCheck["status"];
    let message: string;
    let score: number;

    if (len >= 30 && len <= 60) {
      status = "good";
      message = `Meta title length: ${len} chars (good)`;
      score = 10;
    } else if (len > 0 && len < 30) {
      status = "warning";
      message = `Meta title length: ${len} chars (too short, aim for 30-60)`;
      score = 5;
    } else if (len > 60) {
      status = "warning";
      message = `Meta title length: ${len} chars (too long, may be truncated)`;
      score = 5;
    } else {
      status = "bad";
      message = "No title set";
      score = 0;
    }

    checks.push({ id: "title-length", label: "Title length", status, message, score });
  }

  // 7. Meta description length
  if (metaDesc) {
    const len = metaDesc.length;
    let status: SeoCheck["status"];
    let message: string;
    let score: number;

    if (len >= 120 && len <= 160) {
      status = "good";
      message = `Meta description: ${len} chars (good)`;
      score = 10;
    } else if (len > 0 && len < 120) {
      status = "warning";
      message = `Meta description: ${len} chars (short, aim for 120-160)`;
      score = 5;
    } else if (len > 160) {
      status = "warning";
      message = `Meta description: ${len} chars (may be truncated)`;
      score = 5;
    } else {
      status = "bad";
      message = "No meta description";
      score = 0;
    }

    checks.push({ id: "meta-desc-length", label: "Description length", status, message, score });
  } else {
    checks.push({
      id: "meta-desc-length",
      label: "Description length",
      status: "bad",
      message: "No meta description set",
      score: 0,
    });
  }

  // 8. Content length
  {
    let status: SeoCheck["status"];
    let message: string;
    let score: number;

    if (wordCount >= 300) {
      status = "good";
      message = `Content length: ${wordCount} words (good)`;
      score = 10;
    } else if (wordCount >= 100) {
      status = "warning";
      message = `Content length: ${wordCount} words (aim for 300+)`;
      score = 5;
    } else {
      status = "bad";
      message = `Content length: ${wordCount} words (too short)`;
      score = 0;
    }

    checks.push({ id: "content-length", label: "Content length", status, message, score });
  }

  // 9. Readability (English only)
  if (isEnglish && wordCount >= 10) {
    const fre = fleschReadingEase(plainContent);
    if (fre >= 0) {
      let status: SeoCheck["status"];
      let message: string;
      let score: number;

      if (fre >= 60) {
        status = "good";
        message = `Readability: ${fre}/100 (easy to read)`;
        score = 10;
      } else if (fre >= 30) {
        status = "warning";
        message = `Readability: ${fre}/100 (somewhat difficult)`;
        score = 5;
      } else {
        status = "bad";
        message = `Readability: ${fre}/100 (difficult to read)`;
        score = 2;
      }

      checks.push({ id: "readability", label: "Readability", status, message, score });
    }
  }

  // 10. Has images in content
  {
    const hasImages = /<img\s/i.test(content);
    checks.push({
      id: "has-images",
      label: "Images",
      status: hasImages ? "good" : "warning",
      message: hasImages ? "Content includes images" : "No images in content",
      score: hasImages ? 5 : 2,
    });
  }

  // Calculate overall score (normalize to 0-100)
  const maxPossible = checks.length * 10;
  const actual = checks.reduce((sum, c) => sum + c.score, 0);
  const score = maxPossible > 0 ? Math.round((actual / maxPossible) * 100) : 0;

  return { checks, score };
}
