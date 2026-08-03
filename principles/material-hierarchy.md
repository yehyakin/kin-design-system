# Material hierarchy

Status: normative

This contract defines how KIN surfaces gain depth without becoming a Card wall, a glowing dark dashboard, or a flat collection of black rectangles. It supplements [`DESIGN.md`](../DESIGN.md), [`visual-signature.md`](./visual-signature.md), and the component contracts that own a surface.

## Product purpose

Material helps a user answer three spatial questions:

1. Which content belongs to the same working plane?
2. Which boundary separates adjacent responsibilities?
3. Which temporary surface is currently above the task?

Material MUST explain those relationships. It MUST NOT be added merely to make a screenshot feel expensive.

## Resolved roles

Every adopting product MUST map these semantic roles through its existing theme layer:

| Role | Meaning |
|---|---|
| `--edge-highlight` | Faint reflected edge for a structural or raised surface |
| `--edge-highlight-strong` | Stronger reflected edge reserved for a true floating surface |
| `--edge-contact` | Dark contact edge between adjacent surfaces |
| `--shadow-contact` | Short shadow for selected, dragged, or locally raised content |
| `--shadow-raised` | Ambient separation for an independent frame against a Canvas |
| `--shadow-floating` | Tight contact plus ambient shadow for temporary floating UI |

The values are theme-resolved Tokens. Components MUST consume the semantic names rather than copy dark-theme values into local CSS.

## Layer model

### Continuous plane

Use for Workspace content, reading surfaces, tables, Activity, properties, tool rails, Sidebar, and Inspector sections.

- Establish hierarchy with Surface, typography, alignment, spacing, and occasional hairlines.
- Do not apply an external shadow to each region.
- Adjacent structural panes MAY use one directional inset edge where Surface contrast alone is insufficient.
- A pane MUST NOT receive a four-sided highlight that makes it appear as an independent Card.

### Contact layer

Use for one currently selected or locally raised object whose separation helps the task.

- Combine `--edge-highlight` with `--shadow-contact`.
- Use it sparingly: the current decision, drag preview, or selected navigation item MAY receive it; every row MUST NOT.
- Selection semantics and focus MUST remain visible without the shadow.

### Raised frame

Use when an application frame or bounded workspace is intentionally shown against a different outer Canvas.

- Combine the frame border, a top `--edge-highlight-strong`, and `--shadow-raised`.
- A full-viewport production App Shell SHOULD NOT cast an outer shadow because there is no external plane to separate from.
- Embedded previews and desktop-like bounded workspaces MAY use it when the boundary is real.

### Floating layer

Use for Dialog, Command Menu, Popover, Context Menu, Toast, mobile Drawer, drag overlay, or a floating Context Sidecar.

- Combine a solid `surface-3` or `surface-4`, a clear border, `--edge-highlight-strong`, and `--shadow-floating`.
- The shadow MUST remain neutral. Accent-colored bloom, blurred neon, and frosted glow are prohibited.
- A floating surface MUST retain a clear trigger, owning edge, focus model, and dismissal path.

## Directional edge recipes

Use only the edges that explain the relationship:

```css
.kin-shell {
  box-shadow:
    inset 0 1px 0 var(--edge-highlight-strong),
    var(--shadow-raised);
}

.kin-sidebar {
  box-shadow: inset -1px 0 0 var(--edge-contact);
}

.kin-inspector {
  box-shadow: inset 1px 0 0 var(--edge-highlight);
}

.kin-selected-record {
  box-shadow:
    inset 0 1px 0 var(--edge-highlight),
    var(--shadow-contact);
}

.kin-popover {
  box-shadow:
    inset 0 1px 0 var(--edge-highlight-strong),
    var(--shadow-floating);
}
```

These are relationship recipes, not universal utility classes. Products MUST adapt the direction to layout and reading direction.

## Theme behavior

### Dark

- A higher Surface is usually slightly lighter.
- Highlight edges use very low-opacity white.
- Contact edges and shadows use neutral black with enough alpha to remain visible on near-black surfaces.
- Dark material MUST NOT become a pure-black void with bright borders.

### Light

- Surface steps are smaller and edges carry more of the separation.
- Highlight edges may be brighter than their Surface, while contact shadows use cool neutral ink.
- Raised regions MUST NOT become white Cards scattered across a gray Canvas.

### Higher contrast and Forced Colors

- Subtle highlights and shadows MUST resolve to `transparent` or `none`.
- Structural boundaries, selection, focus, and errors MUST use explicit system-visible borders or outlines.
- Removing shadows MUST NOT collapse the information hierarchy or hide the active surface.

## Component allocation

| Component or region | Default material |
|---|---|
| Full-viewport App Shell | Continuous plane; no outer shadow |
| Embedded App Shell | Raised frame when the external Canvas is real |
| Sidebar / Workspace / Inspector | Continuous plane with at most one directional edge per boundary |
| Data Row / Activity Row | Flat; selected or current row MAY use contact layer |
| Button / Input | Border and Surface first; press MAY use a short contact change, not ambient elevation |
| Dialog / Command Menu / Popover / Toast | Floating layer |
| Drawer / floating Context Sidecar | Floating layer; edge direction matches entry |
| Inline Alert / Banner | Continuous or contact layer according to scope; never floating by default |
| Drag Overlay | Contact or floating layer according to travel and overlap |

## Motion relationship

- Elevation changes SHOULD occur with the state transition that caused them, not as a delayed flourish.
- `box-shadow` animation is allowed only for small, infrequent transitions and MUST remain within the relevant motion Token.
- Repeated rows and keyboard-priority paths SHOULD change Surface or border instantly rather than animate shadow.
- Reduced Motion removes nonessential elevation interpolation while preserving the final material role.

## Anti-patterns

- One shadow value copied across Shell, Card, Drawer, Toast, and Popover.
- External shadows on Sidebar, Inspector sections, every table row, or ordinary prose.
- Four-sided bright inset edges around every dark Surface.
- Color bloom, neon outline, gradient haze, or glass blur used as depth.
- Raising all records equally so current selection loses meaning.
- Using a heavy shadow to hide insufficient contrast between Canvas and Surface.
- Leaving Higher Contrast dependent on shadow.

## Adoption requirements

The implementation brief MUST name:

- the continuous planes;
- each directional structural edge;
- every surface allowed to use contact, raised, or floating elevation;
- theme mappings for all six semantic roles;
- Higher Contrast and Forced Colors replacements;
- the baseline and candidate views used to review depth.

An Agent MUST NOT describe material adoption as complete because the Token values exist. At least one representative production workflow must show the intended hierarchy in light and dark themes, at the target viewport and narrow-screen replacement.

## Acceptance

- The user can identify the working plane, adjacent context, selection, and active overlay without relying on color alone.
- Removing shadows leaves a coherent hierarchy based on content, Surface, boundaries, and focus.
- Dark and light themes express the same relationships with independently calibrated values.
- Higher Contrast and Forced Colors replace subtle material with explicit boundaries.
- A product can change its brand palette without rewriting the layer model.
- No component invents a local shadow scale when a semantic role already applies.
