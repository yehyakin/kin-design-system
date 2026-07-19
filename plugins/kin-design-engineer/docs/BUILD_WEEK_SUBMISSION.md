# OpenAI Build Week submission draft

Verified against the official OpenAI Build Week page, Devpost rules, and Devpost FAQ on 2026-07-19.

- Submission deadline: July 21, 2026 at 5:00 PM PDT / July 22, 2026 at 8:00 AM China Standard Time
- Track: **Developer Tools**
- Official event: <https://openai.com/build-week/>
- Official rules: <https://openai.devpost.com/rules>
- FAQ: <https://openai.devpost.com/details/faqs>

## Project overview

**Name**

KIN Design Engineer

**Elevator pitch**

KIN Design Engineer turns GPT-5.6 in Codex into an evidence-led frontend audit, repair, and verification agent grounded in the KIN design contract.

**Built with**

Codex, GPT-5.6, Codex plugins and Skills, KIN Design 3, Node.js, browser automation, deterministic source analysis

## Inspiration

Design systems document what good software should feel like, but documentation alone does not tell a team whether a real product still follows the contract. Static linters find syntax patterns but cannot decide whether a pill is a valid status, whether a gradient communicates data, whether a focus treatment survives the CSS cascade, or whether a polished desktop view collapses on mobile.

I wanted the design system to become executable without pretending that a regex, screenshot, or model opinion is proof. KIN Design Engineer combines deterministic evidence with GPT-5.6 judgment, rendered verification, explicit edit authority, and an honest record of what was not tested.

## What it does

KIN Design Engineer is an installable Codex plugin and Skill for auditing, repairing, and verifying frontends against the KIN design contract.

It:

- loads the target repository's own instructions before the design-system rules;
- collects deterministic source candidates without running code, calling a model, editing files, or using the network;
- routes GPT-5.6 in Codex to the relevant KIN contracts instead of dumping the entire design system into one prompt;
- confirms or rejects candidates against source and the rendered product;
- edits only after the user authorizes a repair;
- checks responsive layout, focus, themes, localization, hover and touch targets, loading and error states, and Reduced Motion where the environment allows;
- returns a Before / After / Why report with commands, browser evidence, rollback, and unverified claims.

The Build Week case study uses AgentOS, a working multi-agent commerce brief, as the target. The plugin found two real keyboard-focus failures, rejected valid pill candidates, helped remove decorative chrome that competed with the task, and verified the repaired bilingual light/dark product in deterministic replay.

## How it uses Codex and GPT-5.6

The local collector is intentionally not AI. It produces a small, reproducible packet of paths, line numbers, project signals, and review candidates.

GPT-5.6 runs inside the active Codex session. It performs the work that requires judgment: selecting the relevant KIN references, reading source in context, distinguishing defects from deliberate patterns, planning authorized edits, applying the patch, controlling the browser, and writing an evidence-bounded report. The final video must show the GPT-5.6 model selection in Codex and explain this boundary aloud.

No separate OpenAI API key is required for the plugin itself.

## How it was built

The plugin package contains:

- a Codex plugin manifest;
- one routed `kin-design-engineer` Skill with audit, repair, and verify modes;
- runtime-boundary and report-format references;
- a read-only Node.js evidence collector;
- deterministic candidate-scan helpers and unit tests;
- installation, judge-testing, and AgentOS case-study documentation.

The existing KIN design system predates Build Week. The installable plugin, collector, tests, runtime boundary, report contract, and AgentOS repair case were created or meaningfully extended with Codex and GPT-5.6 during the submission period. The final repository must preserve timestamped commits that make this distinction clear.

## Challenges

The hardest part was resisting false certainty. A model can sound confident after reading a stylesheet, and a scanner can produce impressive counts, but neither establishes rendered quality. The plugin therefore treats every static match as a candidate, records the evidence type for every conclusion, and refuses blanket compliance claims.

The second challenge was making a design system useful without forcing one visual aesthetic onto every product. KIN provides hierarchy, token, interaction, accessibility, and verification contracts. Emil's design-engineering craft baseline guides the invisible details. The target product keeps its own brand.

## Accomplishments

- Packaged the KIN workflow as a real installable Codex plugin rather than a simulated chat interface.
- Built a deterministic collector with passing unit and package validation.
- Demonstrated the complete audit → confirm → authorize → repair → verify loop on a real Next.js product.
- Reduced the AgentOS scan from 20 candidates, including 2 confirmed P1 focus failures, to 4 reviewed P2 exceptions.
- Added bilingual UI, light/dark/system preferences, transparent provider labeling, localized replay fixtures, and improved responsive controls to the case-study target.
- Kept replay, compatible-endpoint configuration, official OpenAI usage, and model provenance visibly distinct.

## What I learned

The most useful AI design tool is not the one that produces the most screens. It is the one that can explain why a change is justified, prove which states it exercised, preserve valid exceptions, and stop at the edge of its evidence.

## What's next

- Add adapters for more frontend stacks and test runners.
- Add optional accessibility-tree and performance evidence without weakening the verification boundary.
- Package stable before/after fixtures for repeatable judge testing.
- Evaluate agreement between human reviewers and GPT-5.6 candidate decisions.
- Publish versioned KIN contract bundles once the plugin API is stable.

## Judge testing path

1. Install `plugins/kin-design-engineer` from the repository's local marketplace.
2. Open a runnable frontend in Codex with GPT-5.6 selected.
3. Invoke `$kin-design-engineer Audit this frontend; confirm candidates in the rendered UI and do not edit.`
4. Run the deterministic collector directly if desired; it requires Node.js 20.11+ and no credentials.
5. Invoke repair mode only on a disposable checkout or after reviewing the proposed scope.
6. Run the included plugin tests and validators from the repository README.

## Required links and evidence

- Live/demo testing path: repository-local plugin install; public instructions pending
- Repository URL: `TODO`
- Public YouTube video under three minutes: `TODO`
- Primary Codex `/feedback` Session ID: `TODO`
- Final local screenshots: `../agentos/artifacts/build-week/agentos-desktop-en-light-initial.jpg`, `agentos-desktop-en-light-complete.jpg`, `agentos-desktop-zh-dark-complete.jpg`, and `agentos-mobile-zh-dark.jpg`; upload still required
- Fresh-install result on a clean checkout: `TODO`

## Final submission checklist

- [x] One category selected: Developer Tools.
- [x] Existing KIN work is disclosed separately from the Build Week extension.
- [x] Project uses Codex and GPT-5.6 meaningfully.
- [x] Plugin package, deterministic testing path, and README exist.
- [x] AgentOS case demonstrates a real audit and authorized repair.
- [x] Capture and visually inspect final English/light, Chinese/dark, and mobile evidence images.
- [x] Confirm the package appears in the desktop app's personal marketplace.
- [x] Install the package after action-time confirmation and verify the cached `0.1.0` plugin plus enabled configuration entry.
- [ ] Commit the final KIN and AgentOS changes with timestamped history.
- [ ] Test installation from a clean clone or disposable worktree.
- [ ] Record the demo with audio and visible GPT-5.6 model selection.
- [ ] Upload the video publicly to YouTube.
- [ ] Publish the repository with licensing, or share the private repository with both judging addresses in the rules.
- [ ] Run `/feedback` in the primary Codex build task and add the Session ID.
- [ ] Add final screenshots and recheck every link without relying on a logged-in session.
- [ ] Review and submit on Devpost before the deadline; do not edit after it closes.
