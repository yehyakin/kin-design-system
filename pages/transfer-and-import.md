# Transfer and import page

Status: normative

Use this page family for importing, exporting, migrating, or reconciling structured data and files.

## User job

Understand source, destination, mapping, validation, scope, progress, partial failure, and result before data is committed or exported.

## Contract

- Import separates file or source selection, parsing, field mapping, validation, preview, execution, and result.
- Mapping MUST expose required fields, ignored fields, transformations, locale, timezone, currency, units, duplicates, and conflict policy where applicable.
- Validation MUST distinguish blocking errors, correctable warnings, ignored rows, and product defaults.
- Preview MUST show representative source and destination values without implying that execution already occurred.
- Execution uses the background-task contract when it can outlive the page.
- Partial completion MUST report successful, skipped, failed, and rolled-back records and provide a durable result artifact when the product supports it.
- Retry MUST operate on a defined failed scope and MUST not duplicate successful records.
- Export states scope, filters, columns, format, locale, redaction, permission, delivery, retention, and expiry.
- Sensitive exports MAY require recent authentication and server-side authorization.

## Candidate gap

KIN still requires a runnable mapping and partial-failure reference, large-file and background continuation behavior, responsive review, and automated retry-scope checks.
