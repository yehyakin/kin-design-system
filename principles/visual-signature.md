# KIN visual signature

Status: normative

The KIN visual signature is the set of observable composition, hierarchy, density, material, semantic, and motion decisions that make a finished interface feel intentional and recognizably KIN. It is not a copied layout, a fixed brand palette, or a collection of Token values.

A product can map every KIN Token and still fail this contract. A product can preserve its own brand and still satisfy it.

## Common signature

Every KIN interface MUST satisfy the following principles at the page or workflow level.

### 1. The task appears before the explanation

- The first meaningful view MUST expose the subject, current task, search, list, document, object, or action the user came to use.
- A product MUST NOT place a marketing Hero, decorative graph, generic value proposition, or implementation showcase ahead of the primary task inside a working product.
- Explanatory content SHOULD sit beside, below, or progressively behind the task unless understanding it is itself the task.

### 2. One region owns attention

- Each state MUST have one dominant work or reading region.
- Navigation, global actions, metadata, secondary properties, and status chrome MUST recede after orientation.
- Equal visual weight MUST NOT be assigned to several unrelated panels merely because a grid is available.

### 3. Structure is continuous

- KIN SHOULD use alignment, rhythm, columns, property rows, dividers, and small surface steps before introducing containers.
- A Surface MUST represent a real boundary such as an independent object, overlay, selected context, or task mode.
- Ordinary prose, metadata, activity, property groups, filters, and table regions MUST NOT become nested cards by default.
- Light themes MUST NOT become white-card walls on a gray canvas. Dark themes MUST NOT become isolated black boxes with bright borders.

### 4. Density removes repetition

- Repeated values and actions MUST align predictably.
- Labels, helper text, headings, and actions MUST NOT be repeated in every row when a shared column, group, or view control can carry the meaning once.
- Primary desktop rows SHOULD normally remain within the KIN density range defined in [`visual-taste.md`](./visual-taste.md); touch targets MUST retain their required hit area.
- Empty space MUST clarify priority or scanning. Large unused regions MUST NOT substitute for unresolved composition.

### 5. Neutral structure, precise emphasis

- Most of the interface MUST remain neutral.
- One primary interaction accent SHOULD identify focus, selection, links, and primary actions. Product semantic colors MUST retain their own meanings.
- Icons MUST use one coherent monochrome family unless a product-owned asset has a documented reason to differ.
- Color, icons, badges, and motion MUST NOT compensate for weak content order or alignment.

### 6. Semantics remain separate

- Status, risk, confidence, completeness, availability, permission, and task progress MUST remain separate concepts when the product distinguishes them.
- Meaning MUST be readable without color.
- A summary MUST NOT collapse independent judgments into one attractive score or badge.

### 7. Motion explains change

- Panels, Drawers, Popovers, selection, and committed results MUST use motion to preserve origin, direction, or state continuity.
- Motion MUST begin from the current visual state and remain interruptible where the interaction can reverse.
- Decorative entrance sequences, repeated card lifting, automatic counting, and generic page fades MUST NOT be used to manufacture polish.
- Reduced Motion MUST preserve the same hierarchy and final state without requiring movement.

## Product-family signatures

The common signature is required, but composition changes with the job.

### Information site

- Search, subject identity, reading content, or the record list leads the first view.
- Source, revision, currency, and stable location remain available without promotional detours.
- Reading pages use a deliberate content measure; records, tables, and citations MAY expand when their content requires width.
- Cards are reserved for independent records or collections, not ordinary paragraphs and navigation links.

### Intelligence workspace

- Current entity identity and state remain visible while the user changes list selection, evidence, history, or properties.
- Database work SHOULD use a list, Split View, Detail view, or Inspector relationship rather than a landing-page composition.
- Activity is a flat chronological record; evidence and properties are structured rows, not decorative timeline and stat cards.
- Risk, evidence confidence, completeness, online health, and AI confidence remain visually and semantically distinct.

### Ecommerce operations

- Catalog, order, inventory, campaign, creative, approval, or exception work owns the first view.
- Money, units, inventory, deadlines, channels, ownership, and state align for comparison.
- AI suggestions appear inside review and execution context; a generic assistant panel does not replace the operating workflow.
- Media receives space according to the decision being made, not as decorative merchandising inside an operations tool.

### Engineering canvas

- The canvas, document, model, revision, or measured object dominates.
- Tool chrome and layers remain available but visually secondary to the work.
- Inspector content follows the current selection; it does not become a permanent dashboard.
- Units, constraints, saved state, generated changes, and revision history stay explicit.

## Adoption claims

Use these terms precisely.

| Claim | Evidence required |
|---|---|
| Token-compatible | Semantic Token mapping exists and themes resolve correctly |
| Component-mapped | In-scope KIN components are mapped to project-owned implementations |
| KIN foundation | Tokens, typography, themes, focus, and motion foundations are implemented |
| Visibly KIN | One representative production workflow satisfies this visual-signature contract in realistic states |
| KIN verified | The representative workflow, scoped routes, automated checks, manual checks, screenshots, owners, exceptions, and rollback are recorded in adoption evidence |

- A design lab, Storybook, component gallery, or static fixture MUST NOT be described as a production workflow.
- A passing build, lint result, Token export, or isolated component screenshot MUST NOT be described as visible KIN adoption.
- Migrating one header, two low-priority pages, or only the happy state MUST NOT be used to imply that an entire product has adopted KIN.
- Partial adoption MAY be valuable, but the exact routes, workflows, and exclusions MUST be named.

## Representative workflow review

Before a project claims `Visibly KIN`, it MUST select one real, high-value workflow and record:

1. the user, task, entry route, current object, and completion condition;
2. the baseline interface with realistic content and state;
3. the proposed composition before component styling begins;
4. the implemented light and dark views at the same named viewport and state;
5. narrow-screen behavior and the preserved priority order;
6. loading, empty, error, partial, stale, permission, and recovery states that apply;
7. a human screenshot review against the common and product-family signatures;
8. unresolved findings, owner, rollout, and rollback.

The project-owned implementation brief MUST be complete before this review begins. In a hybrid product, the workflow MUST use the profile assigned to its route family rather than the project's primary profile by default.

The baseline and candidate artifacts MUST use comparable content and viewport conditions. A polished fixture with different data is not a valid before-and-after comparison.

The machine-readable review MUST record each of these criteria separately: task first, one dominant region, continuous structure, density without repeated explanation, semantic separation, theme integrity, motion continuity, responsive priority, and no fabricated data or behavior. A general comment such as “looks like KIN” cannot replace the criterion results.

## Review questions

- What is the first visible task, subject, or object?
- Which single region owns attention?
- What can be flattened from a card into alignment, spacing, or a row?
- Does chrome recede after location is understood?
- Are repeated labels and actions aligned rather than restated?
- Can risk, confidence, completeness, availability, and progress be distinguished without relying on color?
- Does the light theme retain structure without a card wall?
- Does the dark theme retain hierarchy without glow or hard black boxes?
- Does motion explain origin, direction, or completion?
- Would the page still be recognizably structured if accent colors and icons were removed?

## Failure patterns

The following are evidence that a visual-signature review is required:

- a centered max-width page with kicker, title, description, and several equal CTA buttons before the real task;
- a dashboard composed primarily of equal stat cards and chart cards;
- a component laboratory presented as the redesigned product;
- a Sidebar, Top Bar, and Inspector added around an unchanged landing-page interior;
- theme colors mapped correctly while hierarchy, typography, density, and composition remain generic;
- large explanatory panels describing the interface instead of letting the interface perform the task;
- invented counts, health states, versions, live labels, or graph activity used to make the design look complete;
- every section receiving its own border, radius, icon, kicker, and description;
- a dark theme treated as sufficient evidence of a professional workspace.

## Acceptance

A representative workflow passes this contract only when:

- the primary task or reading job is visible before promotional or explanatory material;
- one dominant region is evident in both light and dark themes;
- the composition uses the selected product pattern rather than a generic page template;
- container count and visual weight follow real boundaries;
- realistic data and applicable failure states preserve the hierarchy;
- desktop and narrow-screen views preserve the same priority, even when their layouts differ;
- a named human reviewer records findings from comparable screenshots;
- remaining deviations are scoped, owned, and not hidden behind a general KIN-compliant claim.
