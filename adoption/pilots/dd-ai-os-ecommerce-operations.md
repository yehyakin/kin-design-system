---
kind: kin-controlled-pilot-brief
status: planned
product: DD AI OS
profile: ecommerce-operations
mutates_product_code: false
---

# DD AI OS ecommerce-operations pilot

Status: non-normative handoff; product audit and human approval required

This KIN change prepares the trial only. It does not modify `yehyakin/dd-ai-os`, approve a migration, or claim that the current product is visibly KIN.

KIN contains a historical, non-normative [`DD AI OS adoption pilot`](../../audits/dd-ai-os-adoption-pilot-2026-07-13/report.md). It reached `mapped` for the dated revision recorded there, not `verified`, and it is not Agent Distribution Phase 5 evidence. The new trial must re-audit the current product revision rather than inherit historical branch, component, or dependency assumptions.

## Candidate representative workflow

The product Agent should first verify this candidate against the actual repository and running product:

> Open one real product or creative operation, preserve its product and task identity, submit or continue an existing durable task, inspect pending/running/result or failure state, and reach the product-supported review, retry, save, download, or continuation action without losing context.

The workflow completes only through behavior the product already supports. The operator should be able to answer:

- which product, asset, channel, or task is being operated;
- which inputs and current durable state apply;
- whether the result is a suggestion, generated artifact, saved draft, approved item, published item, or failed task;
- what money, quota, inventory, permission, or external effect is involved when applicable;
- what safe next action and recovery path are available.

If generation, approval, publication, payment, quota, storage, or retry does not exist in the product, do not simulate it. Keep the brief `draft` and choose a different real ecommerce-operations workflow.

## Initial composition hypothesis to validate

- **First meaningful view:** the actual product, creative job, queue, catalog record, or operating task—not a generic AI dashboard.
- **Dominant region:** the current operation, selected record, or result/review surface.
- **Persistent context:** product identity, source assets, draft/input state, durable task identity, selected result, and the existing navigation or URL context.
- **Chrome behavior:** navigation and general metrics recede; task scope and safe next action remain clear.
- **Surface strategy:** use a Surface for the current artifact, review boundary, modal task, or selected record; keep ordinary metadata, progress, activity, and properties flat.
- **Density strategy:** product, channel, quantity, money, state, owner, and time align for comparison where they exist.
- **Semantic separation:** AI confidence, task progress, approval, publication, payment/quota, storage, and result availability remain distinct.
- **Motion model:** pending-to-result feedback reflects real task state; Dialog, Drawer, Toast, and result transitions preserve source, interruption, focus, and Reduced Motion outcomes.
- **Narrow-screen priority:** `identity -> blocking/current state -> affected product/money/quota/channel -> safe action -> result/activity -> secondary context`.

These are hypotheses until checked against the actual product task and content.

## Required product-repository audit

Before implementation, the product Agent records:

1. current route and V4 shell/component boundaries, if they still exist in the selected revision;
2. real product, asset, task, result, approval, publication, quota, payment, storage, and recovery models;
3. existing Sonner, command, icon, theme, localization, upload, Dialog/Drawer, and durable-task implementations;
4. authentication, authorization, paid-task, object-storage, download/export, and retry boundaries that must remain unchanged;
5. existing component and third-party runtime behavior worth preserving;
6. applicable loading, empty, pending, partial, failed, expired-session, permission, and recovery states;
7. a product-owned rollback.

The audit must use the current product revision. Historical branch or package assumptions are not evidence. The audit is read-only; product code changes require a separate instruction in the DD AI OS repository.

## Required interactions to prove when applicable

- enter the operation from the real product context;
- preserve product, draft, and durable task identity;
- submit only after valid product-owned preconditions;
- show pending/running state without fabricated progress;
- render success, partial, failure, retry, session, permission, or quota state from real boundaries;
- keep prior inputs and recoverable results available when safe;
- provide contextual Sonner feedback only for real committed operations;
- maintain keyboard, focus restoration, touch, Light, Dark, system, and Reduced Motion behavior.

Do not install every KIN integration. Preserve the product's existing official-package engines and record any adapter decision, bundle effect, SSR/hydration boundary, evidence, and rollback in the approved local brief.

## Comparable evidence matrix

At minimum capture the same realistic product/task, input, durable state, viewport, and theme for:

- wide Light primary task;
- wide Dark primary task;
- narrow task and result/recovery adaptation;
- one real pending, partial, failed, permission, session, quota, storage, or recovery state that applies.

The baseline must precede implementation. A fixture that bypasses authentication, payment/quota, task persistence, or storage cannot prove the production workflow.

## Explicit exclusions for this KIN phase

- no DD AI OS source edits;
- no SQL, database, API, Auth, billing, quota, storage, environment, deployment, or backend migration;
- no fabricated generation, progress, result, approval, download, publication, or payment behavior;
- no assumption that historical branches describe the current code;
- no public adoption claim;
- no production observation claim;
- no publication of private product evidence.

Use [`pilot-report-template.md`](./pilot-report-template.md) in the product repository and keep every unperformed check truthful.
