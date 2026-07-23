# Generated Agent distribution

Status: generated, non-normative delivery surface

`next/` is a deterministic compact derivative of the current declared repository inputs. When every required locale attestation is current, its Manifest permits publication as raw Markdown and JSON under the mutable Pages `/next/` channel. It does not provide a stable compatibility promise.

Do not edit generated files. Change the normative contract or the declared non-normative inputs under `distribution/`, then run:

```powershell
npm.cmd run agent:export
npm.cmd run agent:check
```

`versions.json` is the publication authority once its declared Version Schema is publicly addressable. Before the first released bundle it follows the reviewed `next` publication gate; after the first release its Schema remains pinned to an immutable released bundle. A version archive is created once during a formal KIN release:

```powershell
npm.cmd run agent:release -- --version X.Y.Z
npm.cmd run agent:check:history -- --version X.Y.Z
```

Release export creates `versions/vX.Y.Z/` and a `staged` Registry entry without publishing the archive or advancing the stable alias. After the exact annotated Tag, remote Tag, successful Tag CI, final GitHub Release, and version-specific read-only eligibility workflow agree, `npm.cmd run agent:promote -- --version X.Y.Z` independently rechecks that evidence and changes only the Registry in a focused commit.

If a published alias must move backwards or be withdrawn, run `npm.cmd run agent:rollback -- --from X.Y.Z --to <A.B.C|none> --status <superseded|unsupported>` from a clean current `main` checkout. Rollback preserves archive bytes and immutable Schema pinning and also changes only the Registry. Use `npm.cmd run agent:support -- --version X.Y.Z --status <supported|superseded|unsupported> ...` for support metadata on a released version that is not the current stable target.

Pages publishes:

- `/next/` only when its Manifest explicitly permits development publication;
- `/versions/vX.Y.Z/` only for Registry entries marked `released`;
- root aliases only when `latest_agent_distribution` selects a supported released entry.

An untagged release candidate intentionally defers the complete Pages deployment. During that bounded interval, the committed `next` tree is reviewable in the repository while the public showcase and `/next/` remain at the preceding verified deployment. The final `release.published` event refreshes the showcase and `/next/`; promotion later exposes the immutable archive and stable aliases.

The current Registry has no stable Agent release, so root aliases remain absent. KIN 2.3.0 predates this layer and is not backfilled. Component Recipes remain unavailable until their separate RFC phase.
