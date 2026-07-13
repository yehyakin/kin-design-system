# Design review workflow

Use this workflow when the user wants critique or direction without implementation.

## Review order

1. Identify the primary user, task, entity, and decision.
2. Inspect the real screen or artifact before judging it.
3. Evaluate hierarchy, wayfinding, state meaning, density, interaction, accessibility, responsive behavior, and product specificity.
4. Resolve ambiguous component names through `components/terminology.md`; do not treat visual resemblance as behavioral equivalence.
5. For AI, review the separation between input, evidence, generated output, human decision, execution, durable result, and rollback.
6. Separate objective failures from subjective direction choices.
7. Preserve successful patterns and authorship.

If the review discusses accessibility or browser support, follow `principles/verification.md` and distinguish visible evidence, automated behavior, and unperformed manual checks.

## Response structure

- Outcome: the most important conclusion first.
- What works: evidence-backed strengths.
- Priority findings: no more than the meaningful issues, ordered by user impact.
- Direction: a coherent target, not a collection of visual tricks.
- Next step: the smallest useful action or prototype.

Avoid redesigning the product in prose when a focused correction is sufficient. Do not claim that a visual preference is a usability fact.
