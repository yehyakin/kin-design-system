# 005 — Upgrade Motion Lab and verification evidence

- **Status**: IMPLEMENTED — MANUAL REVIEW PENDING
- **Commit**: b300c02
- **Severity**: MEDIUM
- **Category**: Cohesion, verification, and missed opportunities
- **Estimated scope**: 8 files, reference lab, Agent workflow, tests, and documentation

## Problem

KIN's Motion Lab demonstrates correct components, but it is mostly a compliance sheet. It lacks the controls and evidence needed to teach or review frequency, input modality, first/subsequent Tooltip behavior, slow motion, frame coordination, and gesture feel.

```html
<!-- examples/workspace-reference/motion.html:49 — current -->
<section aria-labelledby="control-motion-title">...</section>
<section aria-labelledby="anchored-motion-title">...</section>
<section aria-labelledby="spatial-motion-title">...</section>
<section aria-labelledby="motion-boundaries-title">...</section>
```

```md
<!-- principles/verification.md:47 — current -->
## Motion verification

Normal-motion and reduced-motion behavior MUST be tested separately.
```

The verification contract does not explicitly require slow-motion/frame inspection or real-device gesture evidence, and the KIN Agent Skill has no dedicated motion-audit route with exact before/after plans.

## Target

Motion Lab adds:

1. normal/slow review control, where slow mode is a lab-only `4×` timing aid and never a product Token;
2. visible current invocation/frequency classification;
3. keyboard-instant versus occasional-pointer comparison;
4. first/subsequent Tooltip group;
5. existing rapid-reversal Drawer pressure test;
6. gesture Sheet fixture from Plan 004;
7. observable status text that names the state, timing class, and reduced-motion outcome;
8. clear statements that the lab is evidence, not a runtime package.

Verification adds:

- slow-motion review at `4×` or DevTools 10–25% playback;
- frame-by-frame checks for origin, first-frame response, coordinated opacity/transform, and stale cleanup;
- high-frequency repetition tests;
- physical-device gesture review with recorded device/browser/input;
- explicit separation between automated state evidence and subjective feel evidence.

The Agent Skill gains a motion audit reference that requires a frequency map, file:line evidence, exact current/target code, repo-local Tokens, scope boundaries, automated checks, and manual feel checks.

## Repo conventions to follow

- `principles/verification.md` owns evidence language.
- `skills/kin-design/references/audit.md` routes general audits; add a focused motion reference rather than overloading every audit.
- `examples/workspace-reference/` owns deterministic behavior fixtures.
- `tests/visual/normal-motion.spec.js` owns normal-motion behavioral evidence.
- `CHANGELOG.md` records visible and normative additions.

## Steps

1. Build the lab-only review controls and sections described above with Lucide icons and current KIN surfaces.
2. Add a dedicated `skills/kin-design/references/motion-audit.md` and route it from the KIN Skill/audit reference.
3. Add slow-motion, frame-by-frame, frequency, modality, Tooltip sequence, and real-device gesture requirements to `principles/verification.md`.
4. Add deterministic Playwright tests for the new lab controls and state outcomes; keep physical feel as manual evidence.
5. Update the workspace README, showcase links/copy where necessary, and `CHANGELOG.md`.
6. Run the complete repository verification matrix and inspect generated screenshots in both themes and narrow layout.

## Boundaries

- Do NOT add decorative page entrance, looping ambient motion, confetti, glow, or stagger to the reference.
- Do NOT make slow mode a production preference.
- Do NOT describe screenshots or Playwright timing as proof of physical gesture quality.
- Do NOT turn the framework-free reference into a runtime package.

## Verification

- **Mechanical**: all required AGENTS commands plus `npm run test:reference` and site validation.
- **Visual**: inspect 1440×900 dark/light, 1024×800, and 390×844 normal/reduced motion screenshots.
- **Feel check**: use slow mode and DevTools frame stepping; validate origin, immediate response, coordinated properties, latest-request wins, first/subsequent Tooltip timing, and gesture velocity continuity.
- **Agent check**: give the motion-audit reference to an Agent with no conversation context; its plan must identify exact files, values, boundaries, and evidence without inventing a component.
- **Done when**: the lab teaches the contract interactively and the verification record distinguishes machine evidence from human judgment.
