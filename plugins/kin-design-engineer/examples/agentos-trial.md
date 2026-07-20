# AgentOS repair trial

Date: 2026-07-19

Plugin: KIN Design Engineer `0.1.0`

Baseline target revision: AgentOS `dcb8577183e858bf5b8892fa79b03ad5fa7c57b0` on `codex/build-week-agentos`

Repaired target revision: AgentOS `6e32403`

Mode: audit, user-authorized repair, and verification

This trial checks whether the plugin keeps deterministic candidates, model judgment, edits, and browser evidence separate. It is local development evidence, not a blanket KIN-compliance, accessibility, production, adoption, or competition-result claim.

## Baseline deterministic packet

Command from the KIN checkout:

```bash
node plugins/kin-design-engineer/skills/kin-design-engineer/scripts/collect-evidence.mjs ../agentos --kin-root . --format markdown
```

Observed baseline result:

- authoritative KIN 3.0.0 development checkout found;
- repository scanner used;
- 8 frontend files scanned;
- 20 candidates: 2 P1 and 18 P2;
- positive source signals for CSS custom properties, Reduced Motion, visible focus rules, and semantic landmarks;
- no target code executed and no target file edited.

## Candidate review and repair

| Priority and evidence | Before | After | Why |
|---|---|---|---|
| P1 · baseline `app/globals.css:546` · confirmed in source and focused browser state | The mission textarea's higher-specificity focus rule removed the visible outline. | The textarea now inherits the shared `:focus-visible` ring, with the border response preserved. | The global focus rule previously lost the cascade, so the candidate was not a false positive. |
| P1 · baseline `app/globals.css:668` · confirmed in source and focused browser state | The business-evidence textarea had no visible keyboard-focus boundary. | The expanded editor now receives the same visible keyboard-focus treatment as other inputs. | A detailed evidence field must not become invisible when reached from the keyboard. |
| P2 · baseline decorative and surface candidates · confirmed as an over-styled composition | Persistent blur, glow, lifted cards, and decorative gradients competed with the task. | The page now uses continuous surfaces, restrained depth, one acid-green accent, and motion only for state change. | KIN and Emil's craft baseline both favor task hierarchy over decorative chrome. |
| P2 · pill candidates · rejected as automatic fixes | Full radii appeared on a status dot, a progress track, and semantic status elements. | Preserved. | These are allowed or deliberate pill contexts; a regex match did not justify replacement. |

The user authorized the full repair. The change also added English/Chinese localization, light/dark/system preferences, transparent runtime provenance, localized deterministic fixtures, cancellation and retry copy, and explicit GPT-5.6 reasoning-effort configuration.

## Browser evidence

- Production demo mode loaded locally with the primary Mission, Agent graph, and Decision brief hierarchy visible.
- English and Chinese chrome, sample mission, agent states, and final brief were observed.
- Light and dark preferences both applied to the root document and rendered without decorative glow or persistent blur.
- Running, completed, canceled, and restart states were exercised in deterministic replay; the UI explicitly stated that no API call occurred.
- A `390 × 844` viewport reported no horizontal page overflow.
- The touch-target audit found that native theme/language selects were initially only 16 pixels high. After repair and the final production rebuild, both native selects measured exactly 45 pixels high.
- Final English/light desktop, Chinese/dark desktop, and Chinese/dark mobile evidence images were visually inspected after capture.
- Textarea and summary focus states resolved to a visible two-pixel outline.

## Repaired deterministic packet

After repair, the collector scanned 9 frontend files and returned 4 P2 review candidates: one functional progress gradient and three deliberate status/progress pill contexts. It also detected explicit theme behavior, Reduced Motion, visible focus rules, semantic landmarks, and CSS variables.

A detached clean worktree at `6e32403` completed `npm ci`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=low`; the audit reported zero vulnerabilities. The collector independently reproduced the 9-file, 4-candidate packet against that clean checkout.

## Not verified

- No paid or external model request was made in this repair run. The configured compatible endpoint and model identifier were inspected without exposing credentials; model provenance was not independently verified.
- The client error screen was reviewed in source but not forced through a live failing provider.
- Reduced Motion rules were found in source but the preference was not emulated in this browser session.
- Touch-device physics, real browser zoom, screen-reader behavior, Firefox, WebKit, deployment, production data, and adoption remain unverified.
- The desktop app installed KIN Design Engineer from the personal marketplace after action-time user confirmation. Codex showed an installation-success notice, cached version `0.1.0`, and enabled `kin-design-engineer@personal` in the local configuration. The exact repository-local marketplace CLI installation remains unverified because `codex plugin list` failed with Windows `Access is denied` in this environment.

## Result

The trial demonstrates the intended boundary: deterministic scanning narrows the search; GPT-5.6 in Codex and browser evidence confirm or reject candidates; the user grants edit authority; and the report names what remains unverified.
