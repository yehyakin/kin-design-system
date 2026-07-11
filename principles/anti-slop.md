# Anti-Slop Review

Anti-Slop is a review discipline, not an aesthetic police scanner. Its purpose is to identify machine-default decisions that were never consciously chosen.

## Workflow

1. Define the product area being reviewed.
2. Scan source while excluding generated output, dependencies and vendor files.
3. Read every candidate in context.
4. Classify it as intentional, ambiguous or machine-default.
5. Report confirmed findings before editing.
6. Fix shared tokens and components before call sites.
7. Verify visually and re-scan.
8. Record intentional exceptions and their rationale.

## Primary tells

- Indigo-to-violet or cyan-to-purple gradients without meaning.
- Gradient-clipped headings.
- Ambient background glows and glowing state dots.
- Glass surfaces across ordinary content.
- Excessive rounding, pills and nested cards.
- Oversized diffuse shadows.
- Pastel icon tiles and icons tinted in their own color.
- A kicker above every heading.
- Flat typography compensated by colored keywords.
- Invented metrics such as `10k+`, `99.9%` or `24/7`.
- Repeated `01 / 02 / 03` decoration.
- Generic AI copy and “not just X — Y” constructions.
- Springy hover effects and every card lifting.
- A tasteful-looking fake terminal unrelated to the task.
- Uniform spacing that ignores relationships.

## Triage format

```text
classification  file:line  finding                  proposed direction
slop            Hero.tsx  gradient headline          solid text + hierarchy
intentional     Brand.tsx approved brand gradient    retain; documented token
ambiguous       Status.tsx colored pill              review status semantics
```

## Fix principles

- Subtract before replacing.
- Preserve task, meaning and authorship.
- Do not invent a new palette during cleanup.
- Prefer shared-system corrections.
- Specific language beats punchy language.
- Decoration must carry information.
- A scanner finding is evidence to inspect, not a verdict.

## Review boundaries

Do not mass-edit unfamiliar work, remove approved brand assets, flatten intentional illustration, or rewrite copy without preserving meaning. Passing a scanner is not equivalent to producing a better interface.

## KIN completion criteria

- One clear primary accent.
- Content rather than chrome owns attention.
- No fake data or simulated intelligence.
- No card wall, glow or decorative AI motif.
- Exceptions have a product reason, owner and visual evidence.

## Source

Workflow adapted from [Kill AI Slop](https://github.com/yetone/kill-ai-slop/blob/main/skill/SKILL.md). KIN retains its own normative taxonomy in `DESIGN.md`.
