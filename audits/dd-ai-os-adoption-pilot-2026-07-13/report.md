# DD AI OS adoption pilot

Date: 2026-07-13

Status: non-normative consuming-product evidence

## Scope

This pilot applied the KIN contract-first adoption format to the private DD AI OS repository without changing runtime code. The reviewed DD branch was `codex/kin-v4-audit` at `8d773814eb7cb998cce1a50bb06c922c272121c1`. Its V4 implementation baseline is `dfb258216c81369a3990b505dea2e0a671ad1ccd`.

The product preserves its existing Workspace Shell, cmdk, Sonner adapter, routes, business hooks, paid-task controls, Auth, R2, recovery, permissions, and export behavior. The pilot records mappings; it does not implement K1 Foundations.

## Result

The DD evidence stage is `mapped`.

Mapped evidence exists for:

- semantic Token and theme targets;
- existing V4 component ownership and KIN responsibilities;
- public, Workspace, production, resource, and administration route scope;
- Sonner retention and Lucide evaluation;
- brand exceptions and invisible compatibility identifiers;
- phased rollout, stop conditions, and rollback.

The stage is not `verified` because K1 themes, semantic Tokens, icon migration, complete Sonner behavior, manual accessibility review, browser zoom, Forced Colors, touch behavior, and production observation have not been completed for the recorded product revision.

## Tooling findings

The pilot identified four evidence-integrity gaps in the P4 tooling:

1. A design contract could name a local copy without recording its exact revision or checksum.
2. A full Git commit URL produced an apparent-unpinned warning even though it is more precise than a moving branch.
3. An evidence record could label itself `mapped` while leaving Token, component, or route mappings pending and ownership empty.
4. A completed automated check could omit its run time and any durable artifact or explanatory note.

P5 addresses these gaps by adding optional `contract.revision` and `contract.checksum`, validating the local SHA-256, recognising full commit locators, enforcing truthful mapped-stage requirements, and requiring timestamps for completed automated checks. The fields remain optional so earlier 2.0 configuration files do not become invalid without review.

## Reproducibility boundary

The DD design contract remains pinned to KIN commit `410c61a664d10963b26f48ddfd6a2ee067fa6c95`, with local contract SHA-256 `6c47cbdf802e86438ab3982e24defd348670708daba17d1d2b03e6086a500d78`.

The newer Delivery and evidence Schemas are still part of the local KIN P4/P5 working tree. DD therefore carries local pilot Schema copies and an active exception. The DD integration MUST NOT be represented as merge-ready against a released evidence contract until KIN publishes an immutable revision containing these files and DD repins to it.

## Verification language

The KIN structural checker reported the pilot record as valid with evidence stage `mapped`. That result proves structure and stage consistency only. It does not establish visual quality, accessibility, runtime behavior, paid-flow safety, or production readiness.

During the pilot, DD's V4 lint, TypeScript, production build, and five focused V4 contracts passed. The additional fast release gate stopped at `tests/model-library-selection-contract.test.mjs` because the local `qc-20260602/results.json` manifest was absent. The pilot did not fabricate product data to bypass that failure, and no paid provider task or production write was triggered.

## Follow-up

1. Complete and publish the KIN P0–P5 revision.
2. Repin DD's local pilot Schemas to that immutable revision.
3. Re-run the KIN checker and DD deterministic commands.
4. Keep unperformed manual checks as `not-run`.
5. Begin K1 only after the DD design PR is reviewed and the project Agent is explicitly authorized.
