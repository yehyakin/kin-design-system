# KIN Design Engineer for Codex

Status: experimental Build Week preview (`0.1.0`)

This plugin is the primary OpenAI Build Week submission candidate. The selected track is **Developer Tools**; AgentOS is the real frontend used to demonstrate candidate collection, model judgment, authorized repair, and bounded verification.

KIN Design Engineer turns the active Codex model into a KIN-aware frontend reviewer and repair agent. It combines the authoritative KIN contracts, deterministic static candidates, source inspection, browser evidence, authorized code edits, and explicit verification limits.

It is a real Codex plugin and Skill, not a simulated chat screen. It does not contain an OpenAI API client or API key. When the Codex session is running GPT-5.6, GPT-5.6 performs the reasoning, edits, and tool orchestration; the local collector only prepares deterministic evidence.

## What it can do

- audit a frontend without editing it;
- confirm static candidates against source and rendered behavior;
- repair confirmed issues when the user explicitly asks;
- check responsive layouts, themes, keyboard paths, hover and touch behavior, loading and error states, and Reduced Motion where applicable;
- report changed files, commands, browser observations, unverified claims, and rollback.

The plugin does not declare a project KIN-compliant from a scan, build, screenshot, or model review.

## Requirements

- Codex or the ChatGPT desktop app with local plugin support;
- Node.js 20.11 or newer for the evidence collector;
- a complete KIN checkout for an authoritative KIN audit;
- a runnable target frontend for rendered verification.

No separate OpenAI API key is required because the host Codex session supplies the model.

## Local installation

This repository includes a local marketplace at `.agents/plugins/marketplace.json`. From a clone of the KIN repository, add that marketplace and install the plugin:

```bash
codex plugin marketplace add <KIN checkout>
codex plugin add kin-design-engineer@kin-local
```

The marketplace entry points to `./plugins/kin-design-engineer`:

```json
{
  "name": "kin-local",
  "interface": {
    "displayName": "KIN Local"
  },
  "plugins": [
    {
      "name": "kin-design-engineer",
      "source": {
        "source": "local",
        "path": "./plugins/kin-design-engineer"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

Restart the Codex or ChatGPT desktop app after installation, then start a new task before invoking the Skill. The app installs a cached copy; restart and reinstall after replacing or updating the local plugin source.

## Run the deterministic preflight

From the KIN checkout:

```bash
node plugins/kin-design-engineer/skills/kin-design-engineer/scripts/collect-evidence.mjs ../your-project --kin-root . --format markdown
```

The collector reads supported frontend source, `kin.config.json`, package metadata, and known instruction files. It never executes or edits the target project, installs dependencies, calls a model, or accesses the network.

## Run the model workflow

Open the target frontend in Codex, select the intended model, and invoke:

```text
$kin-design-engineer Audit this frontend with the KIN checkout at <path>. Confirm candidates in the rendered UI and do not edit.
```

For an authorized repair:

```text
$kin-design-engineer Fix the confirmed KIN issues in this workflow, preserve product behavior, and verify desktop, mobile, keyboard, dark mode, and Reduced Motion.
```

The Skill chooses `audit`, `repair`, or `verify`, loads the target's own instructions before KIN, runs the evidence collector, follows the authoritative `skills/kin-design/SKILL.md` routing, and reports results in a Before/After/Why table.

## Build Week evidence

Record these separately in the demo:

1. the installed plugin and version;
2. the GPT-5.6 model selection visible in the Codex session;
3. the initial deterministic evidence packet;
4. a confirmed finding in source and the rendered state;
5. an authorized patch;
6. the actual checks and browser states exercised;
7. remaining unverified claims.

Do not describe the deterministic collector as a model call. Do not describe RFC 001's proposed Agent Distribution Layer as accepted or implemented.

## Development checks

```bash
npm run test:plugin
python <codex-home>/skills/.system/skill-creator/scripts/quick_validate.py plugins/kin-design-engineer/skills/kin-design-engineer
python <codex-home>/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/kin-design-engineer
```

Repository validation and a real target trial remain separate from the plugin's unit tests.

See the [AgentOS repair trial](./examples/agentos-trial.md) for the primary candidate-to-confirmation-to-verification case and the [kin3.net independent trial](./examples/kin3-trial.md) for a second product with a browser-discovered production failure.

## Build Week package

- [Submission draft](./docs/BUILD_WEEK_SUBMISSION.md)
- [Under-three-minute demo script](./docs/DEMO_SCRIPT.md)
- [Verification record](./docs/VERIFICATION_RECORD.md)
