# Reference Governance

KIN is an independent design system. External sources provide evidence, techniques and counterexamples; they do not become KIN rules automatically.

## Source hierarchy

When sources conflict, use this order:

1. Real product tasks, users, data and constraints.
2. `DESIGN.md` and approved KIN decisions.
3. Accessibility, platform and security requirements.
4. Official documentation for the technology being implemented.
5. Public product-design discussions from the referenced product.
6. Community skills and third-party visual analyses.
7. Third-party component defaults.

Third-party component defaults always have the lowest visual priority.

## Design-method references

| Reference | KIN use | Do not import |
|---|---|---|
| [Linear UI redesign 2024](https://linear.app/now/how-we-redesigned-the-linear-ui) | density, alignment, structured views, LCH theme generation, feature-flag rollout | brand assets, proprietary UI, business model |
| [Linear UI refresh 2026](https://linear.app/now/behind-the-latest-design-refresh) | dimmer navigation, fewer icons, softer separators, consistent action placement | page-by-page imitation |
| [Linear Triage Intelligence](https://linear.app/now/how-we-built-triage-intelligence) | distinguish AI suggestions from human data; show sources and progress | fake reasoning traces or simulated AI |
| [Linear brand guidelines](https://linear.app/brand) | restraint and monochrome brand handling | Linear logo, wordmark, icon or implied affiliation |
| [Apple Design Skill](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) | direct feedback, continuity, interruption, reduced motion | Apple branding or platform mimicry |
| [Kill AI Slop](https://github.com/yetone/kill-ai-slop/blob/main/skill/SKILL.md) | audit workflow and machine-default visual taxonomy | automatic mass editing or scanner-as-truth |
| [Kill AI Slop website](https://killaislop.com/) | human-readable companion reference | duplicate normative rules |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | density, hierarchy and visual-review prompts | arbitrary style parameters overriding KIN |
| [Soul Design Linear DESIGN.md](https://github.com/soulcore-dev/soul-design-md/blob/main/designs/linear/DESIGN.md) | agent-readable documentation structure and implementation detail | unverified claims framed as official Linear tokens |

## Runtime-component references

| Candidate | Adoption tier | KIN document |
|---|---|---|
| [NumberFlow](https://github.com/barvian/number-flow) | conditional | [`integrations/number-flow.md`](./integrations/number-flow.md) |
| [input-otp](https://github.com/guilhermerodz/input-otp) | conditional | [`integrations/input-otp.md`](./integrations/input-otp.md) |
| [Liveline](https://github.com/benjitaylor/liveline) | conditional | [`integrations/liveline.md`](./integrations/liveline.md) |
| [Leva](https://github.com/pmndrs/leva) | development only | [`integrations/leva.md`](./integrations/leva.md) |
| [cmdk](https://github.com/dip/cmdk) | core candidate | [`integrations/cmdk.md`](./integrations/cmdk.md) |
| [React Virtuoso](https://github.com/petyosi/react-virtuoso) | core candidate at scale | [`integrations/virtuoso.md`](./integrations/virtuoso.md) |
| [dnd kit](https://github.com/clauderic/dnd-kit) | conditional | [`integrations/dnd-kit.md`](./integrations/dnd-kit.md) |
| [Sonner](https://github.com/emilkowalski/sonner) | core candidate | [`integrations/sonner.md`](./integrations/sonner.md) |

Package names, maintainers, APIs, licenses and support status can change. Every consuming project MUST verify current official documentation and license terms at adoption time.

## Brand and exceptional-tool references

| Reference | Allowed use | Excluded use |
|---|---|---|
| [ICONIC](https://github.com/YuheshPandian/ICONIC) | technical ecosystem pages and documentation | core navigation, state, tables, Inspector, command menu |
| [Pixel2Motion](https://github.com/nolangz/pixel2motion) | optional brand reveal and promotional output | route transitions, loading states, persistent animation |
| [Math Curve Loaders](https://github.com/Paidax01/math-curve-loaders) | exceptional long-running tasks with real progress | page loads, search, buttons, decoration |

See [`tools/brand-motion.md`](./tools/brand-motion.md) and [`tools/long-task-loaders.md`](./tools/long-task-loaders.md).

## Adoption record

Before introducing a third-party package, add a decision record containing:

```yaml
package:
version:
owner:
problem:
alternatives_considered:
bundle_impact:
ssr_hydration_impact:
accessibility_review:
reduced_motion_behavior:
theme_adapter:
license_reviewed_by:
adoption_date:
rollback_plan:
```

## Attribution and copying

- Link to sources; do not vendor their documentation by default.
- Paraphrase learned principles in KIN's own language.
- Preserve copyright notices when a license requires them.
- Do not copy logos, screenshots, icon sets, fonts or source code without permission and license review.
- Re-check links and project status before each KIN release.
