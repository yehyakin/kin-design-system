# Information site pattern

Use this pattern for documentation, research, directories, knowledge bases, public records, editorial databases, and evidence-backed information products.

## Product job

Help a reader find, understand, verify, and return to information. Reading order, provenance, search, and cross-reference matter more than conversion theater.

## Core entities

- Article, record, topic, source, author, revision, collection, and saved view.
- Every factual entity SHOULD expose source, publication or collection time, revision status, and stable URL where available.
- Distinguish editorial interpretation from source material and system-generated summaries.

## Structure

Choose structure according to the task:

- Directory: navigation or filters + result list + optional detail context.
- Reading page: location trail + title/deck + article + source/outline rail.
- Knowledge base: topic navigation + search + article + related records.
- Public record: identity + status + chronology + evidence + revision history.

A public information page MUST preserve shareable URLs, headings, metadata, semantic HTML, search indexing, and print/readability behavior where relevant.

### Default directory composition

When the primary job is finding and opening public records, begin from this relationship unless product evidence requires another one:

```text
Quiet global navigation and utilities
Primary search or subject identity
View controls / active filters / result scope
Record list or reading result
Source, revision, related records, and supporting explanation
```

- Search or the record subject MUST be usable in the first meaningful view.
- Metrics MAY summarize the collection in one compact strip after the search or subject; they MUST NOT become equal stat cards that precede the task.
- Recent changes, risk notices, source updates, and popular records SHOULD use aligned rows when users compare them.
- Product explanation, methodology, and promotional CTAs MUST follow the information task unless they are the requested content.
- A decorative graph MUST NOT replace search, results, provenance, or navigation.

This composition does not require an application Sidebar. Public navigation, SEO, reading flow, and stable URLs remain product-owned.

## Visual register

- Content leads; navigation and metadata recede after orientation.
- Use a readable content measure, but allow tables, code, diagrams, or records to expand when the content requires width.
- Use cards only when each item is an independent object with meaningful boundaries. Ordinary paragraphs, links, definitions, and citations remain flat content.
- A homepage MAY use a lead story or primary record, but MUST NOT manufacture a marketing Hero when the user's task is search or reading.

## States

- Published, revised, corrected, archived, disputed, incomplete, and source unavailable.
- Search: idle, suggestions, results, no results, partial results, and service error.
- Content: loading, offline copy, stale cache, permission boundary, and removed source.

## Interaction

- Search queries, filters, active topic, pagination, and opened records SHOULD be deep-linkable.
- Relative dates expose absolute dates.
- Citations and footnotes remain keyboard reachable and return focus to their origin.
- A table of contents follows headings; it does not invent categories.

## Anti-patterns

- Hero headline and CTA replacing search or navigation.
- Equal-card grids for unrelated content types.
- “AI summary” without visible source and update time.
- Decorative reading progress, badges, or topic colors that do not encode structure.
- Hiding correction history or uncertainty to make content appear cleaner.

## Visual-signature requirement

The first meaningful view MUST expose search, subject identity, reading content, or the record list before promotional explanation. Token parity, a themed header, or a card restyle does not establish the information-site signature. Apply the common and information-site requirements in [`principles/visual-signature.md`](../principles/visual-signature.md).

## Acceptance

- A new reader can identify subject, source, currency, and next navigation step without scrolling through promotion.
- Comparable baseline and candidate screenshots show that the primary information task, rather than a Hero or explanatory card, owns attention.
- The page remains understandable with images, motion, and AI features unavailable.
- Long titles, long URLs, translated text, citations, tables, and print styles do not break hierarchy.
- The first viewport cannot be mistaken for a marketing landing page when search, reading, or record discovery is the product job.
