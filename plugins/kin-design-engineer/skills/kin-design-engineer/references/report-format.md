# Report format

Use this structure for audit and repair results. Omit empty sections, but keep the evidence boundary explicit.

```markdown
# KIN Design Engineer result

Mode: audit | repair | verify
Contract: authoritative checkout | pinned project contract | unavailable
Result: confirmed findings count or candidate-scan status

## Findings and changes

| Priority and evidence | Before | After | Why |
|---|---|---|---|
| P1 · `src/example.tsx:42` · confirmed | Interactive `div` | Semantic `button` with retained focus | Restores keyboard semantics without changing the action |

## Positive findings

- Preserved behavior or implementation worth retaining.

## Verification

- Commands: command and actual result.
- Browser: route, viewport, theme, input method, and state actually inspected.
- Manual: named device or assistive technology actually used.
- Not verified: explicit gaps.

## Files changed

- `path`: purpose.

## Remaining risks and rollback

- Remaining risk, owner or next check, and the safe rollback.
```

## Scoring

Use the KIN six-dimension `/24` score only after a rendered, code-backed audit under the authoritative audit protocol. A deterministic packet may include the repository scanner's narrower preliminary score; label it `candidate score` and never relabel it as compliance.

## Evidence wording

- Use `confirmed` only when the relevant state was inspected.
- Use `source-confirmed` when code is clear but the UI was not run.
- Use `candidate` for an unreviewed scanner result.
- Put browser, touch, zoom, localization, RTL, screen-reader, performance, production, or adoption claims under `Not verified` unless matching evidence exists.

For audit-only work, the `After` column contains the proposed smallest repair. For completed repair work, it contains the implemented result.
