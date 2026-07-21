# KIN controlled product pilots

Status: non-normative adoption evidence plan

These pilots test whether KIN helps a product team complete one real, representative workflow without weakening product truth, local architecture, or verification boundaries. They do not change 52.mk or DD AI OS from this repository, and they do not establish adoption by themselves.

The current pack is **trial preparation**, not RFC 001 Phase 5 execution. The existing KIN Skill still uses the full-contract read path, while the compact Manifest/Snapshot entry path belongs to pending Phase 4 work. A controlled Agent Distribution comparison needs both pinned paths before it can begin.

## Included pilots

- [`52mk-intelligence-workspace.md`](./52mk-intelligence-workspace.md) — an intelligence-workspace trial centered on entity, change, evidence, and preserved review context.
- [`dd-ai-os-ecommerce-operations.md`](./dd-ai-os-ecommerce-operations.md) — an ecommerce-operations trial centered on a real product or creative operation, durable task state, and safe continuation.
- [`pilot-report-template.md`](./pilot-report-template.md) — the common record for comparable evidence, instruction cost, corrections, verification, and rollback.

The product-specific briefs contain candidate workflows, not claims about current product behavior. The Agent in each product repository MUST confirm routes, capabilities, data, permissions, and existing components before making the implementation brief `ready`.

## Required sequence

1. **Pin the contract.** Use the exact KIN commit containing the reviewed pilot pack. Do not use moving `main` as production evidence.
2. **Audit only.** Inspect the product repository, run the KIN evidence collector or adoption initializer when authorized, and identify the real representative route. Do not change product code in this step.
3. **Complete the local brief.** Resolve product truth, route/profile mapping, first meaningful view, dominant region, persistent context, state matrix, runtime decisions, narrow-screen order, evidence locations, and rollback.
4. **Obtain human approval.** An Agent MAY mark the brief `ready`; only a named human product or design owner may mark it `approved`.
5. **Capture the baseline.** Record the same realistic content, state, theme, viewport, and task that will be used for the candidate comparison.
6. **Implement only after product-repository authorization.** Preserve routes, data meaning, permissions, analytics, backend behavior, and existing mature runtime engines unless the approved brief changes them.
7. **Verify and compare.** Keep automated, screenshot, manual interaction, device, assistive-technology, and production evidence separate.
8. **Record corrections and rollback.** A failed or inconclusive trial is useful evidence. Do not hide missing contracts or unresolved findings to produce a pass.

## Later Agent-entry-path comparison

When a reviewed compact Skill route exists, the same product task is run in two isolated arms:

1. **Control:** the pinned full-contract Skill path.
2. **Candidate:** the pinned Manifest, reviewed locale, resolved Snapshot, and routed detailed contract.

Both arms use the same product revision, user task, content, state, viewport, tools, permissions, and verification criteria. Before running them, the trial owner must define the context measurement unit, model/runtime identity where available, session-isolation method, instruction-adherence rubric, intervention-counting rule, and order/carry-over controls.

Until that candidate route exists, product pilots MAY refine the implementation brief and visual-signature contract, but MUST NOT claim that compact routing improves quality or context cost.

## Product-repository outputs

Each pilot SHOULD leave these product-owned records:

- `kin.config.json` with one explicit representative route family;
- a pinned local KIN contract;
- `docs/kin-implementation-brief.md`;
- `docs/kin-adoption.md`;
- `docs/kin-evidence.json`;
- `docs/kin-pilot-report.md`, based on the shared template;
- dated baseline and candidate artifacts stored in a project-appropriate review location;
- a tested rollback path.

The KIN repository does not collect product credentials, private source, customer data, unpublished routes, or backend configuration. Product evidence may remain private; the public KIN record should contain only consented, non-sensitive conclusions.

## Evidence boundary

- A generated Snapshot, copied Token file, component lab, or successful build is delivery evidence, not a successful pilot.
- `verified` requires an approved implementation brief, comparable baseline and candidate evidence, all required visual-signature criteria resolved, and the applicable automated and manual checks.
- `production-observed` additionally requires a dated product revision, observation owner, evidence location, and rollback.
- Screen-reader, real browser-zoom, physical-touch, cross-browser, performance, and production claims remain `not-run`, `blocked`, or `not verified` until matching evidence exists.

## Stop conditions

Stop and request the smallest blocking decision when:

- the representative route or completion condition cannot be established from product truth;
- the brief remains `draft` or contains unresolved placeholders;
- baseline and candidate content cannot be made comparable;
- the requested change would alter backend, permissions, billing, storage, analytics, or public API behavior without explicit authority;
- the product would need invented metrics, AI output, live state, or data to make the candidate look complete;
- a third-party integration would replace a working local implementation without documented benefit and rollback.
