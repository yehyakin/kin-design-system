# Workspace reference

This framework-free reference page exercises KIN's app shell, navigation, data rows, activity feed, Inspector, themes, focus states, responsive behavior, and reduced motion.

It is a visual regression fixture, not a component package or a required product layout.

Open [`index.html`](./index.html) directly or serve the repository root:

```bash
node scripts/serve-reference.mjs
```

Then visit `http://localhost:4173/examples/workspace-reference/`.

Review at minimum:

- 1440×900 light and dark;
- 1024×768 with the Inspector overlay;
- 390×844 light and dark;
- keyboard focus from the skip link through navigation, theme controls, rows, and Inspector;
- reduced motion and system-theme changes.

Run automated behavior checks and create review screenshots:

```bash
npm install
npx playwright install chromium
npm run test:reference
```

Screenshots are test artifacts rather than permanent design assets. CI uploads them for human review without using platform-sensitive pixel differences as a merge gate.
