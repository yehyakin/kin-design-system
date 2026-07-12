# Preference controls

Status: normative

This contract defines the compact controls used to change appearance and interface language. It applies to information sites, ecommerce tools, intelligence workspaces, AI operations, and engineering workspaces when those preferences are supported.

## Shared placement

- A product MUST place appearance and language controls in stable global chrome, account settings, or both.
- A control MUST NOT move between unrelated locations across product modules.
- Desktop workspaces SHOULD place compact controls at the trailing edge of the Location Bar or account area.
- Public sites MAY place them in the Header utility group.
- Mobile layouts MUST keep each target at least 44×44px even when the visible icon or switch is smaller.
- Products MUST NOT show a language control when only one complete locale is available.

## Icon language

KIN reference interfaces use Lucide for the `Languages`, `Sun`, `Moon`, and current-selection check icons. An adopting product MAY use an existing coherent line-icon system under the rules in [`../integrations/lucide.md`](../integrations/lucide.md).

- Icons MUST use `currentColor` and the product's semantic icon Tokens.
- Preference icons MUST NOT receive colored tiles, glow, gradients, or brand treatment.
- An icon-only trigger MUST have an accessible name. It SHOULD have a Tooltip when its meaning is not already familiar in the product context.
- Decorative sun, moon, and check icons MUST be hidden from assistive technology when the control already has a complete accessible name.

## Appearance control

### Preference model

The stored preference MUST support `light`, `dark`, and `system`. The resolved theme MAY be only `light` or `dark`.

```ts
type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";
```

- A compact binary switch MAY toggle the resolved light/dark appearance.
- When a user operates that switch, the product SHOULD store the selected explicit `light` or `dark` preference.
- `system` MUST remain available through Settings, the Command Menu, or an adjacent three-choice menu. A binary switch MUST NOT silently make `system` impossible to restore.
- The product MUST apply the stored or system preference before hydration and synchronize `color-scheme`.
- Theme changes MUST NOT remount the application, clear input, restart work, replay number animations, reset charts, or produce a Toast.
- System changes MUST update the resolved theme only while the stored preference is `system`.
- Preference changes SHOULD synchronize across open tabs.

### Switch structure

The KIN reference switch uses a sun icon, a small track and a moon icon. This structure is a reference pattern, not a requirement to copy exact dimensions.

```text
Sun | track and thumb | Moon
```

- The switch MUST expose `role="switch"` and `aria-checked` for its current resolved dark/light state.
- Its accessible name MUST describe the next action, such as `Switch to dark mode`, not only `Theme`.
- The active side MUST be distinguishable through more than accent color; thumb position and icon contrast SHOULD change together.
- The visible track MAY be approximately 24×14px, while the complete control keeps a 44px touch target.
- The thumb transition SHOULD use the fast motion Token and MUST be removed or shortened under reduced motion.
- The first render MUST NOT animate from a default theme into the resolved theme.

### Appearance states

| State | Required behavior | Visual treatment |
|---|---|---|
| Light resolved | Announce the action to switch to dark | Sun and left thumb position are clear |
| Dark resolved | Announce the action to switch to light | Moon and right thumb position are clear |
| System preference | Follow system changes | Settings or menu identifies `System`; compact switch shows the resolved state |
| Focus visible | Operate with Space or Enter | Focus ring is distinct from thumb and selected state |
| Disabled | Use only when appearance cannot safely change | Keep the reason available; do not show a fake interactive switch |

## Language control

### Trigger and menu

- The compact trigger SHOULD use the product's language icon and MUST expose `aria-haspopup="menu"` and `aria-expanded`.
- The menu MUST list languages using their own readable names, for example `中文` and `English`.
- The current locale MUST be identified with text semantics such as `aria-current` or a checked menu-item role and MAY also use a check icon.
- Opening the menu MUST move focus to a useful menu item. `Esc` and outside interaction MUST close it, and keyboard close MUST restore focus to the trigger.
- Arrow-key behavior SHOULD follow the product's menu primitive. Tab order MUST remain predictable.
- The menu MUST use a temporary surface, necessary hairline, and tight shadow; it MUST NOT become a flag grid or decorative country selector.

### Locale behavior

- Selecting a locale MUST update the document language and the complete interface translation together.
- The product MUST persist an explicit user choice and SHOULD synchronize it across tabs when the rest of the preference system does so.
- A locale change MUST preserve route, current object, unsaved input, task state, selection, and scroll position unless language-specific routing explicitly requires navigation.
- Products MUST NOT expose a locale whose core flow is only partly translated.
- Products MUST NOT publish unreviewed machine translation merely to increase locale count.
- Dates, numbers, currency, plural rules, direction, truncation, and search aliases MUST be reviewed for each supported locale.
- Language selection MUST NOT produce a success Toast.

### Language states

| State | Required behavior | Visual treatment |
|---|---|---|
| Closed | Trigger remains identifiable | Single monochrome icon with accessible name |
| Open | Announce expanded state and expose menu | Temporary surface anchored to trigger |
| Current locale | Identify current language programmatically | Text label plus check/current state |
| Focus visible | Support keyboard selection and close | Visible focus independent from current state |
| Loading locale resources | Preserve the current readable interface | Local progress only when loading is real; do not blank the application |
| Translation unavailable | Keep the current locale | Explain failure inline or in the menu; do not switch partially |

## Responsive behavior

- Desktop controls SHOULD remain compact and visually secondary to the current task.
- On mobile, the language menu MAY become a bottom sheet when a popover cannot fit or would conflict with the virtual keyboard.
- Theme and language controls MUST remain reachable without forcing horizontal page scrolling.
- Safe-area insets, 200% zoom, long language names, and right-to-left expansion MUST be tested when applicable.

## Acceptance checklist

- One coherent icon system is visible; Lucide is not mixed with a second UI icon set in the same surface.
- Light, dark, and system preferences are all reachable.
- The compact switch reflects the resolved theme and has a correct accessible name.
- Refresh, system change, and cross-tab change do not flash or reset work.
- The language trigger is icon-based, named, keyboard accessible, and opens an explicit text menu.
- Current locale, focus, open state, error, and loading remain distinct.
- Locale selection applies a complete reviewed translation and preserves task context.
- Desktop, mobile, reduced motion, higher contrast, and 200% zoom have been checked.
