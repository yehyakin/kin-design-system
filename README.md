# KIN Design System

KIN is a calm, evidence-aware interface system for AI-assisted intelligence, commerce, and professional workspaces.

它不是一套 Linear 皮肤，也不是 React Starter。KIN 定义产品设计合同、语义 Token、工作台结构、交互行为和质量门禁；具体项目只在存在真实需求时引入运行时组件。

## Start here

1. 阅读 [`DESIGN.md`](./DESIGN.md)。这是规范性入口。
2. 阅读 [`REFERENCES.md`](./REFERENCES.md)，了解外部参考的用途与边界。
3. 根据任务读取相关 `principles/`、`integrations/` 或 `tools/` 文档。
4. 审计现有产品后再设计或编码，禁止直接套用模板。

## Repository map

```text
DESIGN.md                  核心设计合同
REFERENCES.md              外部来源、采用层级与治理
principles/                跨框架设计原则
integrations/              第三方组件的 KIN 适配规则
tools/                     品牌动效与特殊加载工具边界
scripts/                   无依赖文档校验工具
.github/                   CI、Issue 与 PR 模板
```

## Product families

- Intelligence workspaces：数据库、风险证据、持续监控。
- Ecommerce workspaces：商品、素材、活动、库存和 Agent 工作流。
- Engineering workspaces：CAD、模型、版本、仿真与评审。

## Core posture

- Content earns attention.
- Structure should be felt, not seen.
- AI suggestions must expose evidence and uncertainty.
- One primary accent; other colors are semantic.
- Dense, keyboard-friendly, accessible and reversible.
- No card walls, glow, decorative AI visuals or fake metrics.

## Using KIN with a coding agent

```md
Read DESIGN.md completely before changing UI.
Then read only the principle and integration documents relevant to this task.
Audit the current product, data states, components and dependencies first.
Report the proposed changes, risks and verification plan before implementation.
```

## Dependency policy

This repository does not install product dependencies. `cmdk`, React Virtuoso, Sonner and other libraries documented here are candidates, not mandatory packages. Each consuming product owns its dependency decision, version pinning, license review, bundle analysis and migration plan.

## Status

`v1.0.0` documentation foundation. Framework adapters, executable tokens, examples and automated design audits are future layers; mechanical documentation validation is already included.

See [`ROADMAP.md`](./ROADMAP.md) for planned layers and [`CONTRIBUTING.md`](./CONTRIBUTING.md) before proposing changes.

## License

KIN Design System is released under the [MIT License](./LICENSE). External projects retain their own licenses and trademarks. Do not copy third-party code or assets into this repository without completing a license review.
