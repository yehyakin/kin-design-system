<h1 align="center">KIN Design System</h1>

<p align="center">
  一套用于清楚、专注的网站与应用界面的实用设计系统。
</p>

<p align="center">
  <strong>[中文]</strong> &nbsp;|&nbsp; <a href="../README.md">English</a>
</p>

<p align="center">
  <a href="https://yehyakin.github.io/kin-design-system/zh/">展示网站</a> &nbsp;·&nbsp;
  <a href="https://yehyakin.github.io/kin-design-system/">English website</a>
</p>

<p align="center">
  <a href="../DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v2.0.0-5E6AD2" alt="KIN Design Contract v2.0.0" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="Documentation validation" /></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT License" /></a>
</p>

KIN 是一套开放的界面设计系统，适用于需要让用户阅读、比较、判断或执行操作的网站和应用。它可以用于公开信息网站、内容与知识产品、SaaS、内部工具、电商运营、分析监控、AI 辅助流程，以及创意和工程类专业工具。

这套系统涵盖视觉基础、页面结构、交互、主题、无障碍、数据呈现、AI 行为、组件选择和交付检查。它以设计合同的方式编写，既可以由人阅读，也可以交给编码工具执行。

KIN 不属于某一家公司、行业、技术框架或产品架构。一个项目可以采用整套规范，也可以只使用其中与当前问题有关的规则，或者把它作为设计检查参考。

## 它解决什么问题

当每个新页面都重新决定颜色、间距、层级、组件行为和响应式布局时，产品很容易逐渐失去一致性。如果设计师、开发者、第三方组件库和编码工具同时参与，这个问题会更加明显。

KIN 为常见问题提供一套共用答案：

- 哪些信息应该突出，哪些内容应该保持安静？
- 内容、导航、属性和操作应该怎样组织？
- 日间、夜间、移动端、键盘和 Reduced Motion 应该怎样处理？
- 数据来源、过期数据、不确定性和 AI 建议应该怎样显示？
- 图表、动效、卡片、标签或第三方组件在什么情况下真正有用？
- 一次改版上线前应该检查什么？

它的目的，是让产品保持一致，而不是让所有产品长得完全相同。

## 谁可以使用 KIN

| 使用者 | KIN 能提供什么 |
|---|---|
| 产品与视觉设计师 | 共用的层级、布局、主题、动效、组件和检查规则 |
| 前端工程师 | 可实现的目标、完整状态、无障碍要求和依赖边界 |
| 产品团队 | 设计与开发讨论方案和取舍时可以共用的语言 |
| 独立开发者 | 不依赖大型设计团队的完整起点 |
| 编码工具与 Agent | 修改界面前可以读取的明确约束和执行顺序 |
| 评审者与维护者 | 检查一致性、可用性、无障碍和多余视觉噪音的依据 |

使用 KIN 不需要指定的设计软件或前端框架。

## 适用场景

只要界面需要清楚呈现信息，并支持用户反复使用，KIN 就可以提供参考。

| 产品类型 | 示例 |
|---|---|
| 信息与内容 | 导航、目录、数据库、文档、研究、媒体档案、知识库 |
| SaaS 与账户产品 | 设置、账单、项目、团队空间、客户门户、自助服务 |
| 管理与运营 | 后台、审批、库存、客服、物流、财务、流程工具 |
| 商业与电商 | 商品目录、商家工具、活动运营、订单、库存、素材生产 |
| 数据与监测 | 分析、报表、状态页、风险记录、可观测性、实时运营 |
| AI 辅助产品 | 搜索、推荐、审核、生成、自动化、Agent 活动、证据面板 |
| 创意与专业工具 | 编辑器、设计工具、CAD、建模、仿真、资产管理 |

并不是每个产品都需要高密度布局、侧栏、属性面板或命令菜单。KIN 说明这些模式什么时候有用，但不会要求所有页面都采用同一种结构。

## 规范涵盖什么

### 视觉基础

- 日间、夜间和跟随系统主题
- 中性色表面与语义颜色
- 英文和中文界面的字体规范
- 间距、密度、圆角、边界、图标和层级
- 焦点、对比度、触控区域和 Reduced Preferences

### 页面与应用结构

- 先处理信息层级，再处理装饰
- 公开内容页和适合阅读的内容宽度
- App Shell、侧栏、视图控制、工作区和属性面板
- 列表、分栏、详情、看板、时间线、画布和全屏视图
- 重新安排优先级的响应式设计，而不是简单缩小桌面界面

### 组件与状态

- 数据行、指标、活动记录、按钮、表单、菜单、弹窗、抽屉和通知
- 加载、空、错误、部分、过期、离线和无权限状态
- 数据可视化和数字变化
- 键盘、读屏、鼠标和触控行为

### 数据与 AI

- 来源、时间、单位、可信度和数据完整度
- 事实、规则、人工决定和 AI 建议之间的区分
- 自动化操作的范围、进度、确认、历史和回滚
- 不模拟结果，不伪造实时状态，也不编造推理过程

### 交付与检查

- 分阶段改版流程
- 无障碍和性能检查
- 依赖审查
- 对通用生成式界面问题的 Anti-Slop 检查
- Feature Flag、逐步发布和回滚计划

## 使用 KIN 的方式

### 作为设计参考

在规划或检查界面时阅读 [`DESIGN.md`](../DESIGN.md)。不需要把整个仓库复制到项目中，也可以采用单独的规则。

### 作为项目设计合同

把主规范和需要的支持文档加入项目文档。项目确实需要例外时，应记录例外和原因，而不是悄悄改变规则。

KIN 2.0 提供不覆盖现有文件的接入记录和候选问题审计：

```bash
node scripts/init-adoption.mjs ../your-project
node scripts/check-adoption.mjs ../your-project
node scripts/audit-project.mjs ../your-project
```

审计器只把代码模式列为待复核项，不会把正则命中当成视觉结论，也不会自动改写源码。接入合同、例外格式和产品类型见 [`adoption/README.md`](../adoption/README.md)。

### 交给编码工具使用

编码工具支持 Agent Skill 时，使用仓库中的：

```text
skills/kin-design/SKILL.md
```

Skill 会区分新建、保留式改造、整体改造、审计和设计评审，只加载当前任务需要的流程，并要求提供视觉与工程证据后才能声称符合 KIN。

不支持 Skill 的工具，仍应在修改界面前先读取主规范：

```md
修改界面前先阅读 DESIGN.md。

以当前产品、用户、内容、数据、路由和已有组件为起点。
只读取本次任务需要的 principle 和 integration 文档。
编码前列出准备修改的内容、风险和验证方式。
```

然后读取最少的相关文件：

```text
页面层级或导航
  DESIGN.md
  principles/visual-taste.md
  principles/apple-interaction.md

检查自动生成的改版
  DESIGN.md
  principles/anti-slop.md

命令菜单或大型数据列表
  DESIGN.md
  integrations/cmdk.md
  integrations/virtuoso.md

实时指标
  DESIGN.md
  integrations/liveline.md
  integrations/number-flow.md

信息网站、电商、情报或工程画布产品
  DESIGN.md
  patterns/ 中匹配的产品模式
  components/core-states.md

日夜间开关、系统主题或语言菜单
  DESIGN.md
  components/preference-controls.md
  integrations/lucide.md
```

支持项目指令文件的工具可以直接读取 [`AGENTS.md`](../AGENTS.md)。

### 参与 KIN 的开发

```bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
npm ci
npx playwright install chromium
npm run validate
npm run test:reference
```

仓库工具需要 Node.js 20.11 或更高版本。设计合同和文档校验器仍然没有包依赖。Playwright 只作为参考界面的开发测试依赖。

## 一套实际的设计顺序

KIN 建议按照下面的顺序解决界面问题：

1. 理解用户、任务、内容和数据。
2. 确定哪些信息主要、次要、可选或隐藏。
3. 选择页面或工作区结构。
4. 定义交互行为和全部数据状态。
5. 检查无障碍、键盘、触控和响应式行为。
6. 应用视觉 Token 和组件规则。
7. 只在动效能解释变化或确认操作时加入动效。
8. 上线前使用真实内容检查真实页面。

如果一开始先选择渐变、卡片布局、动画或组件库，就颠倒了这个顺序。

## 简明规则

1. 让用户容易找到当前任务。
2. 先使用顺序、对齐、间距和字体，再使用颜色与装饰。
3. 导航和辅助信息的视觉权重应低于主要内容。
4. 使用一个主要交互色，其他颜色只在有明确含义时使用。
5. 重要数据应说明来源和更新时间。
6. 区分事实、人工选择、规则、估算和 AI 建议。
7. 设计完整状态，不能只设计数据齐全的理想页面。
8. 同时支持日间、夜间、移动端、键盘、触控和 Reduced Motion。
9. 增加依赖或组件变体前，先检查已有实现能否复用。
10. 检查渲染后的真实界面；通过扫描器或代码审查并不代表界面已经做好。

## KIN 不要求什么

- 不要求使用 React、Tailwind、shadcn/ui 或其他指定框架。
- 不要求使用三栏工作台。
- 不要求默认采用夜间模式。
- 不要求每个页面都保持高信息密度。
- 不要求安装所有列出的 UI 库。
- 不替代产品研究、内容设计、可用性测试和品牌设计。
- 不是 Linear 复刻、Landing Page 模板或现成后台主题。

## 可选 UI 库

组件接入文档会说明某个库什么时候有用、什么时候应该跳过。设计合同本身不要求安装这些包；展示站使用 Lucide 和延迟加载的 Sonner 交互岛作为经过测试的参考实现，接入项目仍应根据自己的技术栈和已有组件决定依赖。

| 组件库 | 适合用途 | 不需要使用的情况 |
|---|---|---|
| [Lucide](../integrations/lucide.md) | KIN 参考实现的单色 UI 图标库 | 产品已经有一套完整、一致的图标系统 |
| [cmdk](../integrations/cmdk.md) | 命令菜单和全局搜索 | 普通搜索框已经足够 |
| [React Virtuoso](../integrations/virtuoso.md) | 大型列表和事件流 | 原生渲染性能正常 |
| [Sonner](../integrations/sonner.md) | 保存、复制、撤销、重试和请求反馈 | 信息更适合显示在对应对象旁边 |
| [NumberFlow](../integrations/number-flow.md) | 少量重要数值的变化 | 数值是 ID、日期、首次计数或普通表格单元格 |
| [Liveline](../integrations/liveline.md) | 小型实时图表 | 静态历史或表格更容易说明数据 |
| [dnd kit](../integrations/dnd-kit.md) | 用户控制的排序 | 顺序固定，或没有键盘替代操作 |
| [input-otp](../integrations/input-otp.md) | 真实的一次性验证码流程 | 后端并不签发或验证验证码 |
| [Leva](../integrations/leva.md) | 仅开发环境使用的设计调节 | 控件需要进入生产设置页 |

使用这些组件的项目仍要自行检查当前版本、许可证、维护状态、包体、渲染行为和无障碍支持。

## 仓库指南

| 路径 | 用途 |
|---|---|
| [`DESIGN.md`](../DESIGN.md) | 规范性设计合同 |
| [`skills/kin-design/`](../skills/kin-design/) | Agent 工作流、任务路由和审计协议 |
| [`tokens/`](../tokens/) | 生成的 Tailwind CSS、DTCG 与 Figma Variables 互操作文件 |
| [`adoption/`](../adoption/) | 接入项目的配置 Schema、示例和使用说明 |
| [`scripts/audit-project.mjs`](../scripts/audit-project.mjs) | 带人工复核边界的只读静态候选审计 |
| [`scripts/export-figma-variables.mjs`](../scripts/export-figma-variables.mjs) | 生成 create-only Figma Variables REST 请求体 |
| [`components/core-states.md`](../components/core-states.md) | 规范性组件状态与验收矩阵 |
| [`components/preference-controls.md`](../components/preference-controls.md) | 日夜间开关、系统主题与语言菜单的规范性合同 |
| [`examples/workspace-reference/`](../examples/workspace-reference/) | 无框架、支持明暗主题和响应式的视觉基准页 |
| [`patterns/`](../patterns/) | 信息、情报、电商和工程界面的产品合同 |
| [`examples/product-patterns/`](../examples/product-patterns/) | 信息、电商和工程产品的差异化参考页 |
| [`AGENTS.md`](../AGENTS.md) | 编码工具在本仓库内使用的指令 |
| [`REFERENCES.md`](../REFERENCES.md) | 来源优先级、引用和第三方采用规则 |
| [`principles/`](../principles/) | 交互、视觉检查、层级、密度和构图 |
| [`integrations/`](../integrations/) | 可选 UI 库的使用规则 |
| [`tools/`](../tools/) | 品牌动效和长任务加载器的边界 |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | 贡献和版本规则 |
| [`scripts/validate-design.mjs`](../scripts/validate-design.mjs) | Token、引用、主题一致性和对比度检查 |
| [`scripts/report-token-changes.mjs`](../scripts/report-token-changes.mjs) | 对比 Git 基准的机器可读 Token 变更报告 |
| [`tests/visual/`](../tests/visual/) | 响应式、主题、焦点和浮层自动检查 |
| [`ROADMAP.md`](../ROADMAP.md) | 计划中的示例、产品模式、导出和工具 |
| [`RELEASING.md`](../RELEASING.md) | 发布检查、Tag 顺序、仓库设置和回滚流程 |
| [`CHANGELOG.md`](../CHANGELOG.md) | 面向使用者的变更记录 |

## 语言

- [English](../README.md)
- [简体中文](./README.zh-CN.md)

翻译文件应保持完整。不要只为了增加语言数量，就发布未经审核的机器翻译。

## 当前状态与路线图

2.0 版本加入设计工具互操作、以人工复核为前提的静态审计，以及可固定版本的项目接入合同。它继续保留 1.4 的产品类型和参考界面，并让项目接入方式更加明确、可检查。

后续工作将优先依据真实项目的接入结果，而不是继续增加通用规则。当前计划与非目标见 [`ROADMAP.md`](../ROADMAP.md)。

## 参与贡献

提出修改前请阅读 [`CONTRIBUTING.md`](../CONTRIBUTING.md)。设计系统变更需要说明问题、依据、影响范围、迁移方式和回滚方案。

提交 Pull Request 前运行：

```bash
node scripts/validate-docs.mjs
node scripts/validate-design.mjs
node scripts/export-tokens.mjs --check
node scripts/export-figma-variables.mjs --check
npm run test:tooling
npm run test:reference
```

如果改动会影响读者或接入项目，请同步更新 [`CHANGELOG.md`](../CHANGELOG.md)。

## 参考资料

KIN 参考了 [Linear](https://linear.app/)、[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)、[Kill AI Slop](https://github.com/yetone/kill-ai-slop)、[Taste Skill](https://github.com/Leonxlnx/taste-skill) 的公开内容，以及 [Understand Anything](https://github.com/Egonex-AI/Understand-Anything) 的 README 信息结构。

这些项目不为 KIN 背书，各自的品牌、代码和资产仍归原权利人所有。来源使用规则见 [`REFERENCES.md`](../REFERENCES.md)。

## 许可证

KIN Design System 使用 [MIT License](../LICENSE)。

<p align="center">
  Maintained by KiN3.
</p>
