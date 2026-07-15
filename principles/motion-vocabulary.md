# Motion vocabulary

Status: normative terminology

KIN uses a small operational vocabulary so product teams and Agents can discuss behavior precisely. These terms name interaction contracts; they do not authorize animation by themselves.

| Term | KIN meaning |
|---|---|
| Purposeful motion | Motion that explains state, result, spatial ownership, direct manipulation or a potentially jarring change |
| Press feedback | Immediate visual response while a control is physically pressed; it is not proof that an operation succeeded |
| Origin-aware transition | A temporary surface enters from the trigger or owning edge that explains where it belongs |
| Spatial continuity | Enter, exit and reversal preserve the same source, path and object identity |
| Direction-aware transition | Forward and backward movement use directions that match navigation or spatial ownership |
| Continuity transition | Before and after remain perceptually connected instead of appearing as unrelated objects |
| Interruptible animation | New input can redirect motion from the current rendered state without waiting or restarting |
| Velocity handoff | Gesture release velocity continues into the settle behavior without a visible seam |
| Momentum projection | A release target is selected from the gesture's projected landing position rather than release position alone |
| Rubber-banding | Progressive resistance beyond a valid boundary followed by a controlled return |
| Asymmetric timing | Deliberate user input may take longer while system acknowledgement and reversal respond faster |
| Crossfade | One state changes opacity into another without spatial travel; commonly used as a reduced-motion alternative |
| Stagger | A short sequence between related items; decorative and never allowed to block interaction |

## Usage rules

- A specification MUST state the purpose, frequency, source and target state before naming a technique.
- `Spring`, `bounce`, `stagger`, `blur`, `morph`, `parallax`, `shimmer` and `typewriter` are techniques, not quality claims.
- Gesture vocabulary applies only when direct manipulation is implemented. A click-triggered Drawer MUST NOT be described as momentum-driven.
- `Spatial continuity` does not require animation when the high-frequency or reduced-motion path is instant.
- Product-facing copy SHOULD describe the user-visible result, not expose these implementation terms unless the user is editing motion itself.

## Boundaries

- KIN does not adopt decorative motion merely because it has a recognized name.
- External glossaries MAY help identify a term, but their wording, examples, source code and defaults are not KIN requirements.
- Component terminology remains governed by [`../components/terminology.md`](../components/terminology.md).
