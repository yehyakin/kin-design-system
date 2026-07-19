# Verification record

Date: 2026-07-19

Plugin: KIN Design Engineer `0.1.0`

Case target: AgentOS on `codex/build-week-agentos`

## Deterministic plugin checks

- Candidate-scan unit tests: 5/5 passing after the AgentOS repair.
- Skill validator: passing after the documentation update.
- Plugin validator: passing after the documentation update.
- Installed-cache plugin validator: passing for personal cache version `0.1.0`.
- Source and installed-cache SHA-256 hashes match for the manifest, skill entrypoint, agent metadata, and both collector scripts.
- Baseline AgentOS packet: 8 frontend files, 20 candidates, including 2 P1 focus candidates.
- Repaired AgentOS packet: 9 frontend files, 4 P2 candidates.
- Remaining candidates reviewed as expected contexts: one data-progress gradient, one status dot, one progress track, and one semantic status element.

## AgentOS build checks

- `npm run typecheck`: passing after the final touch-target patch.
- `npm run build`: passing after the final touch-target patch; Next.js 16.2.10 compiled the application routes successfully.
- `npm audit --audit-level=low`: passing with zero reported vulnerabilities.

## Browser observations

- Production deterministic replay loaded locally; UI stated “Demo replay · no API call.”
- English and Chinese labels, default mission, agent results, and decision brief were observed; a completed deterministic brief changed languages immediately without a second run.
- Light and dark preferences changed the root theme and color scheme.
- Running, completed, canceled, and restart states were exercised.
- The canceled state preserved the mission and evidence.
- Desktop focus states resolved to a visible two-pixel outline.
- At `390 × 844`, the document reported no horizontal overflow.
- Template and primary run buttons measured 44 pixels high.
- Theme/language selects initially measured 16 pixels high despite a 44-pixel wrapper. After repair and the final production rebuild, both native selects measured approximately 43 pixels high inside their 44-pixel controls.
- Final English/light desktop, Chinese/dark desktop, and Chinese/dark mobile evidence images were captured under `agentos/artifacts/build-week/`.
- Browser console inspection found no errors or warnings from the final production replay; the only retained entries were informational React DevTools notices from an earlier development server.

## Source-confirmed behaviors

- Hover-only visual responses are gated behind `(hover: hover) and (pointer: fine)`.
- Reduced Motion disables or shortens non-essential transitions without a global near-zero-duration override.
- API credentials remain server-only.
- Runtime metadata exposes demo/live mode, official/compatible provider class, configured model identifier, and reasoning effort without exposing the base URL or key.
- Compatible endpoints are labeled as compatible rather than official OpenAI; model provenance is not inferred from the identifier.

## Not verified

- No paid GPT-5.6 API call was authorized or made in this repair run.
- A compatible endpoint is configured locally, but its model provenance was not independently verified.
- The provider-failure UI was reviewed in source but not forced through a live failing request.
- Reduced Motion was verified in source, not through browser media emulation.
- Touch physics, real zoom/reflow, screen-reader output, Firefox, WebKit, deployment, production data, and user adoption were not tested.
- The desktop app installed KIN Design Engineer from the personal marketplace after action-time user confirmation. Codex showed an installation-success notice, added the KIN icon to the installed row, cached version `0.1.0`, and enabled `kin-design-engineer@personal` in the local configuration.
- Public repository access, a YouTube video, and the Devpost submission do not yet exist. Final screenshots exist locally but have not been uploaded.
