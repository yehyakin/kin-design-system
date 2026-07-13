# Settings and administration page

Status: normative

Use this page family for personal preferences, account security, workspace configuration, integrations, notifications, data controls, and administrative policy.

## User job

Understand the scope of a setting, change it safely, know whether it saved, and recover or reverse it without confusing personal, workspace, organization, and system-level ownership.

## Scope model

Every settings location MUST name its scope:

- Personal: profile, appearance, language, notifications, devices, and personal defaults.
- Workspace: name, defaults, integrations, members, shared views, and product behavior.
- Organization: roles, security policy, billing ownership, domains, retention, and compliance controls.
- System: deployment or self-hosted administration available only to authorized operators.

Settings with different scopes MUST NOT be mixed in one unlabeled form.

## Structure

- Use stable section navigation with shareable URLs or fragments for meaningful categories.
- The current category, scope, title, explanatory boundary, and save model remain visible.
- Prefer flat sections separated by whitespace and hairlines. Do not turn each field into a Card.
- Destructive or ownership-changing actions belong in a clearly separated final section and must name consequences.
- Search MAY help large settings collections, but it MUST return real settings destinations rather than duplicating controls in ambiguous result cards.

## Save models

Choose one model per setting and state it consistently:

- Immediate: commit one reversible preference after selection; show adjacent confirmation and provide undo when appropriate.
- Explicit: enable Save only after a valid change; keep Cancel or Reset; prevent accidental navigation with unsaved work.
- Staged: collect multiple changes, show a review or scope summary, then commit once.

The same setting MUST NOT sometimes autosave and sometimes require Save without a clear reason.

## Required states

- Unchanged, editing, invalid, saving, saved, save failed, conflict, stale server value, inherited, enforced by policy, permission denied, unavailable integration, partially applied, and requires re-authentication.
- A saved label MUST reflect server confirmation, not blur or a timer.
- Conflicts MUST preserve both the user's input and the current server value with a clear resolution path.
- Policy-enforced values remain readable and identify the policy owner or source where allowed.
- A failed setting MUST remain editable unless retry would be unsafe.

## Security and destructive changes

- Password, email, factor, API credential, session, ownership, role, export, deletion, and billing changes MAY require recent authentication according to product policy.
- Client-side visibility MUST NOT substitute for server authorization.
- Session lists identify device or client, approximate location only when justified, last activity, current session, and revoke result.
- Destructive actions state object, scope, retention, downstream effect, reversibility, and required confirmation.
- Products with audit requirements SHOULD link to the corresponding audit event after a committed administrative change.

## Responsive behavior

- Desktop MAY use category navigation plus a readable settings column.
- Narrow screens use a category list route or compact selector; they MUST NOT squeeze two persistent sidebars around a form.
- Sticky action bars MUST not cover fields, errors, virtual keyboards, or legal text.
- Touch targets remain at least 44px while dense label/value rows may remain visually compact.

## Accessibility and localization

- Sections use headings and grouped form semantics.
- Save status is announced without repeatedly interrupting input.
- Focus moves to the first invalid field after submission and to conflict or re-authentication context when those block saving.
- Long policy names, locale names, email addresses, workspace names, and translated descriptions wrap without hiding controls.
- Appearance, language, Reduced Motion, contrast, units, currency, number, date, and timezone settings preview their actual effect where useful.

## Anti-patterns

- One giant Account page with unrelated personal and organization controls.
- Card wall for ordinary form sections.
- Autosave with no confirmation or error recovery.
- “Saved” Toast as the only status.
- Disabled control with no policy or permission explanation.
- Destructive action hidden in an Overflow Menu with no consequence summary.
- Reusing a theme toggle as the complete appearance settings page.

## Acceptance

- The user can identify setting scope, current value, inherited or enforced state, save model, permission, and result.
- Navigation preserves unsaved work or explicitly asks before discarding it.
- Server conflicts, offline state, failed integrations, and re-authentication retain the user's intended change.
- Light, dark, system, higher contrast, localization, mobile, keyboard, zoom, and Reduced Motion remain usable.
- Production adoption records server authorization, persistence, session operations, destructive-action policy, audit behavior, and rollback.
