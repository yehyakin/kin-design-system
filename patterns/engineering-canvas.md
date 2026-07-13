# Engineering canvas pattern

Use this pattern for CAD, diagrams, spatial editors, node graphs, simulation, design tools, and other precision canvases.

## Product job

Help a user create, select, inspect, modify, compare, and safely reverse changes to structured spatial or technical objects.

## Core entities

- Document, layer, object, geometry, constraint, coordinate, unit, revision, viewport, selection, tool mode, simulation, and export.
- Units, coordinate space, precision, scale, revision, and selection count are part of the interface contract, not optional metadata.
- AI-generated geometry is a proposal until accepted into the document history.

## Structure

- Canvas remains the primary surface.
- Tool rail controls modes; object/layer rail controls structure; Inspector controls selected properties.
- Compact document commands belong to a named Toolbar with grouped actions, roving focus, and deterministic overflow priority.
- Resizable structural panels use the Split View contract, including an operable separator, bounded sizes, state preservation, and a small-screen replacement.
- Status bar exposes coordinates, zoom, units, snap/constraint state, save state, and revision.
- History or comparison appears when revision is the task; it does not permanently crowd the canvas.

Toolbar and Split View behavior MUST follow [`components/workspace-structure.md`](../components/workspace-structure.md).

### Default editing composition

For direct manipulation of a document or model, begin with:

```text
Document location and compact commands
Tool / object structure rail | dominant canvas | selection Inspector
Status bar: units, coordinates, zoom, constraints, save and revision
Command layer: menus, dialogs, review and long-task progress
```

- The canvas keeps the largest area and strongest task focus.
- The Inspector follows the current selection and disappears or changes mode when no selection exists.
- Narrow screens MUST choose a focused edit, inspect, or review mode rather than compressing every rail around a tiny canvas.
- Generated changes appear in preview/review context before they become document history.

## Visual register

- Chrome is compact and neutral so geometry and selection dominate.
- Selection, hover, locked, hidden, constrained, invalid, and simulated states remain distinguishable without relying on one color.
- Grids, guides, handles, and measurement labels adapt to zoom and contrast.
- A generated CSS or SVG grid MAY use linear gradients when the lines encode real spatial increments; document the exception so it is not confused with decorative gradient styling.
- Floating controls are anchored to their affected object or viewport region.

## Interaction

- Direct manipulation tracks the pointer 1:1 and can be interrupted.
- Drag release hands velocity only to interactions that carry momentum; precision geometry does not bounce.
- Escape cancels the current transient action before changing selection or leaving the document.
- Undo/redo, autosave, conflicts, and unsaved state are always trustworthy.
- Keyboard shortcuts do not fire while editing text or numeric fields unless scoped to that field.

## States

- No selection, single selection, multi-selection, editing, constrained, invalid, locked, hidden, loading reference, simulation running, export running, conflict, offline, unsaved, and saved.
- Long operations expose phase/progress and allow cancellation or background continuation when technically possible.

## Anti-patterns

- Applying workspace card layouts inside the canvas.
- Decorative grid or glowing nodes that do not represent actual geometry.
- Ambiguous unitless values or silently rounded dimensions.
- AI modifying the document without preview, diff, accept/reject, and undo.
- Animating precise geometry merely to make the interface feel alive.

## Visual-signature requirement

Apply the common and engineering-canvas requirements in [`principles/visual-signature.md`](../principles/visual-signature.md). A representative production workflow MUST be visually reviewed before a product claims visible KIN adoption.

## Acceptance

- The current mode, selection, unit, coordinate/measurement context, save state, and exit path are always discoverable.
- Pointer, keyboard, zoom, pan, resize, and high-contrast behavior remain usable at supported viewports.
- An accepted generated change is attributable and reversible.
- The representative workflow demonstrates selection, modification, state commitment, and recovery; a static canvas shell is insufficient.
