# input-otp Adapter

## Decision

Conditional. Adopt only when a real backend issues and verifies one-time codes.

## Allowed

- Administrator login or step-up authentication.
- High-impact risk changes, deletion, sensitive export and API-key operations.

## Forbidden

- Decorative security flows.
- Fake countdowns or fake delivery states.
- Client logging or persistence of the code.
- Six oversized glowing boxes.

## Contract

- Support paste, platform autofill and correct `autocomplete`.
- Provide a visible label, delivery destination context and inline errors.
- Resend timing and rate limits reflect backend truth.
- Slots use KIN surface, 5–7px radius and visible accent focus.
- Mobile keyboard behavior and touch targets are tested.
- Treat the component as input UI, not the authentication mechanism.

## Source

[input-otp](https://github.com/guilhermerodz/input-otp)
