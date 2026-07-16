<h1 align="center">KIN Design System</h1>

<p align="center">
  <strong>面向信息密集型网站与专业软件的设计系统。</strong>
</p>

<p align="center">
  设计合同 · Token · 可运行参考 · 验证工具
</p>

<p align="center" aria-label="语言">
  <strong>[中文]</strong> &nbsp;|&nbsp; <a href="../README.md">English</a>
</p>

<p align="center">
  <a href="https://yehyakin.github.io/kin-design-system/zh/">在线展示</a> &nbsp;·&nbsp;
  <a href="../DESIGN.md">设计合同</a> &nbsp;·&nbsp;
  <a href="../adoption/README.md">接入指南</a>
</p>

<p align="center">
  <a href="../DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v3.0.0_development-5E6AD2" alt="KIN Design Contract v3.0.0 development" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="文档校验" /></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT 许可证" /></a>
</p>

> **版本状态：**生产项目请使用 [v2.3.0](https://github.com/yehyakin/kin-design-system/releases/tag/v2.3.0)；`main` 分支是开发中的 KIN 3.0.0。

KIN 帮助团队统一处理信息层级、页面结构、主题、动效、无障碍、数据呈现、AI 辅助流程、组件和上线检查。设计师、工程师、产品团队、评审者和编码工具都可以读取同一套规则。

这个仓库提供设计合同和可核查的参考，不提供一套强加给所有产品的应用模板。接入产品仍然拥有自己的品牌、组件、数据、路由、权限和发布流程。

## 在线体验

下面的页面使用固定的本地示例数据，用来展示 KIN 的构图和行为。它们不是生产服务，也不能单独证明某个产品已经完成 KIN 接入。

| 参考页 | 可以查看什么 |
|---|---|
| [完整展示](https://yehyakin.github.io/kin-design-system/zh/) | 原则、主题、产品类型、组件和仓库入口 |
| [工作台参考](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/?lang=zh-CN) | 侧栏、工作区、属性面板、响应式、主题和语言控件 |
| [核心组件](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=zh-CN) | 操作、表单、数据、反馈、浮层、身份验证和组件状态 |
| [登录与账户恢复](https://yehyakin.github.io/kin-design-system/examples/page-patterns/access.html?lang=zh-CN) | 完整登录页、账户恢复、会话状态和返回上下文 |
| [页内登录弹窗](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=zh-CN&dialog=authentication#authentication) | 不丢失当前任务的页内登录 |
| [敏感操作身份确认](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/core-components.html?lang=zh-CN&dialog=reauthentication#authentication) | 执行敏感操作前的会话重新验证 |
| [动效实验室](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/motion.html?lang=zh-CN) | 按钮、菜单、提示、Sonner 任务、抽屉、中断、手势和减弱动态效果 |
| [集成实验室](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/integrations.html?lang=zh-CN) | 通过 KIN 适配层运行的官方组件包 |

## 从这里开始

### 阅读与评审

建议依次阅读：

1. [产品方向](../VISION.md)
2. [设计合同](../DESIGN.md)
3. [视觉特征](../principles/visual-signature.md)
4. [交付方式](../DELIVERY.md)

仅把 KIN 作为设计检查参考时，不需要安装指定框架，也不需要把整个仓库复制进产品。

### 接入稳定版

接入脚本应从固定版本的 KIN 仓库中运行，而不是在目标项目里直接执行：

~~~bash
git clone --branch v2.3.0 --depth 1 https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
node scripts/init-adoption.mjs ../your-project --profile information-site
node scripts/check-adoption.mjs ../your-project
node scripts/audit-project.mjs ../your-project
~~~

根据准备修改的路由选择产品类型：

| 产品类型 | 主要任务 |
|---|---|
| [`information-site`](../patterns/information-site.md) | 查找、阅读、核实、引用和再次访问内容 |
| [`intelligence-workspace`](../patterns/intelligence-workspace.md) | 查看对象、证据、变化、风险和监测状态 |
| [`ecommerce-operations`](../patterns/ecommerce-operations.md) | 处理商品、订单、库存、活动、审批和素材 |
| [`engineering-canvas`](../patterns/engineering-canvas.md) | 编辑文件、模型、几何、版本、约束和仿真 |

混合型产品可以为不同路由族选择不同类型。初始化器会创建由目标项目维护的实施简报和证据记录；它不会改写产品代码，也不会把项目自动标记为完成。开始迁移前请阅读[接入指南](../adoption/README.md)。

### 交给编码工具使用

支持 Agent Skill 的工具可以读取：

~~~text
skills/kin-design/SKILL.md
~~~

其他工具可以先收到这段简短指令：

~~~md
修改界面前，完整阅读 DESIGN.md、DELIVERY.md 和
principles/visual-signature.md。以真实用户任务、现有产品、内容、数据、
路由、权限和组件为起点。存在 kin.config.json 时，先读取其中的
实施简报和路由/产品类型映射。

编码前汇报 KIN 构图检查点、准备修改的内容、风险、验证计划和回滚方式。
不得用组件画廊替代真实流程，不得编造数据，也不得用 Token 映射或
构建通过来声称已经完成 KIN 接入。
~~~

Agent Skill 只是应用 KIN 的一种方式，不是 KIN 的产品方向。

### 参与 KIN 3.0 的开发

仓库工具需要 Node.js 20.11 或更高版本：

~~~bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
npm ci
npx playwright install chromium firefox webkit
npm run validate
npm run test:reference
~~~

修改规范性规则前，请先阅读[贡献指南](../CONTRIBUTING.md)。

## 采用 KIN 后，界面应该有什么变化

KIN 不是通过某一种颜色、夜间主题或三栏框架被识别。完成后的界面应该体现这些决定：

- 用户进入页面后先看到任务、主题、文档或当前对象，再看到解释和装饰。
- 同一状态只有一个主要工作或阅读区域；导航和辅助属性主动降低视觉权重。
- 先用对齐、节奏、数据行、分隔线和轻微的表面层级组织内容，再考虑卡片。
- 通过删除重复信息提高密度，而不是缩小文字和控件。
- 界面大部分保持中性；强调色只用于选择、操作或明确的业务含义。
- 状态、风险、可信度、完整度、可用性、权限和任务进度分别表达。
- 动效用于解释来源、方向、状态或真实完成结果；启用减弱动态效果（Reduced Motion）后仍能理解变化。

完整验收条件见 [KIN 视觉特征](../principles/visual-signature.md)。

## KIN 涵盖什么

| 范围 | 已提供的规则 |
|---|---|
| 视觉基础 | 日间、夜间和跟随系统主题；字体；间距；密度；表面；边界；图标；焦点；对比度 |
| 页面结构 | 信息页、应用框架、列表、分栏视图、属性面板、任务上下文侧栏、排期、看板和画布 |
| 组件 | 操作、表单、导航、数据展示、反馈、浮层、身份验证、状态合同和成熟度追踪 |
| 产品状态 | 加载、空、错误、部分、过期、离线、无权限、恢复和长任务 |
| 数据与 AI | 来源、时间、单位、不确定性、证据、人工确认、范围、历史和回滚 |
| 交互 | 键盘、鼠标、触控、响应式优先级、可中断动效、减弱动态效果，以及本地化与长文本压力测试 |
| 交付 | 接入简报、版本化 Token、可运行参考、验证记录、逐步上线和回滚 |

页面和组件的成熟度分别记录在[页面目录](../pages/catalog.md)和[组件目录](../components/catalog.md)中。

## 交付方式

KIN 以设计合同为核心（contract-first）：

- 核心仓库提供规范文档、生成 Token、无框架参考页、验证工具、Agent Skill 和接入证据格式。
- Figma 支持目前指 Variables 互操作，不代表已经发布 Figma Component Library。
- 生产组件仍由每个接入产品维护。
- 私有预发布 `@kin-design/react` 是集成实验室，不是已发布的通用依赖。
- 设计实验页、组件画廊、截图或构建通过都不能证明生产接入；验证必须基于一个明确的生产工作流和已记录证据。

具体边界和未来发布门禁见 [DELIVERY.md](../DELIVERY.md)。

## 运行时集成

在[集成实验室](https://yehyakin.github.io/kin-design-system/examples/workspace-reference/integrations.html?lang=zh-CN)中可以直接操作已评审的上游组件。KIN 保留它们成熟的行为和动效，只补充产品语义、Token、主题与验证边界。

| 层级 | 集成 | KIN 的使用边界 |
|---|---|---|
| 核心图标适配 | [Lucide](../integrations/lucide.md) | 保持一套统一的单色图标体系 |
| 稳定运行时合同 | [cmdk](../integrations/cmdk.md)、[React Virtuoso](../integrations/virtuoso.md)、[Sonner](../integrations/sonner.md) | 命令与搜索、大列表渲染、临时操作反馈 |
| 候选运行时合同 | [NumberFlow](../integrations/number-flow.md)、[Liveline](../integrations/liveline.md)、[dnd kit](../integrations/dnd-kit.md)、[input-otp](../integrations/input-otp.md) | 只在真实业务需要并补齐项目证据后使用 |
| 仅开发环境 | [Leva](../integrations/leva.md) | 用于内部设计调节，不进入生产入口 |

没有任何项目需要安装全部集成。接入前仍需核对当前版本、许可证、维护状态、包体、渲染行为、无障碍和回滚方式。

## 接入与验证

KIN 把接入拆成四个阶段，避免把基础设施误当成已经完成的设计：

1. **已初始化（Initialized）**——确定固定版本、产品类型、本地路径和负责人。
2. **已映射（Mapped）**——完成实施简报、路由类型映射、组件映射、例外和代表性工作流。
3. **已验证（Verified）**——实现该工作流，分别记录自动检查、人工检查，以及基于可比基线和候选页面的视觉评审。
4. **已观察生产表现（Production-observed）**——记录上线版本、观察日期、负责人和回滚路径。

自动检查、截图、浏览器冒烟测试、真实缩放、触控和读屏评审属于不同证据。没有执行的检查必须如实保留为未执行。详见[验证要求](../principles/verification.md)。

## 仓库导航

| 路径 | 用途 |
|---|---|
| [`VISION.md`](../VISION.md) | 产品方向和优先级 |
| [`DESIGN.md`](../DESIGN.md) | 主要规范性设计合同 |
| [`principles/`](../principles/) | 视觉层级、动效、无障碍和评审规则 |
| [`components/`](../components/) | 组件合同、术语、成熟度和状态 |
| [`pages/`](../pages/) | 完整页面族合同和成熟度 |
| [`patterns/`](../patterns/) | 不同产品类型的构图规则 |
| [`examples/`](../examples/) | 可运行、数据固定的参考界面 |
| [`integrations/`](../integrations/) | 可选上游组件的决策和边界 |
| [`tokens/`](../tokens/) | 生成的 CSS、DTCG、Tailwind 兼容与 Figma Variables 输出 |
| [`adoption/`](../adoption/) | 项目配置、实施简报、证据和迁移指南 |
| [`skills/kin-design/`](../skills/kin-design/) | Agent 任务路由和评审流程 |
| [`DELIVERY.md`](../DELIVERY.md) | Figma、运行时、所有权和发布边界 |
| [`rfcs/`](../rfcs/) | RFC 提案、决策与状态；RFC 被接受后仍需写入现行治理合同才具有规范效力 |

## 项目状态

- **稳定版：**[v2.3.0](https://github.com/yehyakin/kin-design-system/releases/tag/v2.3.0)
- **开发中：**`main` 分支上的 KIN 3.0.0
- **路线图：**[ROADMAP.md](../ROADMAP.md)
- **变更记录：**[CHANGELOG.md](../CHANGELOG.md)

组件和页面的成熟度由机器可读目录记录，不再在 README 中手工维护数量。

## 参与贡献

提案需要说明产品问题、依据、受影响的产品类型、迁移影响、验证和回滚方式。请从[贡献指南](../CONTRIBUTING.md)开始；完整检查命令也统一维护在那里。

## 来源与独立性

KIN 是独立设计系统。外部项目可以提供方法和评审问题，但不会自动成为 KIN 规则。KIN 不复制第三方品牌资产、专有界面、字体、图标或源代码。

来源优先级、引用和集成规则见 [REFERENCES.md](../REFERENCES.md)。

## 许可证

KIN Design System 使用 [MIT License](../LICENSE)。

<p align="center">
  由 KiN3 维护。
</p>
