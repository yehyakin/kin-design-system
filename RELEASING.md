# Releasing KIN

KIN releases publish a design contract, generated interoperability files, reference interfaces, and project-adoption tooling as one versioned unit.

## Before the release commit

```bash
npm ci
npx playwright install chromium firefox webkit
npm run tokens:export
npm run validate
npm run test:tooling
npm run test:reference
npm audit --audit-level=moderate
```

Also verify:

- `DESIGN.md`, `package.json`, `package-lock.json`, README badges, the adoption example, and `CHANGELOG.md` use the same exact version.
- The adoption example records the matching tag revision and the SHA-256 computed from the release `DESIGN.md`; consuming projects receive this expected checksum before copying the local contract.
- `components/catalog.md`, `components/catalog.json`, and `components/terminology.json` describe the same component set; no candidate or draft component is presented as complete.
- `DELIVERY.md`, the adoption configuration, and the evidence Schema agree on contract-first, Variables-only Figma interoperability, and project-owned runtime components.
- The adoption evidence example remains `initialized`; a release example MUST NOT contain fabricated passing verification or production observation.
- Generated Tailwind, DTCG, and Figma Variables files are committed.
- Reference screenshots have been reviewed in light, dark, high-contrast, desktop, and mobile states.
- Normal-motion, reduced-motion, Firefox smoke, WebKit smoke, reflow-proxy, long-content, RTL, and Forced Colors results are reported according to [`principles/verification.md`](./principles/verification.md).
- Real browser zoom and screen-reader work are either recorded with an environment and findings or explicitly reported as not verified.
- The KIN Agent Skill passes `quick_validate.py`.
- No secrets, build output, Playwright reports, or local screenshots are staged.
- External links and current third-party package licenses have been reviewed.

## Publish order

1. Push the reviewed commit or merge its pull request to `main`.
2. Wait for the `Validate documentation` workflow to pass on that exact commit.
3. Create the annotated version tag, for example `v2.0.0`, on that commit.
4. Push the tag and create the GitHub Release from the matching `CHANGELOG.md` section.
5. Verify the pinned contract URL in `adoption/kin.config.example.json` resolves.

Do not create the tag before the release commit reaches `main`. Do not move or reuse a published version tag.

## Repository settings

For a public release, review the GitHub description, topics, branch/ruleset protection, required status checks, and private vulnerability reporting. These settings are outside the repository and are not validated by local scripts.

## Rollback

Do not rewrite a published tag. Revert the faulty commit on `main`, publish a patch version, regenerate all outputs, and document the affected behavior and migration in `CHANGELOG.md`.
