import { canonicalizeText } from "./canonical-content.mjs";

function markdownLines(source) {
  const text = canonicalizeText(source);
  const lines = [];
  let offset = 0;
  for (const match of text.matchAll(/.*(?:\n|$)/g)) {
    if (match[0] === "") continue;
    lines.push({ text: match[0], start: offset, end: offset + match[0].length });
    offset += match[0].length;
  }
  return { text, lines };
}

export function extractExactSection(source, expectedHeading) {
  const { text, lines } = markdownLines(source);
  const headings = [];
  let fence = null;

  for (const line of lines) {
    const content = line.text.replace(/\n$/, "");
    if (fence !== null) {
      const closing = content.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (closing && closing[1][0] === fence.marker && closing[1].length >= fence.length) fence = null;
      continue;
    }
    const opening = content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (opening) {
      const marker = opening[1][0];
      if (marker === "~" || !opening[2].includes("`")) fence = { marker, length: opening[1].length };
      continue;
    }
    const match = content.match(/^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (!match) continue;
    headings.push({ level: match[1].length, heading: match[2], start: line.start });
  }

  const matches = headings.filter((item) => item.heading === expectedHeading);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one heading '${expectedHeading}', found ${matches.length}`);
  }
  const selected = matches[0];
  const selectedIndex = headings.indexOf(selected);
  const next = headings.slice(selectedIndex + 1).find((item) => item.level <= selected.level);
  return text.slice(selected.start, next?.start ?? text.length);
}
