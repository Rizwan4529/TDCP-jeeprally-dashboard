/**
 * Turns the category consent HTML into plain blocks the PDF renderer can
 * draw (it cannot render HTML). Keeps headings, paragraphs, list items,
 * line breaks and bold text; everything else becomes plain text.
 */
export type ConsentSegment = { text: string; bold?: boolean };

export type ConsentBlock = {
  kind: "heading" | "paragraph" | "listItem";
  /** List marker, e.g. "•" or "3." */
  marker?: string;
  segments: ConsentSegment[];
};

const BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "SECTION",
  "ARTICLE",
  "BLOCKQUOTE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "TR",
]);
const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const BOLD_TAGS = new Set(["STRONG", "B"]);

function normalizeSegments(segments: ConsentSegment[]): ConsentSegment[] {
  const merged: ConsentSegment[] = [];
  for (const seg of segments) {
    const text = seg.text.replace(/[ \t\r\f\v]+/g, " ");
    if (!text) continue;
    const last = merged[merged.length - 1];
    if (last && Boolean(last.bold) === Boolean(seg.bold)) last.text += text;
    else merged.push({ text, bold: seg.bold });
  }
  // Trim the block edges and around line breaks.
  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^\s+/, "");
    const end = merged[merged.length - 1];
    end.text = end.text.replace(/\s+$/, "");
  }
  for (const seg of merged) seg.text = seg.text.replace(/ *\n */g, "\n");
  return merged.filter((seg) => seg.text);
}

function parseWithDom(html: string): ConsentBlock[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks: ConsentBlock[] = [];
  let current: ConsentSegment[] = [];
  let currentKind: ConsentBlock["kind"] = "paragraph";
  let currentMarker: string | undefined;

  const flush = () => {
    const segments = normalizeSegments(current);
    if (segments.length) {
      blocks.push({ kind: currentKind, marker: currentMarker, segments });
    }
    current = [];
    currentKind = "paragraph";
    currentMarker = undefined;
  };

  const walk = (node: Node, bold: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      current.push({ text: node.textContent ?? "", bold });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    if (tag === "BR") {
      current.push({ text: "\n", bold });
      return;
    }

    const isBlock = BLOCK_TAGS.has(tag);
    if (isBlock) flush();
    if (HEADING_TAGS.has(tag)) currentKind = "heading";
    if (tag === "LI") {
      currentKind = "listItem";
      const list = el.parentElement;
      if (list?.tagName === "OL") {
        const index = Array.from(list.children).indexOf(el);
        const start = Number(list.getAttribute("start") ?? "1") || 1;
        currentMarker = `${start + index}.`;
      } else {
        currentMarker = "•";
      }
    }

    const childBold = bold || BOLD_TAGS.has(tag) || HEADING_TAGS.has(tag);
    el.childNodes.forEach((child) => walk(child, childBold));
    if (isBlock) flush();
  };

  doc.body.childNodes.forEach((child) => walk(child, false));
  flush();
  return blocks;
}

/** Fallback without a DOM (e.g. server-side tests): text paragraphs only. */
function parseWithoutDom(html: string): ConsentBlock[] {
  const decoded = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return decoded
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ kind: "paragraph" as const, segments: [{ text: p }] }));
}

export function consentHtmlToBlocks(html: string | null | undefined): ConsentBlock[] {
  const trimmed = html?.trim() ?? "";
  if (!trimmed) return [];
  return typeof DOMParser === "undefined"
    ? parseWithoutDom(trimmed)
    : parseWithDom(trimmed);
}
