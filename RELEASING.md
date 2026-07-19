# Releasing KIN

KIN releases publish a design contract, generated interoperability files, reference interfaces, and project-adoption tooling as one versioned unit.

## Prepare and validate the release candidate

```bash
npm ci
npm run tokens:export
npm run agent:export
```

Update the release metadata, inspect all generated diffs, and commit the complete candidate. Then, from that clean candidate commit, run:

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
- Generated Agent `next` artifacts match their reviewed inputs. While RFC 001 remains before Phase 2, they are repository-only and MUST NOT be described as published stable endpoints.
- Reference screenshots have been reviewed in light, dark, high-contrast, desktop, and mobile states.
- Normal-motion, reduced-motion, Firefox smoke, WebKit smoke, reflow-proxy, long-content, RTL, and Forced Colors results are reported according to [`principles/verification.md`](./principles/verification.md).
- Real browser zoom and screen-reader work are either recorded with an environment and findings or explicitly reported as not verified.
- The KIN Agent Skill passes `quick_validate.py`.
- No secrets, build output, Playwright reports, or local screenshots are staged.
- External links and current third-party package licenses have been reviewed.

`npm run validate` uses `release:check:pre-tag`. For `release_status: released`, that route checks every release-candidate condition except the existence and contents of a not-yet-created current-version Tag. If that Tag already exists, pre-Tag validation verifies it opportunistically and rejects reuse against a different commit.

Run candidate validation only after committing all release files: released-candidate validation requires a clean working tree.

## Publish order

1. Create one clean release-candidate commit with lifecycle fields, Changelog, adoption locator, generated outputs, README badges, and showcase copy aligned.
2. Run `npm run validate`, the remaining matrix above, and human review on that commit.
3. Push the reviewed commit or merge its pull request to `main`.
4. Wait for the `Validate documentation` workflow to pass on that exact `main` commit. The Pages workflow deliberately defers a `released` candidate at this point, so it cannot publish formal-release copy before the matching Tag exists.
5. Create an annotated version Tag, for example `v3.0.0`, on that exact commit.
6. Run `npm run release:check:post-tag` locally. It requires the annotated Tag, exact `HEAD` commit, and matching tagged `DESIGN.md` bytes.
7. Push the Tag and wait for `Validate release tag` to pass. That workflow also requires the tagged commit to be reachable from `origin/main`; only then may the Pages workflow deploy the released showcase.
8. Create the GitHub Release from the matching `CHANGELOG.md` section.
9. Verify the pinned contract URL in `adoption/kin.config.example.json` resolves.

Do not create the Tag before the release commit reaches validated `main`. Do not move, reuse, or replace a published version Tag. RFC 001 Phase 2 adds separate immutable Agent Archive and promotion gates; Phase 1 does not imply them.

## Repository settings

For a public release, review the GitHub description, topics, branch/ruleset protection, required status checks, and private vulnerability reporting. These settings are outside the repository and are not validated by local scripts.

## Rollback

Do not rewrite a published tag. Revert the faulty commit on `main`, publish a patch version, regenerate all outputs, and document the affected behavior and migration in `CHANGELOG.md`.
