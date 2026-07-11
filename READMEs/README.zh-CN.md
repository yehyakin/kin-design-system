<h1 align="center">KIN Design System</h1>

<p align="center">
  面向数据密集型产品的共用界面规范。
</p>

<p align="center">
  <strong>[中文]</strong> &nbsp;|&nbsp; <a href="../README.md">English</a>
</p>

<p align="center">
  <a href="../DESIGN.md"><img src="https://img.shields.io/badge/Design_Contract-v1.0.0-5E6AD2" alt="KIN Design Contract v1.0.0" /></a>
  <a href="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml"><img src="https://github.com/yehyakin/kin-design-system/actions/workflows/validate-docs.yml/badge.svg" alt="Documentation validation" /></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/License-MIT-232326" alt="MIT License" /></a>
</p>

KIN 是 52.mk、电商运营工具和其他桌面式 Web 产品共用的设计参考。它记录颜色、字体、布局、交互、无障碍和第三方 UI 库的使用决定，避免每个项目重新做一遍选择。

这个仓库供产品设计师、前端工程师和编码工具共同使用。[`DESIGN.md`](../DESIGN.md) 是主规范，较短的文档分别说明具体原则和组件库的接入边界。

KIN 会参考 Linear 等产品公开分享的方法，但它不是 Linear 主题，也不会复制 Linear 的品牌资产、源码和业务模型。

## 为什么要建这个仓库

产品界面通常不是一次变乱的。一个新页面用了不同的间距；一个新面板又增加了一套灰色；某个组件库保留了默认样式；自动生成的页面带来了与现有产品无关的卡片、渐变和标签。时间久了，同一个产品里会出现多套规则。

KIN 用来统一这些问题：

- 哪些信息需要优先显示？
- 工作区、侧栏和属性栏应该怎样配合？
- 日间和夜间主题各自需要处理什么？
- AI 建议怎样与已经确认的数据区分？
- 哪些地方适合使用动画？
- 哪些第三方库值得采用，又不应该用在哪里？

## 仓库包含什么

| 范围 | 文档 | 内容 |
|---|---|---|
| 主规范 | [`DESIGN.md`](../DESIGN.md) | Token、布局、组件、主题、动效、无障碍、AI 行为和检查规则 |
| 来源 | [`REFERENCES.md`](../REFERENCES.md) | 来源优先级、引用方式和第三方采用规则 |
| Agent 指令 | [`AGENTS.md`](../AGENTS.md) | 编码工具在本仓库内需要遵守的规则 |
| 交互 | [`principles/apple-interaction.md`](../principles/apple-interaction.md) | 反馈、连续性、可中断动效和 Reduced Motion |
| UI 检查 | [`principles/anti-slop.md`](../principles/anti-slop.md) | 检查通用生成式 UI 问题的流程 |
| 布局检查 | [`principles/visual-taste.md`](../principles/visual-taste.md) | 层级、密度、节奏和构图 |
| 组件接入 | [`integrations/`](../integrations/) | 已选第三方 UI 库的使用规则 |
| 项目计划 | [`ROADMAP.md`](../ROADMAP.md) | 后续 Token、示例、产品模式和工具计划 |

## 快速开始

### 在本地阅读

```bash
git clone https://github.com/yehyakin/kin-design-system.git
cd kin-design-system
node scripts/validate-docs.mjs
```

校验脚本没有包依赖。它会检查必要文件、本地 Markdown 链接、代码块、占位注释和未解决的合并标记。

### 交给编码工具使用

先提供一段简单指令：

```md
修改界面前先完整阅读 DESIGN.md。

以当前产品、数据模型、已有组件和路由为起点。只读取本次任务需要的
principle 和 integration 文档。编码前先列出准备修改的内容、风险和验证方式。
```

然后按任务补充相关文档：

```text
修改导航或面板
  DESIGN.md
  principles/apple-interaction.md

增加命令菜单
  DESIGN.md
  integrations/cmdk.md

检查自动生成的改版
  DESIGN.md
  principles/anti-slop.md
  principles/visual-taste.md

制作实时监测页面
  DESIGN.md
  integrations/liveline.md
  integrations/number-flow.md
```

不需要为每个任务读取全部组件接入文档。先读主规范，再读取最少的相关文件即可。

## 基本规则

完整内容见 [`DESIGN.md`](../DESIGN.md)。下面是简版：

1. 先确定用户正在做什么，以及当前操作的是哪个对象。
2. 先使用间距、对齐、字体和表面差异，再考虑装饰。
3. 导航的视觉权重应低于主要工作区。
4. 只设一个主要交互色，其他颜色用于表达状态。
5. 重要数据应显示来源和更新时间。
6. AI 建议必须与已确认事实和人工决定分开。
7. 同时考虑键盘、触控、日间、夜间和 Reduced Motion。
8. 不编造指标、实时状态、客户评价和 AI 结果。
9. 增加依赖或新组件前，先检查已有实现能否复用。
10. 检查真实页面，不能只看代码或 lint 结果。

## 可选 UI 库

下面这些库只是经过记录的候选项，不是本仓库的依赖，也不应该因为出现在列表里就全部安装。

| 组件库 | 用途 | 不需要使用的情况 |
|---|---|---|
| [cmdk](../integrations/cmdk.md) | 命令菜单和全局搜索 | 普通搜索框已经足够 |
| [React Virtuoso](../integrations/virtuoso.md) | 大型列表和事件流 | 数据量较少，原生列表性能正常 |
| [Sonner](../integrations/sonner.md) | 保存、复制、撤销、重试和请求反馈 | 错误信息更适合显示在对应字段或对象旁边 |
| [NumberFlow](../integrations/number-flow.md) | 少量重要数字的真实变化 | 首次加载计数、ID、日期和普通表格单元格 |
| [Liveline](../integrations/liveline.md) | 小型实时图表 | 静态历史或精确表格更容易理解 |
| [dnd kit](../integrations/dnd-kit.md) | 收藏、规则和证据排序 | 顺序固定，或没有键盘操作方案 |
| [input-otp](../integrations/input-otp.md) | 已接入真实后端的一次性验证码 | 后端并不签发和验证验证码 |
| [Leva](../integrations/leva.md) | 开发环境中的设计调节 | 正式设置页和生产界面 |

每个使用 KIN 的产品仍要自行检查组件库的当前版本、许可证、维护状态、包体、服务端渲染和无障碍支持。

## 适用产品

### 情报和监测产品

实体数据库、风险记录、证据、域名、频道和监测任务。常见界面包括紧凑列表、分栏视图、对象详情、活动记录和属性栏。

### 电商运营产品

商品、素材、活动、库存、订单、审批和自动化任务。它们可以共用相同的应用框架和交互规则，但使用独立的电商状态和文案。

### 工程工具

CAD 文件、模型、图层、版本、仿真和评审。画布是主要工作区，导航和属性面板应该帮助操作画布，而不是与画布争抢注意力。

## 仓库结构

```text
kin-design-system/
├── DESIGN.md
├── AGENTS.md
├── REFERENCES.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── ROADMAP.md
├── READMEs/
│   └── README.zh-CN.md
├── principles/
├── integrations/
├── tools/
└── scripts/
    └── validate-docs.mjs
```

## 语言

- [English](../README.md)
- [简体中文](./README.zh-CN.md)

翻译文件应保持完整，不采用零散的机器翻译片段。英文文档结构发生变化时，应在同一个 Pull Request 中更新翻译，或者明确标记该翻译对应的源版本。

## 参与贡献

提出修改前请先阅读 [`CONTRIBUTING.md`](../CONTRIBUTING.md)。较大的设计规则变更需要说明产品问题、依据、影响范围、迁移方式和回滚方案。

提交 Pull Request 前运行：

```bash
node scripts/validate-docs.mjs
```

会影响读者或接入项目的改动，需要同步更新 [`CHANGELOG.md`](../CHANGELOG.md)。

## 路线图

- **1.0：** 设计文档、来源治理、组件说明和自动校验。
- **1.1：** 框架无关的 JSON Token 和生成的 CSS Variables。
- **1.2：** App Shell 与常用数据组件的参考状态。
- **1.3：** 情报、电商和工程产品的完整示例。
- **2.0：** Agent Skill、Figma Token、检查工具和迁移辅助。

完整计划与非目标见 [`ROADMAP.md`](../ROADMAP.md)。

## 参考资料

KIN 参考了 [Linear](https://linear.app/)、[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)、[Kill AI Slop](https://github.com/yetone/kill-ai-slop)、[Taste Skill](https://github.com/Leonxlnx/taste-skill) 的公开内容，以及 [Understand Anything](https://github.com/Egonex-AI/Understand-Anything) 的 README 信息结构。

这些项目不为 KIN 背书，各自的品牌、代码和资产仍归原权利人所有。来源使用规则见 [`REFERENCES.md`](../REFERENCES.md)。

## 许可证

KIN Design System 使用 [MIT License](../LICENSE)。

<p align="center">
  Maintained by KiN3.
</p>
