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

## Runtime implementation

[`@kin-design/react/experimental/input-otp`](../packages/react/src/input-otp.tsx) directly renders the official input-otp primitive and preserves its hidden-input, paste, autofill and focus behavior. KIN supplies the label, description, validation linkage, slot styling and explicit backend boundary.

The [Integration Lab](../examples/workspace-reference/integrations.html#input-otp) is deliberately a local input fixture: it verifies paste-oriented input and metadata but does not send, verify or persist a code. A real consuming product MUST connect delivery, expiry, resend, rate limiting and verification before claiming a complete Verification Challenge.

## Source

[input-otp](https://github.com/guilhermerodz/input-otp)
