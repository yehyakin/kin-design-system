# Releasing KIN

KIN releases publish a design contract, generated interoperability files, reference interfaces, and project-adoption tooling as one versioned unit.

## Prepare and validate the release candidate

```bash
npm ci
npm run tokens:export
npm run agent:export
```

Update the release metadata so `DESIGN.md` has `release_status: released` and `kin_version`, `latest_stable`, `package.json`, and `package-lock.json` use the same version. Regenerate `next`, then create the immutable Agent archive and staged Registry entry exactly once:

```bash
npm run agent:release -- --version X.Y.Z
```

The release command MUST fail if `generated/agent/versions/vX.Y.Z/` or the matching Registry entry already exists. It does not publish the archive or advance `latest_agent_distribution`.

Inspect all generated diffs and commit the complete candidate. Then, from that clean candidate commit, run:

```bash
npx playwright install chromium firefox webkit
npm run validate
npm run test:tooling
npm run test:reference
npm audit --audit-level=moderate
```

Also verify:

- `DESIGN.md`, `package.json`, `package-lock.json`, README badges, the adoption example, and `CHANGELOG.md` use the same exact version.
- The adoption example records the matching tag revision and the SHA-256 computed from canonical UTF-8 `DESIGN.md` text after optional BOM removal and line-ending normalization; consuming projects receive this expected checksum before copying the local contract.
- `components/catalog.md`, `components/catalog.json`, and `components/terminology.json` describe the same component set; no candidate or draft component is presented as complete.
- `DELIVERY.md`, the adoption configuration, and the evidence Schema agree on contract-first, Variables-only Figma interoperability, and project-owned runtime components.
- The adoption evidence example remains `initialized`; a release example MUST NOT contain fabricated passing verification or production observation.
- Generated Tailwind, DTCG, and Figma Variables files are committed.
- Generated Agent `next` artifacts match their declared inputs, and every locale keeps its actual review state. `next` is a mutable development endpoint and MUST NOT be described as stable.
- The current release has one `staged` Registry entry, its archive Manifest and file list match the generated release output, `latest_agent_distribution` has not advanced, and no staged version appears in the Pages output.
- Reference screenshots have been reviewed in light, dark, high-contrast, desktop, and mobile states.
- Normal-motion, reduced-motion, Firefox smoke, WebKit smoke, reflow-proxy, long-content, RTL, and Forced Colors results are reported according to [`principles/verification.md`](./principles/verification.md).
- Real browser zoom and screen-reader work are either recorded with an environment and findings or explicitly reported as not verified.
- The KIN Agent Skill passes `quick_validate.py`.
- No secrets, build output, Playwright reports, or local screenshots are staged.
- External links and current third-party package licenses have been reviewed.

`npm run validate` uses `release:check:pre-tag`. For `release_status: released`, that route checks every release-candidate condition except the existence and contents of a not-yet-created current-version Tag. If that Tag already exists, pre-Tag validation verifies it opportunistically and rejects reuse against a different commit.

Run candidate validation only after committing all release files: released-candidate validation requires a clean working tree.

## Publish order

1. Create one clean release-candidate commit with lifecycle fields, Changelog, adoption locator, generated `next`, immutable Agent archive, staged Registry entry, README badges, and showcase copy aligned.
2. Run `npm run validate`, the remaining matrix above, and human review on that commit.
3. Push the reviewed commit or merge its pull request to `main`.
4. Wait for the `Validate documentation` workflow to pass on that exact `main` commit. Because the candidate already presents release copy while its Tag and final Release do not yet exist, the documentation-triggered Pages workflow MUST defer the complete deployment. The public showcase and `/next/` remain at the preceding verified deployment during this bounded interval; the committed `generated/agent/next/` tree is still the review source. The staged version directory and root stable aliases remain withheld.
5. Create an annotated version Tag, for example `v3.0.0`, on that exact commit.
6. Run `npm run release:check:post-tag` and `npm run agent:check:history -- --version X.Y.Z` locally. They require the annotated Tag, exact archive commit, matching tagged contract and Registry bytes, and a complete checkout.
7. Push the Tag and wait for `Validate release tag` to pass. That workflow also requires the tagged commit to be reachable from `origin/main` and rechecks immutable Agent history.
8. Create and publish the GitHub Release from the matching `CHANGELOG.md` section. The `release.published` event is the formal-release Pages trigger; the deploy job revalidates the Tag, Release, and `main` ancestry before it publishes the release showcase and refreshes `/next/`. The staged immutable Agent directory remains withheld until promotion.
9. Manually run `Validate Agent release` with the exact version and require its `Validate Agent vX.Y.Z` run to succeed. It has read-only repository permissions and reports promotion eligibility only after local and remote annotated Tag objects and commits, complete archive history, semantic archive validation, the successful Tag workflow, the final GitHub Release, and the staged Registry entry agree.
10. From a clean checkout of the same current `main` revision, run `npm run agent:promote -- --version X.Y.Z`. The command MUST independently require the final Release, successful Tag CI, and the exact successful read-only eligibility run before it writes the Registry. Inspect that only `generated/agent/versions.json` changed, commit it as a focused promotion, and merge it through normal review.
11. Wait for `Validate documentation` and the subsequent Pages deployment on that promotion commit. The build now exposes the immutable version and advances root aliases; the deployment verifies direct, exact public response bytes and records measured host MIME limitations.
12. Verify the immutable Agent Manifest, root alias resolver, pinned contract URL in `adoption/kin.config.example.json`, and GitHub Release link.

Do not create the Tag before the release commit reaches validated `main`. Do not move, reuse, replace, or regenerate a published version Tag or Agent archive. Do not promote from a dirty worktree or bypass the read-only eligibility workflow. Repository rules SHOULD prevent release Tag creation or replacement outside the reviewed release path; local validation can prove the current remote Tag object, but cannot reconstruct deleted historical Tag objects.

## Repository settings

For a public release, review the GitHub description, topics, branch/ruleset protection, required status checks, immutable release-Tag protection, and private vulnerability reporting. These settings are outside the repository and are not validated by local scripts.

## Rollback

Do not rewrite a published Tag or immutable Agent archive.

- If a promotion commit is faulty before Pages deploys, revert that focused Registry commit.
- If the stable alias points to a faulty but previously valid bundle, start from a clean current `main` checkout and run `npm run agent:rollback -- --from X.Y.Z --to <A.B.C|none> --status <superseded|unsupported> [--advisory-url https://...]`. The command verifies retained history, prepares only `generated/agent/versions.json`, keeps the Registry Schema pinned to an immutable released bundle, and either moves the pointer to a supported release or withdraws it.
- To change the support state of a released version that is not the current stable target, run `npm run agent:support -- --version X.Y.Z --status <supported|superseded|unsupported> [--replacement <A.B.C|none>] [--advisory-url https://...]`. A superseded version requires a supported replacement. Use rollback instead for the current stable target.
- Advisory locators MUST be stable absolute HTTPS URLs without user information, credentials, signed or secret-bearing query parameters, or any query string. Put mutable tracking outside the public Registry.
- Inspect and commit that Registry change alone. Run the complete validation matrix and allow the normal documentation-triggered Pages path to rebuild aliases; never hand-edit the generated Registry.
- Correct immutable content only in a patch release with a new version directory, Tag, GitHub Release, and promotion.
- Document the affected behavior and migration in `CHANGELOG.md`.
