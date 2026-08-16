import fs from "node:fs";
import path from "node:path";

export const PAGE_PATTERN_IDS = Object.freeze([
  "access",
  "dashboard",
  "onboarding",
  "scheduling",
  "search",
  "settings",
  "support",
  "system",
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceAttribute(element, attribute, value) {
  const escaped = escapeAttribute(value);
  const attributePattern = new RegExp(`\\s${escapeRegExp(attribute)}=(["'])[^"']*\\1`, "u");
  if (attributePattern.test(element)) {
    return element.replace(attributePattern, ` ${attribute}="${escaped}"`);
  }
  return element.replace(/\s*\/?>$/u, (ending) => ` ${attribute}="${escaped}"${ending}`);
}

function replaceKeyedText(source, key, value) {
  const pattern = new RegExp(
    `(<([a-z][a-z0-9:-]*)\\b(?=[^>]*\\bdata-i18n=(["'])${escapeRegExp(key)}\\3)[^>]*>)[\\s\\S]*?(<\\/\\2>)`,
    "giu",
  );
  return source.replace(pattern, `$1${escapeText(value)}$4`);
}

function replaceKeyedAttribute(source, key, marker, attribute, value) {
  const pattern = new RegExp(
    `<[^>]+\\b${escapeRegExp(marker)}=(["'])${escapeRegExp(key)}\\1[^>]*>`,
    "giu",
  );
  return source.replace(pattern, (element) => replaceAttribute(element, attribute, value));
}

export function readPagePatternChineseLocale(root) {
  const localePath = path.join(root, "examples", "page-patterns", "locale.zh-CN.json");
  return JSON.parse(fs.readFileSync(localePath, "utf8"));
}

export function pagePatternChineseDictionary(locale, id) {
  return Object.freeze({
    ...(locale.common ?? {}),
    ...(locale.pages?.[id] ?? {}),
  });
}

export function materializePagePatternChineseSource({ source, id, locale }) {
  const dictionary = pagePatternChineseDictionary(locale, id);
  let output = source;

  if (dictionary["meta.title"]) {
    output = output.replace(/<title>[\s\S]*?<\/title>/iu, `<title>${escapeText(dictionary["meta.title"])}</title>`);
  }

  for (const [key, value] of Object.entries(dictionary)) {
    output = replaceKeyedText(output, key, value);
    output = replaceKeyedAttribute(output, key, "data-i18n-placeholder", "placeholder", value);
    output = replaceKeyedAttribute(output, key, "data-i18n-aria", "aria-label", value);
  }

  return output;
}

export function materializePagePatternChineseFiles({ root, directory, write = true }) {
  const locale = readPagePatternChineseLocale(root);
  const changes = [];

  for (const id of PAGE_PATTERN_IDS) {
    const file = path.join(directory, `${id}.html`);
    const source = fs.readFileSync(file, "utf8");
    const output = materializePagePatternChineseSource({ source, id, locale });
    if (output === source) continue;
    changes.push(path.relative(root, file).replaceAll(path.sep, "/"));
    if (write) fs.writeFileSync(file, output, "utf8");
  }

  return Object.freeze(changes);
}
