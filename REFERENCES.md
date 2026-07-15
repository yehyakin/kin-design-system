# Reference Governance

KIN is an independent design system. External sources provide evidence, techniques and counterexamples; they do not become KIN rules automatically.

## Source hierarchy

When sources conflict, use this order:

1. Real product tasks, users, data and constraints.
2. `DESIGN.md` and approved KIN decisions.
3. Accessibility, platform and security requirements.
4. Official documentation for the technology being implemented.
5. Public product-design discussions from the referenced product.
6. Community skills and third-party visual analyses.
7. Third-party component defaults.

Third-party component defaults always have the lowest visual priority.

## Design-method references

| Reference | KIN use | Do not import |
|---|---|---|
| [Linear UI redesign 2024](https://linear.app/now/how-we-redesigned-the-linear-ui) | density, alignment, structured views, LCH theme generation, feature-flag rollout | brand assets, proprietary UI, business model |
| [Linear UI refresh 2026](https://linear.app/now/behind-the-latest-design-refresh) | dimmer navigation, fewer icons, softer separators, consistent action placement | page-by-page imitation |
| [Linear Triage Intelligence](https://linear.app/now/how-we-built-triage-intelligence) | distinguish AI suggestions from human data; show sources and progress | fake reasoning traces or simulated AI |
| [Linear brand guidelines](https://linear.app/brand) | restraint and monochrome brand handling | Linear logo, wordmark, icon or implied affiliation |
| [Apple Design Skill](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) | direct feedback, continuity, interruption, reduced motion | Apple branding or platform mimicry |
| [Design Engineering Skill](https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng) | frequency-aware motion decisions, origin, interruption and inspectable component craft | universal styling, blanket press scale, copied prose or disputed framework-performance claims |
| [Improve Animations Skill](https://github.com/emilkowalski/skills/tree/main/skills/improve-animations) | reconnaissance, evidence-led motion audit and self-contained implementation plans | replacing KIN governance, modifying source during audit or treating external values as unquestionable |
| [Review Animations Skill](https://github.com/emilkowalski/skills/tree/main/skills/review-animations) | independent motion-quality gate and exact before/after findings | reviewing non-motion behavior or overriding documented KIN exceptions |
| [Animation Vocabulary](https://github.com/emilkowalski/skills/tree/main/skills/animation-vocabulary) | identify precise motion terms for communication | copied glossary text, decorative technique lists or automatic permission to animate |
| [Kill AI Slop](https://github.com/yetone/kill-ai-slop/blob/main/skill/SKILL.md) | audit workflow and machine-default visual taxonomy | automatic mass editing or scanner-as-truth |
| [Kill AI Slop website](https://killaislop.com/) | human-readable companion reference | duplicate normative rules |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | density, hierarchy and visual-review prompts | arbitrary style parameters overriding KIN |
| [Soul Design Linear DESIGN.md](https://github.com/soulcore-dev/soul-design-md/blob/main/designs/linear/DESIGN.md) | agent-readable documentation structure and implementation detail | unverified claims framed as official Linear tokens |
| [Google DESIGN.md](https://github.com/google-labs-code/design.md) | machine-readable frontmatter, token references, linting and interoperable export | treating an alpha format as KIN's complete product contract |
| [Anthropic frontend-design Skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | subject-grounded direction, two-pass planning and screenshot critique | marketing-page assumptions applied to dense workspaces |
| [Impeccable](https://github.com/pbakaus/impeccable) | context routing, progressive disclosure, scored audits and evidence formats | command structure or visual rules copied without KIN adaptation |
| [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) | concise code-level accessibility and interface audit checks | scanner output treated as product judgment |
| [Google Stitch Skills](https://github.com/google-labs-code/stitch-skills) | framework discovery and extraction of design intent from existing code | generated prose accepted without checking the source implementation |
| [AMicro](https://github.com/Subhan-code/Amicro--Micro-transitions-) | discover common paired-state and result-confirmation examples for review | generated button styling, hover-as-success semantics, package dependency, or gallery aesthetics |
| [Name That UI](https://namethatui.com/) | discover canonical interface terms, aliases, and useful non-synonym distinctions | copied descriptions or screenshots, platform styling, production behavior, or normative accessibility claims |
| [Boneyard](https://github.com/0xGF/boneyard) | content-shaped loading geometry, breakpoint coverage, and a reference-site structure that keeps examples inspectable | generated skeleton styling, framework packages, copied source, or treating placeholder motion as product content |
| [Reicon](https://github.com/dqev/reicon) | icon-catalog breadth, consistent optical geometry, outline/filled family review, and discoverable delivery formats | replacing KIN's Lucide reference without product review, mixing icon families, or copying icon assets |
| [Hiraki](https://github.com/ddoemonn/hiraki) | Drawer behavior review across focus, dismissal, spatial continuity, tests, and documentation boundaries | package adoption, copied implementation, or making drag gestures the only dismissal path |
| [Interfaces](https://interfaces.dev/) | interactive component demonstrations that expose behavior in context rather than relying on prose alone | copied source, screenshots, default aesthetics, or claiming a demonstration is a production component package |
| [Rico Bookmark Manager](https://github.com/ricocc/rico-bookmark-manager) | separation of source data, generated site, reusable instructions, and adoption entry points | bookmark-specific architecture, visual styling, or treating Agent installation as KIN's product direction |
| [Serena](https://serena.miladmo.me/) | scheduling-workspace observation: coordinated Sidebar collapse, task-scoped adjacent context, anchored item detail, and container-aware schedule density | hosted fonts or assets, copied source or styling, simulated AI, desktop-only rejection, or treating a deployed prototype as verified production behavior |

## Reference translation matrix

External projects MUST influence KIN through an explicit translation, not visual resemblance. A proposal that cites one of these sources MUST identify the KIN-owned contract, runnable evidence, and verification it changes.

| External evidence | KIN-owned translation | Required evidence | Explicit exclusion |
|---|---|---|---|
| Motion galleries and interactive examples | stable icon slots, paired states, committed-result feedback, and inspectable Motion Lab scenarios | normal-motion and reduced-motion tests plus keyboard operation | generated styling, hover-as-success, decorative motion |
| Drawer libraries and overlay demos | edge ownership, interruptible open/close, focus containment, scroll ownership, and narrow-screen Sheet adaptation | rapid reversal, Escape, focus restoration, modal inertness, and responsive tests | copied runtime code, gesture-only dismissal, bounce as a default |
| Icon catalogs | one product-owned icon grammar, semantic naming, optical-box review, and explicit exceptions | icon inventory, accessible names, theme/contrast checks, and no mixed families in one region | importing a second visual language because it has broader coverage |
| Skeleton and reference-site projects | loading geometry shaped by real content and examples that expose source behavior | deterministic loading/empty/error fixtures and discoverable showcase links | framework dependency, decorative shimmer, or universal skeleton templates |
| Agent-installable repositories | a clear adoption entry point, pinned contract, migration brief, and evidence stages | `kin.config`, implementation brief, validation record, and rollback ownership | making Agent integration the product direction or accepting generated output without review |
| Scheduling-workspace observations | KIN-owned Schedule page contract, Context Sidecar distinction, reversible Sidebar collapse, and container-aware density rules | deterministic period/selection reference, wide reflow and narrow overlay checks, focus return, URL state, and Reduced Motion | copied calendar visuals, fake AI responses, hosted product assets, desktop-only behavior, or unsupported real-time claims |

## Page-flow references

These projects were reviewed for page taxonomy, workflow boundaries and state coverage. KIN does not inherit their visual style, framework architecture or product assumptions.

| Reference | Evidence used by KIN | Excluded use |
|---|---|---|
| [Logto](https://github.com/logto-io/logto) | identity lifecycle coverage across sign-in, verification, multi-factor authentication, organizations and invitations | identity-provider code, branding or a claim that KIN implements authentication |
| [Ory Elements](https://github.com/ory/elements) | separation of login, registration, recovery, verification and account settings | copied components, backend contracts or default styling |
| [Better Auth UI](https://github.com/better-auth-ui/better-auth-ui) | practical boundaries among sign-in, password recovery, account settings and organization controls | package adoption without a consuming-product review |
| [Cal.com](https://github.com/calcom/cal.diy) | resumable onboarding sequence, persisted personal settings, integration decisions and explicit completion | scheduling-specific fields or a universal onboarding order |
| [Formbricks](https://github.com/formbricks/formbricks) | organization setup, invitations, integrations, exports and localization as connected product flows | survey-specific information architecture or visual imitation |
| [Chatwoot](https://github.com/chatwoot/chatwoot) | durable inbox, team assignment, filtering, reporting and multilingual operational states | support-inbox terminology outside a real support task |
| [Twenty](https://github.com/twentyhq/twenty) | workspace, object and saved-view boundaries in a data-intensive product | CRM object models presented as universal KIN architecture |
| [Saleor Dashboard](https://github.com/saleor/saleor-dashboard) | mature commerce administration coverage for products, orders, channels and configuration | GraphQL or commerce architecture requirements for other product families |
| [Ant Design Pro](https://github.com/ant-design/ant-design-pro) | broad page taxonomy including forms, lists, profiles, result states, account pages and access failures | template layout, page copying or visual defaults |
| [Refine](https://github.com/refinedev/refine) | CRUD lifecycle, authentication, access control, URL state and unsaved-change concerns | framework adoption or generated-resource conventions as KIN requirements |
| [Shadcn Fintech Template](https://github.com/Weebapp003/shadcn-fintech-template) | supplemental coverage for transaction filtering, bulk export, dashboard personalization, notification read state, account settings, and help/support routes | shadcn defaults, Card-wall composition, mock financial data, simulated transfers or market activity, decorative authentication, and framework/package adoption |

## Authentication, recovery and accessibility sources

| Source | KIN use | Boundary |
|---|---|---|
| [W3C Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) | password-manager support, paste and autofill, and alternatives to cognitive-function tests | does not prove a consuming product's login flow conforms |
| [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | reauthentication and generic authentication-error principles | security implementation remains owned and verified by the consuming product |
| [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) | neutral recovery responses and resistance to account enumeration | the deterministic reference does not send reset messages |
| [OWASP Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) | recovery, factor-change and one-time-code risk boundaries | KIN does not provide an MFA backend |

## Runtime-component references

| Candidate | Adoption tier | KIN document |
|---|---|---|
| [NumberFlow](https://github.com/barvian/number-flow) | runtime-integrated; conditional KIN candidate | [`integrations/number-flow.md`](./integrations/number-flow.md) |
| [input-otp](https://github.com/guilhermerodz/input-otp) | runtime-integrated; conditional KIN candidate | [`integrations/input-otp.md`](./integrations/input-otp.md) |
| [Liveline](https://github.com/benjitaylor/liveline) | runtime-integrated; conditional KIN candidate | [`integrations/liveline.md`](./integrations/liveline.md) |
| [Leva](https://github.com/pmndrs/leva) | development-integrated only | [`integrations/leva.md`](./integrations/leva.md) |
| [cmdk](https://github.com/dip/cmdk) | runtime-integrated; stable Command Menu contract | [`integrations/cmdk.md`](./integrations/cmdk.md) |
| [React Virtuoso](https://github.com/petyosi/react-virtuoso) | runtime-integrated implementation utility at scale | [`integrations/virtuoso.md`](./integrations/virtuoso.md) |
| [dnd kit](https://github.com/clauderic/dnd-kit) | runtime-integrated; conditional KIN candidate | [`integrations/dnd-kit.md`](./integrations/dnd-kit.md) |
| [Sonner](https://github.com/emilkowalski/sonner) | runtime-integrated; stable Toast contract | [`integrations/sonner.md`](./integrations/sonner.md) |
| [Lucide](https://lucide.dev/) | core visual adapter | [`integrations/lucide.md`](./integrations/lucide.md) |

Package names, maintainers, APIs, licenses and support status can change. Every consuming project MUST verify current official documentation and license terms at adoption time.

## Brand and exceptional-tool references

| Reference | Allowed use | Excluded use |
|---|---|---|
| [ICONIC](https://github.com/YuheshPandian/ICONIC) | technical ecosystem pages and documentation | core navigation, state, tables, Inspector, command menu |
| [Pixel2Motion](https://github.com/nolangz/pixel2motion) | optional brand reveal and promotional output | route transitions, loading states, persistent animation |
| [Math Curve Loaders](https://github.com/Paidax01/math-curve-loaders) | exceptional long-running tasks with real progress | page loads, search, buttons, decoration |

See [`tools/brand-motion.md`](./tools/brand-motion.md) and [`tools/long-task-loaders.md`](./tools/long-task-loaders.md).

## Development validation

| Tool | Scope | Boundary |
|---|---|---|
| [Playwright](https://github.com/microsoft/playwright) | development-only responsive, theme, focus, dialog and screenshot checks | screenshots support human review; platform-sensitive pixel differences are not yet a normative merge gate |
| [Google DESIGN.md CLI](https://github.com/google-labs-code/design.md) | lint, interoperability export and Token diff | pinned alpha tooling does not replace KIN's prose, theme behavior or human product judgment |
| [Tokens Studio documentation](https://github.com/tokens-studio/tokens-studio-for-figma-plugin-docs) | DTCG JSON exchange, Token Sets, Themes, and reviewed export to Figma | plugin configuration is not a substitute for KIN theme semantics |
| [Figma Variables REST API](https://developers.figma.com/docs/rest-api/variables-endpoints/) | create-only Variables payload structure and platform limits | no credentials, automatic upload, or untested update synchronization in KIN |

The reviewed Playwright dependency is recorded in `package-lock.json` and does not ship to consuming products. CI installs Chromium only in the reference-interface job.

The current repository locks `@google/design.md` 0.3.0 and `@playwright/test` 1.61.1 as development-only dependencies. Both are published under Apache-2.0; their transitive dependency integrity is recorded in `package-lock.json` and reviewed with `npm audit` before release.

## Adoption record

Before introducing a third-party package, add a decision record containing:

```yaml
package:
version:
owner:
problem:
alternatives_considered:
bundle_impact:
ssr_hydration_impact:
accessibility_review:
reduced_motion_behavior:
theme_adapter:
license_reviewed_by:
adoption_date:
rollback_plan:
```

## Attribution and copying

- Link to sources; do not vendor their documentation by default.
- Paraphrase learned principles in KIN's own language.
- Preserve copyright notices when a license requires them.
- Do not copy logos, screenshots, icon sets, fonts or source code without permission and license review.
- Re-check links and project status before each KIN release.
