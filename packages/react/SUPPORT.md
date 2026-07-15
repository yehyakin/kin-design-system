# Support policy

Status: pre-release

The package is maintained as an isolated KIN delivery surface. It is not yet a stable public package and MUST NOT be described as universal framework support.

## Ownership

- Product owner: KIN repository owner.
- Runtime implementation owner: KIN React package maintainers.
- Security and dependency review: KIN release reviewer.
- Consuming-product verification: the owner of each adopting product.

## Supported environment

- React 18.2 or React 19.
- Modern browsers covered by the repository Playwright matrix.
- Server rendering only where the exported adapter can render without a browser-owned API.
- Light, dark, higher-contrast, Reduced Motion, keyboard, pointer, and touch behavior according to the applicable KIN component contract.

## Pre-release limits

- APIs MAY change before `1.0.0` with a migration note.
- Production adoption MUST pin an exact KIN revision and package version.
- Leva is an optional peer and MUST remain behind a development-only import boundary.
- A package build does not prove that a consuming workflow is visibly KIN or verified.

## Promotion gate

The package MUST remain pre-release until two materially different consuming products provide implementation, accessibility, bundle, migration, rollback, and representative-workflow evidence under [`../../DELIVERY.md`](../../DELIVERY.md).
