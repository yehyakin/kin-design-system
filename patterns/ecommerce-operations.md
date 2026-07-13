# Ecommerce operations pattern

Use this pattern for product catalogs, inventory, orders, pricing, campaigns, channels, creative review, fulfillment, and approval workflows.

## Product job

Help an operator understand what changed, what is blocked, what has financial or customer impact, and what action is safe to take next.

## Core entities

- Product, variant, asset, inventory position, price, order, channel, campaign, task, approval, and automation run.
- Money always includes currency and formatting context.
- Inventory distinguishes available, reserved, incoming, committed, and unavailable quantities.
- Automation distinguishes suggestion, scheduled action, running action, completed action, failed action, approver, and rollback.

## Structure

- Catalog: saved views + dense product/variant list + Inspector.
- Order operations: queue + order context + fulfillment/payment timeline.
- Campaign workspace: campaign list + creative/offer detail + channel and approval Inspector.
- Product detail: identity + sellable state + pricing/inventory + channel status + activity.

Preview surfaces and operational records MUST remain distinct. A product image can be large in a creative review, but should not displace price, stock, channel, and approval state in an operations queue.

### Default operations composition

For repeated catalog, order, inventory, campaign, or approval work, begin with:

```text
Location and current operating scope
View controls: query, filters, sort, saved view, batch scope
Actionable queue or comparable records
Selected product/order/campaign context
Inspector: state, ownership, money/quantity/channel, approval, activity
```

- The actionable queue or selected record owns attention; KPI summaries remain compact and secondary.
- Batch actions stay attached to visible selection and state their exact scope.
- Product imagery remains subordinate in operational lists and expands only for identity or media-review decisions.
- Narrow screens preserve `identity -> blocking state -> affected money/quantity/channel -> safe action -> activity`.

## Visual register

- Use compact rows for comparison and exception handling.
- Reserve imagery for identity, quality review, or creative decisions; thumbnails are not decorative.
- Positive color means a favorable business state only when the domain defines it. A price decrease, inventory increase, or order cancellation is not automatically positive.
- Currency, quantity, time, and percentage columns use tabular numbers and stable alignment.

## States

- Draft, active, scheduled, paused, blocked, low stock, out of stock, oversold, rejected, partially fulfilled, refunded, and archived.
- Separate channel publication state from internal readiness.
- Separate payment state from fulfillment state.
- Separate AI confidence from approval and execution state.

## Interaction

- Batch actions state their scope and affected count before execution.
- Destructive or externally visible changes expose preview, permissions, and rollback where possible.
- Filters, sort, selection, and Inspector identity remain stable across navigation.
- A failed automation keeps prior product data visible and exposes retry or manual continuation.

## Anti-patterns

- KPI card wall replacing an actionable queue.
- Green/red treatment based only on numeric direction.
- Hiding currency, tax basis, inventory location, or channel scope.
- Combining creative generation, approval, publication, and performance into one ambiguous “AI status”.
- Making all product content draggable when order has no user-owned meaning.

## Visual-signature requirement

Apply the common and ecommerce requirements in [`principles/visual-signature.md`](../principles/visual-signature.md). A representative production workflow MUST be visually reviewed before a product claims visible KIN adoption.

## Acceptance

- An operator can identify the affected product, channel, quantity or money, current owner, and safe next action.
- Batch actions cannot silently expand beyond the visible selection/filter scope.
- Empty, partial, stale, permission-denied, and upstream-failure states preserve operational context.
- The representative workflow demonstrates a real operating decision and committed result; a dashboard overview or component gallery is insufficient.
