# Runtime integration workflow

Use this workflow when a task evaluates an official third-party package, changes a KIN adapter, or migrates a React product to a pinned `@kin-design/react` subpath.

## 1. Read the ownership boundary

- Read `integrations/catalog.md`, `packages/react/RFC.md`, `packages/react/ADOPTION.md`, and the relevant file in `integrations/` from the KIN repository.
- Read the consuming project's package manifest, lockfile, current adapter, Token source, rendering boundary, tests, and rollback mechanism.
- Confirm the exact KIN component maturity. `runtime-integrated` does not promote a candidate component to `stable`.
- Confirm that the task is authorized to add or change a dependency. Otherwise document the decision and stop before installation.

## 2. Prefer preservation over replacement

- Keep a working official-package integration when it already satisfies the product contract.
- Evaluate a KIN subpath only when it solves a named semantic, accessibility, theme, evidence, migration, or maintenance problem.
- Preserve upstream animation, gesture, focus, measurement, virtualization, input, and state engines. Do not replace mature behavior with a visual imitation.
- Keep product data, permissions, network, persistence, recovery, analytics, and localization in the consuming product.

## 3. Integrate one bounded capability

- Pin the KIN repository revision, the private package version, and each official dependency exactly during pre-release evaluation.
- Import only the required subpath and `@kin-design/react/styles.css` once after product Token definitions.
- Map the adapter to a real local component and representative workflow. An Integration Lab fixture is not production evidence.
- Retain the previous component boundary until the candidate passes and rollback has been exercised.
- Keep `/dev/leva` out of every production entry.

## 4. Verify the real product path

Record and run the checks that apply to the selected adapter:

- type checking, build, export resolution, SSR and hydration;
- root and subpath bundle contents;
- light, dark, higher-contrast and Reduced Motion behavior;
- pointer, keyboard, touch and focus restoration;
- long labels, locale ownership and RTL boundary;
- loading, empty, failure, recovery and cancellation states;
- previous-component rollback.

Use `npm run runtime:check` and `npm run site:check` in the KIN repository when changing the package or its public reference. These commands are KIN repository evidence; the consuming project still runs its own commands and representative-workflow checks.

## 5. Deliver without overstating

Report:

- exact official package and KIN subpath;
- current KIN component maturity;
- user problem and why the prior component was insufficient;
- upstream behavior preserved and KIN-owned adaptation;
- product-owned work that remains;
- bundle, rendering, interaction, accessibility and localization evidence;
- migration and tested rollback;
- unresolved manual or production evidence.

Do not describe a private pre-release package, successful lab build, or isolated adapter test as a supported universal runtime or completed KIN adoption.
