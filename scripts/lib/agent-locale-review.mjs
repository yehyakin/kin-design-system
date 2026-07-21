import { finalizeText } from "./canonical-content.mjs";
import { loadAgentDistributionContext } from "./agent-distribution.mjs";

function codeFenceFor(source) {
  const runs = [...source.matchAll(/`+/g)].map((match) => match[0].length);
  return "`".repeat(Math.max(3, ...runs, 0) + 1);
}

function inlineCode(source) {
  const runs = [...source.matchAll(/`+/g)].map((match) => match[0].length);
  const fence = "`".repeat(Math.max(0, ...runs) + 1);
  const padding = /^[` ]|[` ]$/u.test(source) ? " " : "";
  return `${fence}${padding}${source}${padding}${fence}`;
}

function readableMarkdown(source) {
  const fence = codeFenceFor(source);
  return [fence + "markdown", source.trimEnd(), fence];
}

function exactSourceString(source) {
  const serialized = JSON.stringify(source);
  const fence = codeFenceFor(serialized);
  return [fence + "json", serialized, fence];
}

function bulletList(values) {
  return values.map((value) => `- ${value}`);
}

function localizedCopyLines(locale, copy, reviewRecord) {
  const reviewers = copy.review.reviewers.length > 0 ? copy.review.reviewers.map(inlineCode).join(", ") : "none";
  const reviewedRef = copy.review.reviewed_ref ? inlineCode(copy.review.reviewed_ref) : "`null`";
  const lines = [
    `### ${locale}`,
    "",
    `- Locale-source state: \`${copy.review.status}\``,
    `- Attestation state: \`${reviewRecord.attestationState}\``,
    `- Recorded reviewers: ${reviewers}`,
    `- Recorded reviewed ref: ${reviewedRef}`,
    `- Recorded normative-source checksum: ${copy.review.normative_source_checksum ? `\`${copy.review.normative_source_checksum}\`` : "`null`"}`,
    `- Recorded localized-content checksum: ${copy.review.localized_content_checksum ? `\`${copy.review.localized_content_checksum}\`` : "`null`"}`,
    `- Candidate localized-content checksum: \`${reviewRecord.localizedContentChecksum}\``,
    "",
    `**Heading:** ${copy.heading}`,
    "",
    `**Summary:** ${copy.summary}`,
    "",
    "**Do:**",
    "",
    ...bulletList(copy.do),
    "",
    "**Do not:**",
    "",
    ...bulletList(copy.do_not),
  ];

  if (copy.labels) {
    lines.push("", "**Labels:**", "", "| Key | Copy |", "| --- | --- |");
    for (const [key, value] of Object.entries(copy.labels)) lines.push(`| \`${key}\` | ${value} |`);
  }

  return lines;
}

export function buildAgentLocaleReviewPacket(root) {
  const context = loadAgentDistributionContext(root, { allowStaleLocaleReview: true });
  const localeCopies = new Map(context.locales.map((locale) => [
    locale.id,
    new Map(locale.value.rules.map((record) => [record.id, record])),
  ]));

  const lines = [
    "# KIN Agent locale human-review packet",
    "",
    "Status: generated, non-normative, review state derived from locale inputs",
    "",
    "> This packet is derived from the current normative sections and informative locale inputs. Do not edit it directly and do not treat it as a locale attestation.",
    "",
    "## Review boundary",
    "",
    `- KIN contract: \`${context.design.kinVersion}\` (\`${context.design.releaseStatus}\`)`,
    `- Bundle input-set checksum: \`${context.inputSetChecksum}\``,
    "- Scope: exact English and Simplified Chinese copy used by the repository-only Agent Snapshot matrix.",
    "- This packet does not publish `/next/`, create a versioned bundle, advance a stable alias, or prove product adoption.",
    "- A human reviewer must compare every localized record with its exact normative source before a separate attestation change updates `distribution/locales/*.json`.",
    "",
    "## Locale summary",
    "",
    "| Locale | Current state | Candidate normative-source aggregate | Candidate localized-content aggregate |",
    "| --- | --- | --- | --- |",
  ];

  for (const locale of context.locales) {
    const review = context.localeReviews.get(locale.id);
    lines.push(`| \`${locale.id}\` | \`${review.status}\` | \`${review.normative_source_checksum}\` | \`${review.localized_content_checksum}\` |`);
  }

  for (const rule of context.rules) {
    const firstReview = context.localeReviews.get(context.locales[0].id).records.find((record) => record.id === rule.id);
    const sourceSection = context.sourceSections.get(rule.id);
    lines.push(
      "",
      `## \`${rule.id}\``,
      "",
      `- Requirement: \`${rule.level}\``,
      `- Source: [\`${rule.source_path}\`](../${rule.source_path})`,
      `- Exact heading: \`${rule.source_heading}\``,
      `- Candidate normative-source checksum: \`${firstReview.normativeSourceChecksum}\``,
      "",
      "### Normative source section (readable)",
      "",
      ...readableMarkdown(sourceSection),
      "",
      "### Exact source string used for checksum",
      "",
      `- UTF-8 byte length: \`${Buffer.byteLength(sourceSection, "utf8")}\``,
      "- JSON escaping preserves the exact trailing whitespace and line endings supplied to the checksum input.",
      "",
      ...exactSourceString(sourceSection),
      "",
    );

    for (const locale of context.locales) {
      const copy = localeCopies.get(locale.id).get(rule.id);
      const reviewRecord = context.localeReviews.get(locale.id).records.find((record) => record.id === rule.id);
      lines.push(...localizedCopyLines(locale.id, copy, reviewRecord), "");
    }
  }

  lines.push(
    "## Human decision record",
    "",
    "Do not record approval by editing this generated packet. The reviewer should leave a durable pull-request review, issue comment, or governed public attestation containing:",
    "",
    "- reviewed locales (`en`, `zh-CN`, or both);",
    "- every reviewed rule ID, or an explicit statement that every record in this packet was reviewed;",
    "- corrections required before approval, including the affected locale and rule ID;",
    "- the consented public reviewer handle or governed public attestation ID to store in the locale source, never an email address or private identity;",
    "- the reviewed Git ref or commit for audit context;",
    "- an explicit decision: `approved`, `changes-requested`, or `blocked`.",
    "",
    "Only an `approved` decision for every required record permits a later, checksum-bound attestation change. The exporter and validator must then recompute the checksums and reject any stale review metadata.",
  );

  return finalizeText(lines.join("\n"));
}
