# Workspace reference

This reference page exercises KIN's app shell, navigation, data rows, activity feed, spatial Inspector motion, themes, localization, Lucide icons, Sonner success/error/loading updates, paired-state replacement, committed async results, focus states, responsive behavior, and reduced motion.

It is a visual regression fixture, not a component package or a required product layout.

`states.html` covers shared state relationships. `core-components.html` is the runnable acceptance reference for authentication, actions and selection, forms and entry, navigation and disclosure, data display, motion and feedback, and overlays. It includes a local-only sign-in and reauthentication fixture, lazy Sonner task feedback, directionally consistent Drawer motion, a deterministic local File Upload lifecycle, and full-value Truncation access without claiming a production identity or storage pipeline.

`motion.html` is the dedicated Motion Lab. It exposes stable icon slots, paired and asynchronous Button states, icon-supported Menu rows, animated Menu and Popover closing phases, Disclosure, updating Sonner tasks, and a right-edge Drawer that adapts to a bottom Sheet on narrow screens. It also includes a rapid close/reopen demonstration so interruption can be reviewed directly.

The main workspace page also demonstrates Location Bar action priority and overflow. The engineering canvas product pattern carries the Toolbar and Split View reference used by the workspace-structure contract.

`advanced-components.html` is a deterministic local interaction fixture for AI Composer, streaming stop/retry, evidence, suggested changes, execution scope, media review, background tasks, and accessible charts. It does not contact a model or remote service.

Build the showcase, then serve the generated output:

```bash
npm run site:build
npm run site:serve
```

Then visit `http://localhost:4174/examples/workspace-reference/` and `http://localhost:4174/examples/workspace-reference/motion.html`.

Review at minimum:

- 1440×900 light and dark;
- 1024×768 with the Inspector overlay;
- 390×844 light and dark;
- keyboard focus from the skip link through navigation, language and theme controls, rows, and Inspector;
- English and Chinese content, lazy Sonner loading, success/error/task feedback, and Lucide replacement;
- local-only sign-in, password visibility, contextual reauthentication, button press, paired-state replacement, pending, completion, disclosure, Drawer, failure, and reduced-motion behavior;
- normal and reduced motion, system-theme changes, reflow, long-content and RTL stress, and Forced Colors;
- real browser zoom and a screen-reader pass when a release claims those behaviors, recorded according to [`principles/verification.md`](../../principles/verification.md).

Run automated behavior checks and create review screenshots:

```bash
npm install
npx playwright install chromium firefox webkit
npm run test:reference
```

The full Chromium regression runs under reduced motion, a separate Chromium project checks normal motion, and Firefox/WebKit run named smoke coverage. Screenshots are test artifacts rather than permanent design assets. CI uploads them for human review without using platform-sensitive pixel differences as a merge gate. These checks do not establish complete WCAG or browser conformance.
