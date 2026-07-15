# 002 — Add frequency and input-modality contract

- **Status**: COMPLETE
- **Commit**: b300c02
- **Severity**: HIGH
- **Category**: Purpose and frequency
- **Estimated scope**: 5 files, normative clarification and reference tests

## Problem

KIN says repeated animation should be shortened, but it does not give an Agent a deterministic frequency decision. It also assigns every Command Menu a `140–180ms` target even though the primary invocation is a high-frequency keyboard shortcut.

```md
<!-- principles/apple-interaction.md:33 — current -->
| Command menu | 140–180ms |
...
If an animation calls attention to itself during repeated use, shorten or remove it.
```

```md
<!-- integrations/cmdk.md:15 — current -->
- Open with `Cmd/Ctrl + K`; `/` may focus search when it does not conflict with editing.
...
- Apply KIN surface, hairline, focus and motion tokens.
```

The showcase Command Menu currently opens without an entrance transition, which is the correct high-frequency behavior, but the normative text does not explain why.

## Target

Add a frequency and invocation contract:

| Frequency / path | KIN default |
|---|---|
| Keyboard-priority or 100+ uses/day | `--duration-instant`; no spatial entrance; focus and input available in the same task |
| Tens of uses/day | no travel or scale; state color/opacity at `--duration-fast` or faster |
| Occasional | normal or panel duration with justified spatial continuity |
| Rare / explanatory | MAY use a deliberate sequence, capped by the product context and never blocking interaction |

For Command Menu specifically:

- keyboard invocation MUST open without entrance travel, scale, or a wait for animation;
- search focus MUST be available in the same interaction task;
- pointer invocation MAY use a short opacity transition no longer than `100ms` only when it does not create two behavioral identities;
- close MUST immediately remove interaction and restore focus; any visual exit MUST not delay another invocation;
- filtering debounce is network/data behavior and MUST not be confused with visual entrance timing.

## Repo conventions to follow

- `DESIGN.md` owns the system-level motion rule.
- `principles/apple-interaction.md` owns directness and timing guidance.
- `integrations/cmdk.md` owns adapter-specific behavior.
- `components/core-states.md` owns Command Menu states.
- The existing site and state references already demonstrate instant Command Menu opening.

## Steps

1. Add the four-row frequency matrix to `DESIGN.md` and `principles/apple-interaction.md` using MUST/SHOULD/MAY language.
2. Replace the unconditional Command Menu timing row with an input-aware rule.
3. Add the keyboard and pointer invocation requirements to `integrations/cmdk.md` and the Command Menu acceptance section in `components/core-states.md`.
4. Add a normal-motion Playwright check that opens the showcase Command Menu with `Control+K`, confirms immediate focus, and confirms there is no transform/scale entrance duration.
5. Add a Motion Lab comparison that reports keyboard-priority as instant and pointer-occasional as short feedback without delaying content.

## Boundaries

- Do NOT state that all keyboard-triggered state feedback must be invisible. Selection, focus, pressed state, and committed results remain visible.
- Do NOT remove motion from occasional Dialogs, Drawers, or spatial Inspectors.
- Do NOT add a second Command Menu implementation.
- Do NOT change server-search debounce semantics.

## Verification

- **Mechanical**: validators, `npm run test:tooling`, `npm run test:reference`.
- **Feel check**: press `Cmd/Ctrl+K` repeatedly. Search is focused immediately and the surface never appears to chase input. Close and reopen before any optional exit finishes; the latest request wins.
- **Pointer check**: the visible trigger remains responsive and does not gain decorative scale or travel.
- **Reduced motion**: identical functional timing and focus behavior.
- **Done when**: an adopting Agent cannot interpret the timing table as permission to animate every Command Menu opening.
