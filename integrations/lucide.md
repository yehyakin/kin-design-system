# Lucide Adapter

## Decision

Lucide is the reference monochrome UI icon library for KIN examples and new products that do not already have a complete icon system.

An adopting product MAY keep another legally usable, internally consistent line-icon system. It MUST NOT mix Lucide with a second UI icon library in the same product surface.

## Contract

- Import only the icons used by the shipped interface. Do not bundle the complete icon registry.
- Use `currentColor` so icons inherit semantic text and control colors.
- Use a default optical size of 16px and stroke near 1.5px; validate compact 14px and touch-oriented 18–20px uses separately.
- Keep navigation icons quieter than active text. Business status icons use semantic color only when the color communicates a real state.
- Icon-only controls require an accessible name. Add a Tooltip when the meaning is not universal.
- Decorative icons are hidden from assistive technology.
- Preserve the icon's view box and aspect ratio. Do not distort, fill, add a background tile, or apply glow.
- Do not replace clear labels with icons merely to save horizontal space.

## Build guidance

Vanilla JavaScript projects SHOULD import selected icon definitions and call Lucide's `createIcons` with an explicit icon map. Framework projects SHOULD use their framework-specific Lucide package and named imports so normal tree-shaking can remove unused icons.

## Source

[Lucide for Vanilla JavaScript](https://lucide.dev/guide/lucide)
