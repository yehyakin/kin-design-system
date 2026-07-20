const RAW_HTML = /(?:<\s*\/?\s*[A-Za-z][^>]*>|<!--|-->)/u;
const DANGEROUS_URI = /(?:\]\(|<)\s*(?:javascript|data|vbscript|file):/iu;
const EXECUTABLE_COMMAND = /\b(?:npm|pnpm|yarn|npx|bun|pip3?|python3?|node|bash|zsh|pwsh|powershell|cmd|curl|wget)\s+(?:i|install|add|exec|run|dlx|x|eval|invoke|download|fetch)\b/iu;
const PROMPT_OVERRIDE = /(?:ignore|disregard|override)\s+(?:all\s+)?(?:previous|prior|system|developer)(?:\s+(?:system|developer))?\s+(?:instructions?|rules?|prompts?)|(?:忽略|覆盖|绕过).{0,20}(?:之前|系统|开发者|规则|指令|提示)/iu;
const SECRET = /(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\$\{\{\s*secrets\.|process\.env\.|\$env:|(?:password|passwd|secret|token)\s*[:=]\s*[^\s"']+)/iu;
const LOCAL_PATH = /(?:[A-Za-z]:\\{1,2}[A-Za-z0-9._ -]+\\{1,2}|file:\/\/|(?:^|["'\s])\\{2,4}[A-Za-z0-9][A-Za-z0-9._-]*\\{1,2}[A-Za-z0-9._-]+)/u;

export function findUnsafeLocaleText(value, label = "locale text") {
  const findings = [];
  if (typeof value !== "string") return [`${label}: expected a string`];
  if (/[\r\n\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) findings.push(`${label}: control characters or line breaks are not allowed`);
  if (RAW_HTML.test(value)) findings.push(`${label}: raw HTML is not allowed`);
  if (DANGEROUS_URI.test(value)) findings.push(`${label}: executable or local URI is not allowed`);
  if (EXECUTABLE_COMMAND.test(value)) findings.push(`${label}: executable install or command instruction is not allowed`);
  if (PROMPT_OVERRIDE.test(value)) findings.push(`${label}: prompt-override language is not allowed`);
  if (SECRET.test(value)) findings.push(`${label}: secret-like content is not allowed`);
  if (LOCAL_PATH.test(value)) findings.push(`${label}: local absolute paths are not allowed`);
  return findings;
}

export function validateLocaleRecord(record, locale) {
  const findings = [];
  const values = [
    ["heading", record.heading],
    ["summary", record.summary],
    ...record.do.map((value, index) => [`do[${index}]`, value]),
    ...record.do_not.map((value, index) => [`do_not[${index}]`, value]),
    ...Object.entries(record.labels ?? {}).map(([key, value]) => [`labels.${key}`, value]),
  ];
  for (const [field, value] of values) findings.push(...findUnsafeLocaleText(value, `${locale}:${record.id}.${field}`));
  return findings;
}

export function scanGeneratedArtifact(name, source) {
  const text = Buffer.isBuffer(source) ? source.toString("utf8") : String(source);
  const findings = [];
  if (LOCAL_PATH.test(text)) findings.push(`${name}: local absolute path detected`);
  if (SECRET.test(text)) findings.push(`${name}: secret-like content detected`);
  if (name.endsWith(".md")) {
    if (RAW_HTML.test(text)) findings.push(`${name}: raw HTML detected`);
    if (DANGEROUS_URI.test(text)) findings.push(`${name}: executable or local URI detected`);
    if (EXECUTABLE_COMMAND.test(text)) findings.push(`${name}: executable install or command instruction detected`);
    if (PROMPT_OVERRIDE.test(text)) findings.push(`${name}: prompt-override language detected`);
  }
  return findings;
}
