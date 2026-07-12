# Audit protocol

Use this protocol for code-backed KIN compliance reviews. Do not edit until the user asks for fixes.

## Evidence rules

- When `scripts/audit-project.mjs` is available, it MAY be run as a read-only first pass. Its output is candidate evidence only.
- Inspect rendered screens before judging visual quality when a runnable UI exists.
- Confirm scanner or search hits in context; do not report raw regex hits as facts.
- Cite every actionable finding with `file:line` or a screenshot and state.
- Distinguish a systemic token/component problem from a one-off call-site issue.
- Include positive findings so the report preserves what already works.

## Score

Score each dimension from 0 to 4:

1. Product model and information hierarchy.
2. Tokens, themes, and visual consistency.
3. Interaction states and responsive behavior.
4. Accessibility and content clarity.
5. Performance and implementation quality.
6. Anti-slop restraint and product specificity.

Report the total as `/24`. Scores summarize evidence; they do not replace findings.

## Severity

- `P0 Blocking`: prevents completion, causes data loss, or creates a critical accessibility/security failure.
- `P1 Major`: breaks a core path, violates WCAG AA, or materially misrepresents data/state.
- `P2 Moderate`: creates inconsistency, avoidable friction, or a repeated quality problem.
- `P3 Minor`: localized craft or maintainability issue.

The static CLI uses a narrower preliminary score and does not replace this six-dimension `/24` review. Do not copy its score into a compliance report without completing the rendered product audit.

## Output format

```text
KIN Compliance: 18/24

P1  src/components/Status.tsx:42
Risk and online health share one semantic color.
Rule: DESIGN.md §3.4
Evidence: selected provider inspector, dark and light themes
Fix: split RiskIndicator from HealthStatus and map separate tokens.

Positive
src/components/DataRow.tsx preserves keyboard focus and selected state independently.

Systemic issues
- Raw colors bypass semantic tokens in 4 components.

Verification
- Screens inspected: ...
- Commands run: ...
- Not verified: ...
```

Group findings by severity, then systemic issues, positive findings, recommended order, and verification gaps. Do not make every issue P0 or P1.
