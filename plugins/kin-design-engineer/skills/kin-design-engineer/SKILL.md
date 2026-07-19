---
name: kin-design-engineer
description: "Run a KIN-aware frontend engineering loop in Codex: collect deterministic review candidates, inspect source and rendered behavior, audit an interface, apply explicitly authorized repairs, and verify responsive, theme, keyboard, touch, loading, error, and Reduced Motion behavior. Use when the user asks to audit, fix, redesign, polish, or verify a web UI with KIN Design System, or asks for a runnable GPT-5.6 KIN design-engineering workflow."
---

# KIN Design Engineer

Use the active Codex model as the reasoning and editing engine. Treat the local scanner as evidence collection only; it does not decide whether an issue is real.

Read `references/runtime-boundary.md` before starting. Read `references/report-format.md` before reporting findings or completed repairs.

## Choose the mode

- Use `audit` for inspect, diagnose, review, or report requests. Remain read-only.
- Use `repair` when the user explicitly asks to fix, improve, redesign, implement, or complete the interface.
- Use `verify` after a repair or when the user asks to validate an existing change.

Do not infer repair authorization from an audit request.

## Collect the evidence packet

Resolve the target project and this skill directory. Run the collector relative to this `SKILL.md`:

```bash
node scripts/collect-evidence.mjs <target-project> --format json
```

When the KIN checkout is not discoverable, pass it explicitly:

```bash
node scripts/collect-evidence.mjs <target-project> --kin-root <kin-checkout> --format json
```

The collector MUST remain read-only. It does not execute target-project code, install dependencies, call a model, access the network, or edit files.

Interpret `kin.status` as follows:

- `authoritative-checkout`: use the discovered KIN checkout and its routed contracts.
- `project-contract`: read the pinned local contract and configuration, but locate the matching full KIN checkout or immutable source before making a KIN compliance claim.
- `unavailable`: report generic static candidates only. Do not claim a KIN audit or begin KIN-directed repairs.

Confirm every scanner candidate in source context. Drop false positives and documented exceptions. A candidate score is not a KIN score.

## Load authoritative context

Honor the user request and target repository instructions first. Read target-project `AGENTS.md`, product documentation, package manifest, routes, data model, token source, primitives, relevant tests, and current screenshots when present.

When an authoritative KIN checkout is available:

1. Read its `AGENTS.md`.
2. Read `skills/kin-design/SKILL.md` and follow its routing.
3. Read the KIN files that skill requires for this task.
4. Read `principles/verification.md` before making accessibility, browser, zoom, motion, RTL, touch, or completion claims.

For frontend work, invoke and follow the local `emil-design-eng` skill when it is available. Apply its craft guidance to the product's existing brand and KIN contract; do not copy a fixed visual aesthetic.

## Inspect the real interface

When the project can run safely, use its documented local command and inspect the affected workflow in an available browser. Do not substitute a code scan for a rendered review.

Inspect the states relevant to the request:

- wide and narrow layouts;
- light and dark themes when supported;
- keyboard focus and focus restoration;
- pointer hover and touch behavior;
- loading, empty, partial, error, stale, disabled, pending, and committed states that exist in the workflow;
- normal and Reduced Motion behavior when motion is present;
- realistic short, long, translated, and constrained content when applicable.

Record which states were actually exercised. Keep untested states under `Not verified`.

## Audit

Build findings from confirmed source and rendered evidence. For each finding:

1. Name the user-visible risk.
2. Cite a tight `file:line` location or a screenshot plus state.
3. Name the applicable KIN contract or project-local rule.
4. Separate systemic token or primitive problems from one-off call sites.
5. Propose the smallest coherent repair.

Include positive findings so good behavior is preserved. Use the six-dimension KIN `/24` score only after completing the rendered audit required by the authoritative KIN audit protocol. Otherwise label the result `candidate scan` and omit a compliance score.

## Repair

Before editing, state the product task, the confirmed issues in scope, the preserved behavior, and the verification plan. For page-level work, complete the KIN composition checkpoint routed by `skills/kin-design/SKILL.md`.

Apply only confirmed repairs. Preserve routes, data meaning, permissions, analytics identifiers, localization keys, public APIs, brand assets, and functioning product behavior unless the user explicitly changes their scope.

Prefer existing tokens and primitives. Do not install a dependency merely to reproduce existing behavior. Do not bulk-rewrite candidates from regex output.

Use the Before/After/Why table in `references/report-format.md` for every UI code review or repair summary.

## Verify

Run the smallest relevant deterministic checks first, then the project's documented broader checks in proportion to risk. Do not add or change a command merely to manufacture a pass.

Re-open the real workflow and compare the affected states after repair. Verify responsive behavior, keyboard focus, hover and touch behavior, loading and error states, themes, and `prefers-reduced-motion` support when applicable.

Distinguish:

- deterministic command results;
- browser observations;
- manual device or assistive-technology evidence;
- unverified claims.

Never convert a build, screenshot, smoke test, or model review into screen-reader, real browser-zoom, touch-device, WCAG, cross-browser, production, or adoption evidence.

## Finish

Use `references/report-format.md`. Report the active contract source, decisions, changed files, checks run with actual results, browser states inspected, remaining gaps, and rollback.

Do not claim that this plugin itself calls GPT-5.6. It uses the model selected in the Codex session. A GPT-5.6 competition claim requires an identified GPT-5.6 session and separate demo evidence.
