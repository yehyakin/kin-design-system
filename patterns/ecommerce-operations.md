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

### Context Thread mapping

The ecommerce-operations silhouette is an operating scope and exception queue joined to a selected commercial record and an explicit approval or execution boundary. It MUST not inherit the intelligence-workspace silhouette unchanged.

- `Source`: product, order, campaign, channel, inventory location, currency, owner, and upstream record.
- `Compare`: current and proposed price, stock, channel state, creative, schedule, or fulfillment outcome.
- `Decide`: approve, reject, edit, pause, retry, or choose the exact batch scope.
- `Commit`: the externally visible or financially meaningful result, including affected count, channel, actor, and time.
- `Recover`: undo, rollback, restore prior values, resume a failed task, or hand off to a safe manual path.

Money, quantity, channel, permission, approval, execution, and rollback MUST stay legible across the Context Thread. Do not visualize the relationship as a generic funnel or a row of equal status cards.

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

Apply [`principles/context-thread.md`](../principles/context-thread.md) and the common and ecommerce requirements in [`principles/visual-signature.md`](../principles/visual-signature.md). A representative production workflow MUST show how commercial source, comparison, human decision, committed scope, and recovery remain connected before a product claims visible KIN adoption.

## Acceptance

- An operator can identify the affected product, channel, quantity or money, current owner, and safe next action.
- Batch actions cannot silently expand beyond the visible selection/filter scope.
- Empty, partial, stale, permission-denied, and upstream-failure states preserve operational context.
- The representative workflow demonstrates a real operating decision and committed result; a dashboard overview or component gallery is insufficient.
