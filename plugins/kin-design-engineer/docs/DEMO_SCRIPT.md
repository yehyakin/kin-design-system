# KIN Design Engineer demo — target 2:30

The official limit is under three minutes. The recording must include audio explaining both Codex and GPT-5.6 use and must be publicly visible on YouTube.

## Safe recording setup

- Use a disposable AgentOS worktree at baseline commit `dcb8577183e858bf5b8892fa79b03ad5fa7c57b0`; do not reset the working repository.
- Keep AgentOS in deterministic demo mode so the video does not depend on an API key, provider, cost, or network response.
- Hide notifications, credentials, private remotes, and unrelated files.
- Show GPT-5.6 selected in Codex near the beginning.
- Keep the KIN checkout and disposable AgentOS target visible by name, but avoid exposing private paths if the video is public.

## Shot list and narration

### 0:00–0:15 — Problem

**Screen:** AgentOS baseline, then KIN Design Engineer in the Plugins Directory or plugin README.

**Narration:**

“A design system can describe quality, but teams still need to know whether a real product follows it. Linters find patterns; screenshots show one moment. Neither can judge the complete interaction.”

### 0:15–0:30 — Real plugin and GPT-5.6

**Screen:** Installed KIN Design Engineer plugin and the GPT-5.6 model selection in Codex.

**Narration:**

“KIN Design Engineer is an installable Codex plugin. A deterministic collector narrows the search, while GPT-5.6 in Codex reads the relevant KIN contracts, judges candidates in context, and controls the repair and verification workflow.”

### 0:30–0:50 — Deterministic preflight

**Screen:** Run the collector on the AgentOS baseline. Hold on the candidate table.

**Narration:**

“The collector found twenty review candidates. It did not run the app, call a model, edit code, or claim these were all defects. It only produced evidence for the next step.”

### 0:50–1:10 — Confirm the issue

**Screen:** Invoke audit mode. Show the two textarea focus rules in source and the missing visible focus boundary in the baseline UI.

**Narration:**

“GPT-5.6 rejected valid status-pill matches, but confirmed two P1 keyboard-focus failures. The global focus style existed, yet higher-specificity textarea rules removed it in the real cascade.”

### 1:10–1:30 — Authorized repair

**Screen:** Approve the bounded repair in the disposable worktree. Show the concise diff.

**Narration:**

“The plugin does not edit during an audit. After authorization, it restores visible focus and applies KIN and Emil craft principles to the product's own brand—not a copied aesthetic.”

### 1:30–1:58 — Verify the real product

**Screen:** AgentOS desktop light and dark, Chinese, running replay, cancel, completed brief, then 390-pixel mobile.

**Narration:**

“The repaired product now supports English and Chinese, light, dark, and system preferences, transparent replay and provider labels, cancellation, retry, and a responsive decision brief. The mobile check caught one more issue: the native preference controls looked large but exposed only a sixteen-pixel target, so the actual selects were repaired.”

### 1:58–2:15 — Independent target

**Screen:** kin3.net production-asset regression test, then the preserved brand composition.

**Narration:**

“On a second product, the same workflow found something the scanner could not: the production page returned HTML while its CSS and JavaScript returned 404 on Windows. It repaired the path boundary, added a regression test, improved touch and Reduced Motion behavior, and preserved the product's valid brand gradients.”

### 2:15–2:30 — Honest result

**Screen:** Final scan with 4 P2 candidates and the verification report's ‘Not verified’ section.

**Narration:**

“AgentOS finishes with four reviewed exceptions, and every report states what was not tested. KIN Design Engineer turns a design contract into an evidence-led engineering loop—without pretending that AI certainty is proof.”

## Final recording checks

- [ ] GPT-5.6 selection is visible and named aloud.
- [ ] The collector is described as deterministic, not as a model call.
- [ ] Audit and repair authority are visibly separate.
- [ ] AgentOS is clearly identified as the case-study target, not the submitted plugin itself.
- [ ] kin3.net is shown briefly as independent validation, not as a second submission.
- [ ] Replay mode visibly says that no API call occurred.
- [ ] No API key, provider URL, personal notification, or private repository detail is visible.
- [ ] Audio is clear and total duration remains below three minutes.
- [ ] The video is public on YouTube before adding it to Devpost.
