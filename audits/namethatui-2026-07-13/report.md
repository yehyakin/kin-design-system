# Name That UI contribution assessment

Date: 2026-07-13
Status: informative; no KIN normative rule changed

## Scope

This assessment reviews <https://namethatui.com/> as a possible source for KIN component taxonomy, terminology, Agent prompting, and reference-interface planning.

The live reference was reviewed on the stated date. A local review screenshot was inspected but is intentionally not committed; KIN does not vendor external screenshots or brand assets.

## Verdict

Name That UI is useful to KIN as a **visual terminology dictionary**, not as a component implementation, design Token source, accessibility contract, or visual style reference.

It can directly help close approximately:

- **40–50% of the component-taxonomy gaps** identified in the KIN completeness audit;
- **5–8 percentage points of overall design-system completeness** if adopted only as a glossary and catalog source;
- **12–18 percentage points of component-contract completeness** if selected entries are rewritten into KIN anatomy, state, accessibility, responsive, localization, reference, and test contracts.

These values are directional. The source contains 54 entries—31 macOS and 23 web—but the number of entries is not the same as the number of production-ready components.

## What the source does well

### Names visible things precisely

The site pairs a rendered example with:

- a canonical UI name;
- common aliases;
- a plain-language definition;
- platform vocabulary where relevant;
- distinctions between visually similar patterns.

This is valuable for KIN because Agents frequently confuse:

- Popover, Dropdown Menu, and Tooltip;
- Modal Dialog, Drawer, and Sheet;
- Switch, Checkbox, and Radio;
- Badge, Chip, Pill, and Tag;
- Spinner, Progress Ring, Progress Bar, and Skeleton;
- Pop-Up Button, Pull-Down Button, and Combobox;
- Divider, Separator, and Rule.

### It improves prompts and reviews

KIN currently tells Agents how components should behave, but it does not provide a canonical naming dictionary. A visual terminology layer would help an Agent:

- identify the requested component before implementing it;
- avoid substituting a visually similar but behaviorally different primitive;
- search existing code with the right aliases;
- explain why a pattern is or is not appropriate;
- produce clearer audit findings and migration records.

### The web subset overlaps KIN's highest-priority gaps

The 23 web entries include many components already identified as incomplete or missing in KIN:

| Name That UI entry | Current KIN status | Contribution |
|---|---|---|
| Overflow Menu | Missing | canonical name, icon distinction, action-menu classification |
| Drag & Drop | Conditional adapter | anatomy vocabulary: handle, preview, landing cue |
| Divider / Separator / Rule | Token-level | semantic distinctions for structure versus decoration |
| Progress Ring / Spinner / Progress Bar | Missing contract | separates indeterminate wait from measurable completion |
| Toast / Snackbar | Complete | useful alias and boundary confirmation |
| Dialog / Drawer / Sheet | Partial | distinguishes scope, placement, and task depth |
| Popover / Dropdown / Tooltip | Partial or missing | directly addresses three commonly confused overlays |
| Scrim / Backdrop / Overlay | Token-level | terminology for the modal separation layer |
| Skeleton / Spinner | Partial | clarifies predictable layout versus indeterminate work |
| Combobox / Autocomplete / Typeahead | Missing | canonical form component and aliases |
| Command Palette | Complete | useful alias for Command Menu |
| Accordion / Disclosure | Partial | canonical disclosure vocabulary |
| Tabs | Partial | identifies one shared content-region pattern |
| Badge / Chip / Pill / Tag | Missing by design | lets KIN define strict distinctions and prevent badge spam |
| Breadcrumbs | Partial | canonical hierarchy-trail definition |
| Sticky / Fixed | Missing | useful layout behavior distinction |
| Focus Ring | Complete | terminology alignment |
| Empty State | Partial | useful pattern name, but KIN needs stronger recovery rules |
| Hover Card | Missing | distinguishes rich preview from Tooltip and Popover |
| Switch / Checkbox / Radio | Partial or missing | directly supports KIN's selection-control gap |
| Toggle Group / Segmented Control | Missing | canonical exclusive compact-selection pattern |
| Form Field | Partial | anatomy vocabulary for label, placeholder, helper, and error |
| Truncation / Ellipsis / Line Clamp | Missing | text-overflow terminology and variants |

## Useful macOS concepts for KIN

KIN should not become an AppKit clone, but several macOS entries map well to desktop-style web products:

- Context Menu;
- Disclosure Triangle;
- Inspector;
- Popover;
- Segmented Control;
- Sheet;
- Sidebar / Source List;
- Stepper;
- Toolbar;
- Split View;
- Scroll View;
- Search Field;
- Token Field;
- Combo Button;
- Level Indicator;
- Column View;
- Outline View;
- Alert;
- Slider;
- Pointer / Cursor;
- Color Well for engineering and creative tools.

Platform-specific names such as `NSPanel`, `NSPopover`, or `NSOutlineView` should be recorded only as reference aliases. They must not become KIN's normative web semantics.

## What it cannot supply

Name That UI does not replace KIN component contracts. Its examples generally do not establish all of the following:

- complete state matrices;
- keyboard interaction contracts;
- focus placement and restoration;
- assistive-technology announcements;
- touch behavior;
- responsive adaptation;
- localization and RTL behavior;
- reduced-motion fallbacks;
- loading, error, partial, stale, and offline states;
- performance and bundle impact;
- theme and high-contrast requirements;
- acceptance tests;
- ownership, versioning, migration, or deprecation;
- AI, evidence, approval, ecommerce, or engineering-specific workflow semantics.

It also does not cover several KIN gaps, including:

- full Data Table behavior;
- Pagination;
- Textarea and File Upload;
- Date, Time, Currency, and advanced numeric entry;
- Avatar and identity groups;
- standard chart anatomy and accessible data fallback;
- media gallery and generated-asset review;
- AI Composer, Citations, Streaming, Diff Review, and Execution Preview;
- background task queue and job history.

## Recommended KIN adaptation

### 1. Add a canonical terminology layer

Create:

- `components/terminology.md` for humans and Agents;
- `components/terminology.json` for search, audit tools, and prompt routing.

Each entry should include:

```yaml
canonical_name:
aliases:
not_synonyms:
plain_definition:
use_when:
do_not_use_when:
platform_notes:
kin_tier:
contract_path:
reference_path:
test_path:
status:
```

The important field is `not_synonyms`. It should explicitly record distinctions such as Tooltip != Popover and Checkbox != Switch.

### 2. Connect terminology to the component catalog

The planned `components/catalog.md/json` should link each canonical name to:

- maturity;
- normative contract;
- reference implementation;
- automated checks;
- supported product families;
- known gaps.

Name That UI can seed names and aliases; KIN must supply the production contract.

### 3. Prioritize high-value entries

First wave:

1. Tooltip / Popover / Dropdown / Context Menu;
2. Dialog / Drawer / Sheet / Scrim;
3. Switch / Checkbox / Radio / Toggle Group;
4. Combobox / Search Field / Form Field / Token Field;
5. Progress / Spinner / Skeleton;
6. Tabs / Accordion / Breadcrumbs;
7. Badge / Chip / Tag / Status;
8. Toolbar / Split View / Outline View;
9. Truncation;
10. Overflow Menu and Combo Button.

These entries overlap directly with the P0 and P1 work in the KIN completeness audit.

### 4. Preserve KIN's own voice

KIN should paraphrase and independently specify every adopted concept. It should not copy:

- site screenshots;
- rendered examples;
- descriptions;
- platform artwork;
- code;
- visual styling;
- proprietary platform assets.

If Name That UI is added to `REFERENCES.md`, its role should be “terminology and distinction discovery,” with an explicit boundary that it is not a normative or implementation source.

## Recommended outcome

Adopt the **taxonomy method**, not the site design.

The strongest addition would be a KIN component dictionary that answers:

1. What is this component called?
2. What is it commonly confused with?
3. When should it be used?
4. Which KIN contract governs it?
5. Is it stable, conditional, or missing?
6. Where is its runnable reference and test?

That would make KIN substantially easier for Codex, Claude Code, Cursor, designers, and engineers to use consistently.

## Evidence limits

- This assessment reviewed the homepage catalog and its 54 visible entries.
- One stable desktop screenshot was captured and inspected.
- Individual entry pages were not exhaustively audited.
- A visual dictionary cannot prove accessibility, production behavior, performance, or code quality.
