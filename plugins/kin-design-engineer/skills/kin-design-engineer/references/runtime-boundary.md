# Runtime boundary

KIN Design Engineer is a Codex-native workflow, not a browser chat wrapper and not an OpenAI API client.

## Model boundary

- The active model selected in the Codex session performs the reasoning, source inspection, edits, and tool orchestration.
- The plugin stores no API key and defines no relay, alternate Base URL, or model endpoint.
- The evidence collector is deterministic local Node.js code. It does not call any model or network service.
- Do not state that the plugin used GPT-5.6 unless the active Codex session identifies GPT-5.6. The collector cannot verify model identity.

## Contract boundary

- The authoritative KIN source remains the checked-out KIN repository and its governing contracts.
- A project-local pinned `DESIGN.md` is useful evidence but does not include every routed product, component, verification, or delivery contract.
- The bundled candidate scanner is non-normative and may lag the repository scanner. Prefer the repository scanner whenever a complete KIN checkout is available.
- Do not represent the proposed Agent Distribution Layer in RFC 001 as accepted, released, or implemented.

## Authority boundary

- Audit mode is read-only.
- Repair mode requires an explicit user request to change or build the interface.
- Static candidates never authorize edits.
- Never broaden a frontend repair into route, schema, permission, analytics, deployment, or product-data changes without matching user authority.

## Evidence boundary

Label results as one of:

- `confirmed`: observed in source and the relevant rendered state;
- `source-confirmed`: confirmed in source but not rendered;
- `candidate`: found by deterministic scanning and not yet confirmed;
- `not verified`: outside the exercised environment.

Passing checks prove only what those checks exercise.
