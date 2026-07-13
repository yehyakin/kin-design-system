# Help and support page

Status: normative

Use this page family when a product provides self-service guidance, support requests, ticket history, contact channels, escalation, or links to service status. A product without those capabilities MUST NOT add a decorative support center merely to complete a template navigation.

## User job

Find a reliable answer, understand whether the product is operating normally, contact the correct support channel, create a request with enough context, and return later to track its state.

## Page boundaries

- Contextual help explains the current task and SHOULD remain close to that task.
- A Help Center owns searchable guidance, categories, article reading, and no-result recovery.
- A Support Request owns issue type, affected object, description, attachments when allowed, privacy notice, expected response path, and submission result.
- Ticket History owns request identity, status, priority when meaningful, assignee or team when disclosed, last update, conversation, resolution, and reopening or follow-up policy.
- Service Status belongs to an authoritative status source. It MUST remain distinguishable from support tickets, product notifications, and marketing claims.
- A chat surface MAY exist only when a real automated or human service is available. It MUST identify the channel, availability, automation boundary, handoff behavior, retention, and failure path.

## Entry, return, and context

- Entry from an error, object, task, or settings page SHOULD carry a safe reference to the affected context without exposing secrets.
- Returning from an article, ticket, provider, or status page SHOULD restore the previous product location when that is useful.
- Search query, category, selected article, ticket filter, and opened ticket SHOULD be represented in URL or durable state when sharing or return matters.
- Opening support MUST NOT discard an unsaved draft or hide a recoverable system error.

## Guidance and search

- Search results identify article title, relevant excerpt, product area, last reviewed date when meaningful, and locale availability.
- No results preserve the query and offer category browsing, alternative terms, or a real contact path.
- An Accordion MAY disclose concise answers but MUST NOT replace linkable articles when the guidance is long, versioned, or shareable.
- AI-generated answers MUST follow [`components/ai-assistance.md`](../components/ai-assistance.md): cite product-owned evidence, label uncertainty, and provide escalation. Generic generated text MUST NOT be presented as official support policy.

## Requests and tickets

- Submission MUST distinguish draft, uploading, validating, submitting, accepted, duplicate, rate limited, offline, and failed states.
- A successful request returns a durable reference ID and the next expected step. A visual animation or local state change does not establish ticket creation.
- Attachments use the File Upload and background-work contracts and state file limits, privacy, retention, malware scanning where applicable, cancellation, and cleanup.
- Ticket status MUST come from the real support system. Read state and dismissal MUST NOT alter ticket status.
- Closing, reopening, escalating, or deleting a request MUST state consequences and retained history.

## Contact and service status

- Contact channels MUST state real availability, locale, region, cost, authentication requirement, and expected response policy where those facts are known.
- `Online`, response-time, queue-length, and availability claims MUST be sourced and updated; otherwise use neutral language without fabricated precision.
- Service incidents identify affected capability, current state, start or update time, source, and a link to continuing updates.
- Product errors MUST NOT be hidden behind a green global status. Partial outages and stale status data remain distinguishable.

## Security and privacy

- Support forms MUST tell users not to submit passwords, one-time codes, API secrets, payment credentials, or other prohibited data.
- Sensitive account, billing, permission, or security requests MAY require recent authentication and server-side authorization.
- Identity verification, transcript retention, export, deletion, and staff access remain product-owned security and legal decisions.
- Public support links and reference IDs MUST NOT expose internal identifiers or private ticket content.

## Required states

Guidance loading, article available, no results, stale article, unavailable locale, contact unavailable, request draft, attachment failure, submitting, accepted, duplicate, rate limited, offline, ticket open, waiting on user, waiting on support, resolved, closed, reopened, permission denied, and service-status unavailable.

## Responsive and accessible behavior

- Narrow screens keep search, category, request status, ticket identity, and primary recovery actions reachable without horizontal page scrolling.
- Search, Disclosure, Tabs, forms, upload, Dialog, and notification behavior follow their canonical component contracts.
- Status and priority MUST not rely on color alone.
- Dynamic request and ticket results use appropriate live announcements without repeatedly reading the full history.
- Locale, timezone, contact availability, and translated-article gaps remain explicit.

## Anti-patterns

- Fake live chat, typing indicators, support agents, tickets, service status, response times, or success states.
- A chatbot as the only path to human or accountable support when the product promises another channel.
- FAQ Cards and colorful category icons used as decoration instead of an information structure.
- Support content mixed with promotions, upgrades, or invented security claims.
- Removing a notification or closing a Dialog and presenting that as resolution of the underlying request.

## Verification boundary

The deterministic KIN reference covers bilingual help search and no results, support-request validation and a clearly local result, ticket history, service-status source boundaries, keyboard and touch access, focus, URL restoration, themes, and responsive behavior. It intentionally provides no real chat, request transport, support queue, status service, identity verification, or retention behavior. Production adoption MUST supply dated evidence from the actual support, status, identity, privacy, and retention systems before describing those capabilities as verified.
