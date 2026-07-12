# Workspace reference

This reference page exercises KIN's app shell, navigation, data rows, activity feed, Inspector, themes, localization, Lucide icons, Sonner success/error/loading updates, button-state motion, focus states, responsive behavior, and reduced motion.

It is a visual regression fixture, not a component package or a required product layout.

Build the showcase, then serve the generated output:

```bash
npm run site:build
npm run site:serve
```

Then visit `http://localhost:4174/examples/workspace-reference/`.

Review at minimum:

- 1440×900 light and dark;
- 1024×768 with the Inspector overlay;
- 390×844 light and dark;
- keyboard focus from the skip link through navigation, language and theme controls, rows, and Inspector;
- English and Chinese content, lazy Sonner loading, success/error/task feedback, and Lucide replacement;
- button press, toggle, pending, completion, and reduced-motion behavior;
- reduced motion and system-theme changes.

Run automated behavior checks and create review screenshots:

```bash
npm install
npx playwright install chromium
npm run test:reference
```

Screenshots are test artifacts rather than permanent design assets. CI uploads them for human review without using platform-sensitive pixel differences as a merge gate.
