# Intelligence workspace pattern

Use this pattern for monitoring, risk review, evidence systems, investigations, observability, public-source intelligence, and continuously updated entity databases.

## Product job

Help an analyst identify an entity, understand its current state, inspect what changed, verify evidence, and make a reversible decision.

## Core entities

- Entity, signal, event, evidence, source, monitor run, relationship, finding, review, and decision.
- Risk, evidence confidence, data completeness, online health, and AI confidence MUST remain separate concepts and components.
- Every event records occurrence time, observation time, source, and verification state when those values differ.

## Structure

- Database: saved views + entity list + Inspector.
- Investigation: entity identity + chronology/evidence + properties and relationships.
- Risk queue: severity + signal + evidence state + owner/review state.
- Monitor center: task state + current measurement + history + failure/retry context.

## Visual register

- Dense, calm, and source-forward.
- Current identity and state remain visible while list, evidence, or history changes.
- Activity is a flat chronological record, not a decorative timeline.
- Charts support a decision and never replace exact values or source context.

## States

- Unknown, observed, pending verification, partially verified, confirmed, conflicting, stale, source unavailable, resolved, and archived.
- A source failure does not erase previously verified evidence.
- A risk escalation is recorded as an event with actor/rule and reason.

## Interaction

- Selection, filters, sorting, time range, and Inspector state SHOULD be deep-linkable when sharing matters.
- New live events do not force-scroll a reader away from the current position.
- AI summaries cite events/evidence, label inference, expose uncertainty, and never silently change a human-reviewed state.

## Anti-patterns

- NOC-style wall of glowing charts for ordinary analysis.
- A single “trust score” combining risk, evidence, uptime, and completeness.
- Red/green-only severity without language.
- Simulated live activity, fake source counts, or invented monitoring coverage.

## Acceptance

- An analyst can answer: what object, what state, what changed, when, according to which source, how certain, and what action follows.
- Conflicting evidence remains visible and attributable.
- Keyboard navigation, preserved scroll, and direct URLs support repeated review work.
