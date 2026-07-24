---
kind: "kin-agent-design"
schema_version: "2.0.0"
schema_locator: "schemas/snapshot.schema.json"
generated: true
normative: false
artifact_status: "generated-derivative"
editable: false
publication:
  state: "published-development"
  published: true
  public_locators: "active"
kin_version: "3.0.0"
release_status: "development"
latest_stable_contract: "2.3.0"
channel: "next"
locale: "en"
direction: "ltr"
theme: "light"
contrast: "more"
coverage: "compact-foundations-and-routing"
features:
  component_recipes: "unavailable"
locale_review:
  status: "reviewed"
  reviewers:
    - "@yehyakin"
  normative_source_checksum: "28d428a4429c45b5bcc6dc4cfddfd97682ef2f6a2b0297852954be1c247c4fe2"
  localized_content_checksum: "8cbc0ee2535f738266c73e9f80419076c0da5afad2212a6049408902706f412a"
source:
  contract_path: "DESIGN.md"
  checksum_algorithm: "sha256"
  checksum: "c1fbae50d28cfdb37285a8ec4ba9e89f1c121a86e8589d750c0a88a581c6bda3"
  input_set_checksum: "a3908427eaba69bc5656710dd250420bef89d9c96e0212f30de7683a2eedabca"
  ref: "main"
  revision_status: "mutable"
manifest_locator: "design-manifest.json"
full_contract_path: "DESIGN.md"
visual_signature_path: "principles/visual-signature.md"
delivery_contract_path: "DELIVERY.md"
product_profiles:
  - "information-site"
  - "intelligence-workspace"
  - "ecommerce-operations"
  - "engineering-canvas"
rules:
  -
    id: "snapshot-source-boundary"
    level: "must"
    source_path: "DELIVERY.md"
    source_heading: "Current decision"
  -
    id: "task-before-explanation"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "1. The task appears before the explanation"
  -
    id: "one-dominant-region"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "2. One region owns attention"
  -
    id: "neutral-precise-emphasis"
    level: "should"
    source_path: "principles/visual-signature.md"
    source_heading: "5. Neutral structure, precise emphasis"
  -
    id: "typography-supports-hierarchy"
    level: "must"
    source_path: "DESIGN.md"
    source_heading: "4.3 排版规则"
  -
    id: "density-removes-repetition"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "4. Density removes repetition"
  -
    id: "continuous-structure"
    level: "should"
    source_path: "principles/visual-signature.md"
    source_heading: "3. Structure is continuous"
  -
    id: "motion-explains-change"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "7. Motion explains change"
  -
    id: "semantics-remain-separate"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "6. Semantics remain separate"
  -
    id: "route-by-product-profile"
    level: "must"
    source_path: "DELIVERY.md"
    source_heading: "What may be consumed directly"
  -
    id: "delivery-is-not-adoption"
    level: "must-not"
    source_path: "principles/visual-signature.md"
    source_heading: "Adoption claims"
colors:
  canvas: "#ffffff"
  sidebar: "#f0f1f3"
  surface-1: "#ffffff"
  surface-2: "#f4f5f6"
  surface-3: "#eceef0"
  surface-4: "#e4e6e9"
  surface-hover: "#14161a0b"
  surface-selected: "#525ec41a"
  surface-overlay: "#f6f7f8c2"
  text-primary: "#08090a"
  text-secondary: "#343840"
  text-muted: "#6b7079"
  text-disabled: "#a1a5ad"
  text-inverse: "#f7f8fa"
  icon-primary: "#3f4248"
  icon-muted: "#7d828b"
  line-subtle: "#14161a0f"
  line-default: "#6a707a"
  line-strong: "#14161a2b"
  accent: "#5360c5"
  accent-hover: "#4653b7"
  accent-active: "#3e4aa6"
  accent-soft: "#5360c51a"
  focus-ring: "#3946b8"
  monitor: "#167f8d"
  monitor-soft: "#167f8d17"
  positive: "#247b56"
  warning: "#8e650f"
  negative: "#a94838"
  critical: "#b23749"
  offline: "#6f747d"
typography:
  body:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "14px"
    font_weight: 400
    line_height: 22
    letter_spacing: "0em"
  display:
    font_family: "Inter, Geist, \"SF Pro Display\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "32px"
    font_weight: 600
    line_height: 38
    letter_spacing: "-0.02em"
  entity-title:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "18px"
    font_weight: 600
    line_height: 24
    letter_spacing: "-0.01em"
  metadata:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "12px"
    font_weight: 400
    line_height: 17
    letter_spacing: "0em"
  micro:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "11px"
    font_weight: 500
    line_height: 15
    letter_spacing: "0em"
  mono:
    font_family: "\"Geist Mono\", \"JetBrains Mono\", \"SFMono-Regular\", Consolas, monospace"
    font_size: "12px"
    font_weight: 450
    line_height: 18
    letter_spacing: "0em"
  page-title:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "20px"
    font_weight: 600
    line_height: 26
    letter_spacing: "-0.01em"
  section-title:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "14px"
    font_weight: 600
    line_height: 20
    letter_spacing: "0em"
  ui:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "13px"
    font_weight: 500
    line_height: 18
    letter_spacing: "0em"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
rounded:
  lg: "10px"
  md: "7px"
  round: "999px"
  sm: "5px"
  xl: "14px"
  xs: "3px"
motion:
  duration-drawer: "300ms"
  duration-fast: "140ms"
  duration-instant: "0ms"
  duration-normal: "180ms"
  duration-number: "400ms"
  duration-panel: "240ms"
  duration-press: "90ms"
  ease-enter: "cubic-bezier(0.16, 1, 0.3, 1)"
  ease-exit: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-standard: "cubic-bezier(0.2, 0, 0, 1)"
component_recipes: null
---

# KIN Agent design snapshot

> Generated derivative. Read the complete contract when changing normative behavior or delivery boundaries.

## Status and source

- This compact file is generated from the current KIN contract. It is non-normative, must not be edited, and does not replace the linked source documents.
- Contract checksum: `c1fbae50d28cfdb37285a8ec4ba9e89f1c121a86e8589d750c0a88a581c6bda3`
- Resolved mode: `light` / `more`
- Locale copy review: `reviewed`
- Publication state: `published-development`

## Visual register

- Put the subject, current task, search, list, document, object, or action in the first meaningful view.
- Give each state one dominant work or reading region; navigation, metadata, and secondary chrome recede after orientation.

## Theme usage

- Keep most structure neutral and use one primary interaction accent for focus, selection, links, and primary actions.
- Set color-scheme to the resolved theme and preserve light, dark, system, and higher-contrast behavior in the product.

## Typography roles

- Use typography roles to express hierarchy; keep interface text compact and body text readable, and use tabular numerals where comparison matters.

| Role | Resolved value |
|---|---|
| `body` | 14px / 400 / 22 |
| `display` | 32px / 600 / 38 |
| `entity-title` | 18px / 600 / 24 |
| `metadata` | 12px / 400 / 17 |
| `micro` | 11px / 500 / 15 |
| `mono` | 12px / 450 / 18 |
| `page-title` | 20px / 600 / 26 |
| `section-title` | 14px / 600 / 20 |
| `ui` | 13px / 500 / 18 |

## Layout and density

- Align repeated values and actions, carry shared meaning in columns or group controls, and use empty space to clarify priority.

## Surface and elevation

- Create hierarchy with alignment, rhythm, columns, property rows, dividers, and small surface steps before adding containers.

## Motion

- Use motion to preserve origin, direction, state continuity, and committed results; reversible interactions begin from their current visual state.

## Content rules

- Keep status, risk, confidence, completeness, availability, permission, and progress separate whenever the product distinguishes them.

## Do

- Use it to select a mode, product profile, and first-read constraints before opening the detailed contract.
- Let real content and the user's job establish the composition.
- Use visual weight to make the next useful action obvious.
- Keep semantic colors tied to distinct product meanings.
- Map the named roles to the product's available font stack without redistributing private fonts.
- Keep comparison rows compact while preserving required hit areas.
- Use a Surface only for a real object, overlay, selected context, or task-mode boundary.
- Keep motion interruptible and preserve the same final hierarchy under Reduced Motion.
- Make meaning readable with language or symbols as well as color, and show source and time for consequential data.
- Use route-level profiles for hybrid products and preserve the user's stated request and product truth.
- Record scoped mappings, realistic states, comparable screenshots, human review, exceptions, owners, and rollback before making an adoption claim.

## Do not

- Do not treat generated guidance, a passing check, or a themed component lab as proof of product adoption.
- Do not place a marketing Hero, generic value proposition, or decorative graph before the working task.
- Do not give unrelated panels equal weight merely because a grid is available.
- Do not use color, badges, icons, or motion to compensate for weak order or alignment.
- Do not enlarge headings or tighten Chinese tracking merely to imitate another product.
- Do not repeat labels and helper text in every row or use large empty regions as unresolved composition.
- Do not turn prose, metadata, activity, property groups, filters, or table regions into nested cards by default.
- Do not use repeated lifts, automatic counting, generic page fades, or decorative entrances to manufacture polish.
- Do not collapse independent judgments into one attractive score, badge, or unsupported claim.
- Do not apply one workspace layout to every route or let task-intent hints override local requirements.
- Do not infer production adoption from this snapshot, a passing generator, or isolated styled components.

## Task and product-profile routing

- Choose the product profile from the real route and task, then open the matching detailed pattern before changing composition.

| Profile | Task intents | Detailed contract |
|---|---|---|
| `information-site` | `find`, `read`, `verify`, `cite` | `patterns/information-site.md` |
| `intelligence-workspace` | `inspect`, `monitor`, `investigate`, `verify`, `decide` | `patterns/intelligence-workspace.md` |
| `ecommerce-operations` | `operate`, `compare`, `approve`, `recover` | `patterns/ecommerce-operations.md` |
| `engineering-canvas` | `create`, `select`, `inspect`, `modify`, `compare`, `undo` | `patterns/engineering-canvas.md` |

## Verification and adoption boundary

- Generated snapshots, Token parity, builds, and component references are delivery evidence, not proof that a product is visibly or fully KIN.
