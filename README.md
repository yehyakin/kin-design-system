<h1 align="center">KIN Design System</h1>

<p align="center">
  <strong>A quiet intelligence design language for AI products, data platforms, and professional workspaces.</strong>
  <br />
  <em>为复杂智能产品提供安静、精确、可信且可执行的界面规范。</em>
</p>

<p align="center">
  <a href="./DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v1.0.0-5E6AD2" alt="KIN Design Contract v1.0.0" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="Documentation validation" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="./DESIGN.md">Design Contract</a> ·
  <a href="./REFERENCES.md">References</a> ·
  <a href="./ROADMAP.md">Roadmap</a> ·
  <a href="./CONTRIBUTING.md">Contributing</a>
</p>

---

**复杂产品通常不是一次变乱的。它们是在每次合理新增一个按钮、状态、面板和例外后，逐渐失去层级。**

KIN 为 AI 工作台、情报数据库、电商运营系统和工程软件提供一套可以被设计师、工程师与编码 Agent 共同读取的设计合同。它定义信息如何获得注意力、工作区如何组织、AI 如何展示依据、主题与动效如何响应用户偏好，以及哪些常见的 AI 生成界面模式必须被拒绝。

> **目标不是让产品“看起来像 Linear”，而是让复杂工作变得安静、清楚、快速且可控。**

KIN 受到 Linear 的产品纪律、Apple 的交互原则和 Anti-Slop 社区实践启发，但不复制任何品牌资产、私有字体、专有图标、业务模型或产品界面。

---

## What KIN provides

### A normative design contract

[`DESIGN.md`](./DESIGN.md) 是整个仓库的规范性入口。它包含：

- 设计哲学与产品人格
- 亮色、暗色与跟随系统主题
- 语义颜色、排版、密度、Surface 与边界
- Sidebar、Workspace、View Bar 与 Inspector 架构
- 数据列表、Activity Feed、Metric Strip 与 Command Layer
- AI 建议、证据、不确定性与人类控制合同
- 动效、Reduced Motion、可访问性与性能要求
- Intelligence、Ecommerce 与 Engineering 产品扩展
- Anti-Slop 质量门禁与 Agent 执行协议

### Focused principles

KIN 把跨框架原则拆成可按任务读取的短文档：

| Principle | Purpose |
|---|---|
| [Direct and Continuous Interaction](./principles/apple-interaction.md) | 即时反馈、空间连续性、可中断动效和辅助偏好 |
| [Anti-Slop Review](./principles/anti-slop.md) | 识别并人工审查机器默认的视觉与文案模式 |
| [Visual Taste Calibration](./principles/visual-taste.md) | 校准层级、密度、节奏、构图与克制程度 |

### Integration contracts, not mandatory dependencies

KIN 记录第三方组件的采用条件和视觉边界，但不会把它们强制安装到每个产品中。

| Candidate | Role | Adoption |
|---|---|---|
| [cmdk](./integrations/cmdk.md) | 全局命令与搜索 | Core candidate |
| [React Virtuoso](./integrations/virtuoso.md) | 大型列表与持续事件流 | At scale |
| [Sonner](./integrations/sonner.md) | 主动操作反馈、撤销和错误 | Core candidate |
| [NumberFlow](./integrations/number-flow.md) | 真实数值变化 | Conditional |
| [Liveline](./integrations/liveline.md) | 小型实时趋势图 | Conditional |
| [dnd kit](./integrations/dnd-kit.md) | 用户明确需要的排序 | Conditional |
| [input-otp](./integrations/input-otp.md) | 接入真实后端的安全流程 | Conditional |
| [Leva](./integrations/leva.md) | 设计参数校准 | Development only |

每个消费项目仍需独立审查版本、许可证、包体、SSR、Hydration、可访问性和维护状态。

---

## Quick Start

### 1. Clone and validate

```bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
node scripts/validate-docs.mjs
```

校验脚本零依赖运行，检查必需文件、本地 Markdown 链接、代码围栏、占位注释和未解决的合并标记。

### 2. Give your coding agent the contract

```md
Read DESIGN.md completely before changing UI.

Then read only the principle and integration documents relevant to this task.
Audit the real product, entity model, data states, existing components and
dependencies first. Report the proposed changes, risks and verification plan
before implementation.

Do not create card walls, glow, decorative AI visuals, fake metrics or
unnecessary dependencies. Preserve light/dark/system themes, mobile,
accessibility, reduced motion, SSR, SEO, permissions and real APIs.
```

仓库根目录还提供 [`AGENTS.md`](./AGENTS.md)，供支持分层项目指令的编码 Agent 自动读取。

### 3. Load only what the task needs

```text
Changing navigation?
  DESIGN.md + principles/apple-interaction.md

Adding a command menu?
  DESIGN.md + integrations/cmdk.md

Reviewing an AI-generated redesign?
  DESIGN.md + principles/anti-slop.md + principles/visual-taste.md

Building a live monitoring view?
  DESIGN.md + integrations/liveline.md + integrations/number-flow.md
```

### 4. Start from product reality

Before creating components, identify:

1. The user task and current object.
2. The information that has earned attention.
3. The source and freshness of every critical value.
4. Loading, empty, error, partial, stale and permission states.
5. Keyboard, touch, mobile and reduced-motion behavior.
6. Existing components and dependencies that can be reused.

KIN is a decision framework. It cannot replace product understanding.

---

## Core principles

### Content earns attention

当前对象、主要内容和关键行动拥有最高层级。导航、辅助属性和次要操作在完成定位后主动退后。

### Structure should be felt, not seen

结构来自对齐、间距、Surface 差异和必要的柔和边界。能够通过内容关系理解的区域，不需要额外卡片和分隔线。

### AI must expose evidence and uncertainty

人工属性、业务规则、原始数据和 AI 建议必须区分。重要 AI 结果应说明结论、依据、不确定性和用户可控的下一步。

### One accent, semantic color only

界面使用一个主要交互强调色。其他颜色只表达业务状态，不承担装饰职责。

### Dense, not cramped

专业软件需要高密度。密度来自减少重复和对齐信息，而不是无限缩小字号、行高与触控区域。

### Human control remains visible

高影响操作必须可确认、可审计，并在可能时支持撤销。自动化不隐藏范围、依据和结果。

---

## Product families

### Intelligence workspaces

适用于代理情报、风险证据、监测平台和行业数据库。核心对象包括实体、域名、频道、风险信号、证据和监测任务。

### Ecommerce workspaces

适用于商品、素材、活动、库存、订单、审批和 Agent 工作流。它与情报产品共享 Shell、主题和交互合同，但使用独立的商业语义。

### Engineering workspaces

适用于 CAD、模型、图层、构件、版本、仿真和评审。Canvas 是主要工作表面，导航与 Inspector 必须服务空间判断，而不是与画布竞争。

---

## How KIN works

```text
Product reality
    ↓
KIN design contract
    ↓
Relevant principle and integration guidance
    ↓
Product-specific implementation
    ↓
Visual, accessibility, performance and Anti-Slop review
```

KIN 不发布一个必须全量安装的 React 组件包。设计合同保持框架无关；可执行 Token、参考组件和 Agent 工具按 [`ROADMAP.md`](./ROADMAP.md) 分阶段演进。

---

## Repository structure

```text
kin-design-system/
├── DESIGN.md                  Normative design contract
├── AGENTS.md                  Repository-wide Agent instructions
├── REFERENCES.md              Source hierarchy and adoption governance
├── CONTRIBUTING.md            Contribution and versioning rules
├── CHANGELOG.md               Notable design-system changes
├── ROADMAP.md                 Planned implementation layers
├── principles/
│   ├── apple-interaction.md
│   ├── anti-slop.md
│   └── visual-taste.md
├── integrations/
│   ├── cmdk.md
│   ├── virtuoso.md
│   ├── sonner.md
│   ├── number-flow.md
│   ├── liveline.md
│   ├── dnd-kit.md
│   ├── input-otp.md
│   └── leva.md
├── tools/
│   ├── brand-motion.md
│   └── long-task-loaders.md
├── scripts/
│   └── validate-docs.mjs
└── .github/
    ├── workflows/
    └── ISSUE_TEMPLATE/
```

---

## Source governance

[`REFERENCES.md`](./REFERENCES.md) 记录每个外部来源的用途、采用层级和禁止复制内容。

发生冲突时，优先级为：

1. 真实产品任务、用户、数据和约束
2. KIN 已批准的规范与决策
3. 可访问性、平台和安全要求
4. 技术官方文档
5. 公开产品设计讨论
6. 社区 Skill 与第三方分析
7. 第三方组件默认视觉

KIN 是独立设计系统，不复制 Linear 或其他产品的 Logo、字体、专有图标、源代码和业务模型，也不暗示任何隶属关系。

---

## Contributing

KIN 通过真实产品证据演进。视觉偏好本身不足以修改规范性规则。

1. 阅读 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。
2. 为较大的设计变更创建 Design change proposal。
3. 说明产品问题、证据、受影响范围、迁移方式和回滚路径。
4. 更新 [`CHANGELOG.md`](./CHANGELOG.md)。
5. 运行文档校验：

```bash
node scripts/validate-docs.mjs
```

Pull Request 模板会要求检查日间、夜间、移动端、键盘、辅助功能和 Reduced Motion 影响。

---

## Roadmap

- **1.0 — Documentation foundation:** 设计合同、来源治理、组件适配和 CI。
- **1.1 — Executable tokens:** JSON Token、CSS Variables 和高对比度主题。
- **1.2 — Reference components:** App Shell、Sidebar、Inspector 和数据组件示例。
- **1.3 — Product patterns:** 情报、电商、AI 审批和工程工作台模式。
- **2.0 — Agent and design tooling:** Agent Skill、Figma Token、审计 CLI 和迁移工具。

完整范围与 Non-goals 见 [`ROADMAP.md`](./ROADMAP.md)。

---

## Acknowledgements

KIN 的设计方向受到以下公开工作启发：

- [Linear](https://linear.app/) 对低噪音、高密度、精确对齐和专业工作流的公开设计讨论
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) 对直接操控、连续性与辅助功能的原则
- [Kill AI Slop](https://github.com/yetone/kill-ai-slop) 对机器默认视觉模式的识别方法
- [Taste Skill](https://github.com/Leonxlnx/taste-skill) 对 Agent 生成界面的审查实践
- [Understand Anything](https://github.com/Egonex-AI/Understand-Anything) 清楚、行动导向的开源 README 信息架构

这些来源不为 KIN 背书，各自的品牌、代码和资产归原权利人所有。

---

<p align="center">
  <strong>Less visual noise. More usable intelligence.</strong>
  <br />
  <em>让结构退后，让内容、证据和人的判断向前。</em>
</p>

<p align="center">
  Released under the <a href="./LICENSE">MIT License</a> · Copyright © 2026 KiN3
</p>
