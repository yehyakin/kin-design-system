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

## Acceptance

- A new reader can identify subject, source, currency, and next navigation step without scrolling through promotion.
- The page remains understandable with images, motion, and AI features unavailable.
- Long titles, long URLs, translated text, citations, tables, and print styles do not break hierarchy.
