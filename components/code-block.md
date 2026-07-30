# Code block

Status: normative

This contract defines readable and operable code presentation for product interfaces, documentation, generated output, diffs, and execution review. It supplements [`actions-and-selection.md`](./actions-and-selection.md) and the applicable AI, engineering, or information pattern.

## When to use

Use Code Block when preserving whitespace, syntax, language, or copyable source materially improves understanding.

Do not use Code Block for decorative terminal styling, fabricated system output, ordinary prose, or values that are clearer in a Property List or Data Table.

## Anatomy

A Code Block SHOULD expose:

1. code or structured text;
2. language when known;
3. filename or source identity when relevant;
4. copy action when copying is safe and useful;
5. horizontal scrolling or explicit wrapping;
6. optional line numbers when they support reference or review;
7. status, provenance, or execution boundary where applicable.

Syntax highlighting MAY improve scanning. Meaning MUST remain understandable without color.

## Content and safety

- Code MUST render as text and MUST NOT execute.
- Untrusted markup MUST be escaped.
- Secrets, credentials, personal data, and private identifiers MUST be removed before display or copy.
- Generated code MUST remain distinguishable from approved, saved, or executed code.
- Truncated content MUST state that it is incomplete and provide access to the complete permitted value.
- A language label MUST reflect the content and MUST NOT be inferred only from filename when ambiguous.
- Bidirectional text and invisible control characters SHOULD be identified when they can change interpretation.

## Scrolling and wrapping

- The default MUST preserve meaningful whitespace.
- Long lines MAY scroll horizontally inside a bounded Scroll Region.
- Wheel or trackpad input MUST not be trapped when no further movement is possible.
- A wrap control MAY be offered when reading prose-like output is more important than column alignment.
- Changing wrap MUST NOT alter copied content.
- At 200% zoom, users MUST still be able to reach all code and actions without document-level two-dimensional scrolling where practical.

## Copy feedback

- Copy MUST occur only after an explicit user action.
- Success feedback MUST appear only after the clipboard write succeeds.
- Failure MUST remain honest and expose a safe retry where useful.
- Copying a subset MUST state the selected scope.
- Hidden, redacted, or collapsed values MUST NOT silently enter the copied result.
- A Toast MAY confirm copy when the result is not already visible; it MUST NOT claim success before the platform confirms it.

## Line numbers and selection

- Line numbers MUST remain separate from copied source unless the user explicitly requests numbered output.
- Line numbers are reference aids, not list semantics.
- Text selection MUST remain available.
- Highlighted lines MUST expose their meaning without relying only on background color.
- If a product supports line comments or diagnostics, the relationship between line, message, severity, and action MUST be programmatic.

## Responsive, localization, and accessibility

- The Code Block MUST have an accessible name when surrounding context does not provide one.
- Language and filename MUST remain readable after localization.
- Keyboard users MUST reach copy, wrap, disclosure, and scroll controls.
- Screen readers MUST receive the code in source order without decorative token announcements.
- Narrow screens MAY reduce visible line-number width but MUST preserve the source.
- RTL product chrome MUST NOT reverse left-to-right source code; directional content inside strings MUST remain faithful to the source.
- Reduced Motion MUST remove animated line reveals, cursor simulation, and decorative streaming.

## AI and execution boundaries

- Streaming code MUST follow the partial-output requirements in [`ai-assistance.md`](./ai-assistance.md).
- A typing animation MUST NOT simulate generation after complete code already exists.
- Code that can be executed or applied MUST expose target, permissions, side effects, and approval separately from the Code Block.
- Copy, apply, run, and save are different actions and MUST remain distinct.

## Reference-fixture boundary

KIN's reference MAY provide deterministic local code, wrap state, and copy feedback. It MUST NOT claim that code was generated, validated, saved, compiled, or executed unless a real system confirms that state.

## Acceptance

- Whitespace, source order, language, and copy scope remain accurate.
- Long lines, wrapping, zoom, keyboard, touch, screen reader, light, dark, higher contrast, and Reduced Motion remain usable.
- Copy success and failure reflect the real clipboard result.
- Untrusted content is escaped and sensitive values are excluded.
- Generated, approved, saved, and executed code remain distinct.

## Migration

Adopting products MUST inventory syntax rendering, copy policy, redaction, long-line behavior, bidirectional content, generation status, and execution controls before replacing an existing code surface.
