# KIN motion craft plans

These plans were produced from a deep motion audit at commit `b300c02`. They are implementation records, not additional normative contracts. Normative outcomes belong in `DESIGN.md`, `principles/`, `components/`, `integrations/`, and the verified reference interfaces.

| Plan | Title | Severity | Status | Depends on |
|---|---|---|---|---|
| [001](./001-make-exit-motion-responsive.md) | Make exit motion responsive | HIGH | COMPLETE | — |
| [002](./002-add-frequency-and-input-contract.md) | Add frequency and input-modality contract | HIGH | COMPLETE | 001 |
| [003](./003-define-tooltip-sequences.md) | Define first and subsequent Tooltip behavior | MEDIUM | COMPLETE | 002 |
| [004](./004-specify-gesture-physics.md) | Specify gesture-driven Drawer and Sheet physics | MEDIUM | IMPLEMENTED · DEVICE REVIEW PENDING | 001 |
| [005](./005-upgrade-motion-review-evidence.md) | Upgrade Motion Lab and verification evidence | MEDIUM | IMPLEMENTED · MANUAL REVIEW PENDING | 001–004 |

Recommended order: 001 → 002 → 003 → 004 → 005. Plan 005 is the integration and evidence layer and MUST not be reported complete before the contracts it demonstrates are stable.
