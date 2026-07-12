---
version: alpha
name: KIN Design System
kin_version: 2.0.0
status: normative
language: zh-CN
description: A calm, precise interface system for information-rich websites, commerce tools, and professional workspaces.
principles:
  - quiet-intelligence
  - content-priority
  - human-control
  - evidence-and-provenance
  - structure-felt-not-seen
  - dense-but-legible
supported_products:
  - intelligence-workspace
  - ecommerce-workspace
  - ai-operations
  - engineering-workspace
colors:
  primary: "#5e6ad2"
  dark-canvas: "#08090a"
  dark-sidebar: "#0b0c0d"
  dark-surface-1: "#0f1011"
  dark-surface-2: "#141516"
  dark-surface-3: "#191a1c"
  dark-surface-4: "#202124"
  dark-surface-hover: "rgba(255, 255, 255, 0.045)"
  dark-surface-selected: "rgba(94, 106, 210, 0.12)"
  dark-surface-overlay: "rgba(8, 9, 10, 0.72)"
  dark-text-primary: "#f4f5f7"
  dark-text-secondary: "#c9cbd1"
  dark-text-muted: "#8b8f98"
  dark-text-disabled: "#62666d"
  dark-text-inverse: "#151619"
  dark-icon-primary: "#d7d9de"
  dark-icon-muted: "#7f838b"
  dark-line-subtle: "rgba(255, 255, 255, 0.055)"
  dark-line-default: "rgba(255, 255, 255, 0.09)"
  dark-line-strong: "rgba(255, 255, 255, 0.15)"
  dark-accent: "#5e6ad2"
  dark-accent-hover: "#626dcc"
  dark-accent-active: "#515dbf"
  dark-accent-soft: "rgba(94, 106, 210, 0.14)"
  dark-focus-ring: "rgba(130, 143, 255, 0.72)"
  dark-monitor: "#4fd0de"
  dark-monitor-soft: "rgba(79, 208, 222, 0.10)"
  dark-positive: "#50ad7d"
  dark-warning: "#c69a45"
  dark-negative: "#d26a5c"
  dark-critical: "#d85866"
  dark-offline: "#777c85"
  light-canvas: "#f6f7f8"
  light-sidebar: "#f0f1f3"
  light-surface-1: "#ffffff"
  light-surface-2: "#f4f5f6"
  light-surface-3: "#eceef0"
  light-surface-4: "#e4e6e9"
  light-surface-hover: "rgba(20, 22, 26, 0.045)"
  light-surface-selected: "rgba(82, 94, 196, 0.10)"
  light-surface-overlay: "rgba(246, 247, 248, 0.76)"
  light-text-primary: "#18191c"
  light-text-secondary: "#494c53"
  light-text-muted: "#6b7079"
  light-text-disabled: "#a1a5ad"
  light-text-inverse: "#f7f8fa"
  light-icon-primary: "#3f4248"
  light-icon-muted: "#7d828b"
  light-line-subtle: "rgba(20, 22, 26, 0.06)"
  light-line-default: "rgba(20, 22, 26, 0.10)"
  light-line-strong: "rgba(20, 22, 26, 0.17)"
  light-accent: "#5360c5"
  light-accent-hover: "#4653b7"
  light-accent-active: "#3e4aa6"
  light-accent-soft: "rgba(83, 96, 197, 0.10)"
  light-focus-ring: "rgba(73, 88, 196, 0.62)"
  light-monitor: "#167f8d"
  light-monitor-soft: "rgba(22, 127, 141, 0.09)"
  light-positive: "#247b56"
  light-warning: "#8e650f"
  light-negative: "#a94838"
  light-critical: "#b23749"
  light-offline: "#6f747d"
  contrast-dark-canvas: "#000000"
  contrast-dark-surface-1: "#08090a"
  contrast-dark-text-primary: "#ffffff"
  contrast-dark-text-secondary: "#e1e4e8"
  contrast-dark-line-default: "#747a86"
  contrast-dark-focus-ring: "#a8b1ff"
  contrast-light-canvas: "#ffffff"
  contrast-light-surface-1: "#ffffff"
  contrast-light-text-primary: "#08090a"
  contrast-light-text-secondary: "#343840"
  contrast-light-line-default: "#6a707a"
  contrast-light-focus-ring: "#3946b8"
typography:
  display:
    fontFamily: "Inter, Geist, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 38px
    letterSpacing: -0.02em
  page-title:
    fontFamily: "Inter, Geist, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: -0.01em
  entity-title:
    fontFamily: "Inter, Geist, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.01em
  section-title:
    fontFamily: "Inter, Geist, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0em
  body:
    fontFamily: "Inter, Geist, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0em
  ui:
    fontFamily: "Inter, Geist, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0em
  metadata:
    fontFamily: "Inter, Geist, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 17px
    letterSpacing: 0em
  mono:
    fontFamily: "Geist Mono, JetBrains Mono, monospace"
    fontSize: 12px
    fontWeight: 450
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  xs: 3px
  sm: 5px
  md: 7px
  lg: 10px
  xl: 14px
  round: 999px
spacing:
  0: 0
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
components:
  app-shell-dark:
    backgroundColor: "{colors.dark-canvas}"
    textColor: "{colors.dark-text-primary}"
  app-shell-light:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-text-primary}"
  sidebar-dark:
    backgroundColor: "{colors.dark-sidebar}"
    textColor: "{colors.dark-text-secondary}"
  sidebar-light:
    backgroundColor: "{colors.light-sidebar}"
    textColor: "{colors.light-text-secondary}"
  metadata-dark:
    textColor: "{colors.dark-text-muted}"
    typography: "{typography.metadata}"
  metadata-light:
    textColor: "{colors.light-text-muted}"
    typography: "{typography.metadata}"
  disabled-dark:
    textColor: "{colors.dark-text-disabled}"
  disabled-light:
    textColor: "{colors.light-text-disabled}"
  inverse-text-dark:
    textColor: "{colors.dark-text-inverse}"
  inverse-text-light:
    textColor: "{colors.light-text-inverse}"
  icon-primary-dark:
    textColor: "{colors.dark-icon-primary}"
  icon-primary-light:
    textColor: "{colors.light-icon-primary}"
  icon-muted-dark:
    textColor: "{colors.dark-icon-muted}"
  icon-muted-light:
    textColor: "{colors.light-icon-muted}"
  divider-dark-subtle:
    backgroundColor: "{colors.dark-line-subtle}"
  divider-dark-default:
    backgroundColor: "{colors.dark-line-default}"
  divider-dark-strong:
    backgroundColor: "{colors.dark-line-strong}"
  divider-light-subtle:
    backgroundColor: "{colors.light-line-subtle}"
  divider-light-default:
    backgroundColor: "{colors.light-line-default}"
  divider-light-strong:
    backgroundColor: "{colors.light-line-strong}"
  button-dark:
    rounded: "{rounded.sm}"
    typography: "{typography.ui}"
    backgroundColor: "{colors.dark-accent}"
    textColor: "{colors.light-surface-1}"
  button-dark-hover:
    rounded: "{rounded.sm}"
    typography: "{typography.ui}"
    backgroundColor: "{colors.dark-accent-hover}"
    textColor: "{colors.light-surface-1}"
  button-dark-active:
    rounded: "{rounded.sm}"
    typography: "{typography.ui}"
    backgroundColor: "{colors.dark-accent-active}"
    textColor: "{colors.light-surface-1}"
  button-light:
    rounded: "{rounded.sm}"
    typography: "{typography.ui}"
    backgroundColor: "{colors.light-accent}"
    textColor: "{colors.light-surface-1}"
  button-light-hover:
    rounded: "{rounded.sm}"
    typography: "{typography.ui}"
    backgroundColor: "{colors.light-accent-hover}"
    textColor: "{colors.light-surface-1}"
  button-light-active:
    rounded: "{rounded.sm}"
    typography: "{typography.ui}"
    backgroundColor: "{colors.light-accent-active}"
    textColor: "{colors.light-surface-1}"
  input-dark:
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
    backgroundColor: "{colors.dark-surface-2}"
    textColor: "{colors.dark-text-primary}"
  input-light:
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
    backgroundColor: "{colors.light-surface-1}"
    textColor: "{colors.light-text-primary}"
  inset-region-light:
    rounded: "{rounded.sm}"
    backgroundColor: "{colors.light-surface-2}"
    textColor: "{colors.light-text-primary}"
  command-menu-dark:
    rounded: "{rounded.lg}"
    backgroundColor: "{colors.dark-surface-3}"
    textColor: "{colors.dark-text-primary}"
  command-menu-light:
    rounded: "{rounded.lg}"
    backgroundColor: "{colors.light-surface-3}"
    textColor: "{colors.light-text-primary}"
  popover-dark:
    rounded: "{rounded.lg}"
    backgroundColor: "{colors.dark-surface-4}"
    textColor: "{colors.dark-text-primary}"
  row-hover-dark:
    rounded: "{rounded.xs}"
    backgroundColor: "{colors.dark-surface-hover}"
  row-hover-light:
    rounded: "{rounded.xs}"
    backgroundColor: "{colors.light-surface-hover}"
  selected-region-dark:
    rounded: "{rounded.sm}"
    backgroundColor: "{colors.dark-surface-selected}"
  selected-region-light:
    rounded: "{rounded.sm}"
    backgroundColor: "{colors.light-surface-selected}"
  overlay-dark:
    backgroundColor: "{colors.dark-surface-overlay}"
  overlay-light:
    backgroundColor: "{colors.light-surface-overlay}"
  dialog-light:
    rounded: "{rounded.xl}"
    backgroundColor: "{colors.light-surface-4}"
    textColor: "{colors.light-text-primary}"
  data-row:
    rounded: "{rounded.xs}"
    typography: "{typography.ui}"
  inspector-dark:
    backgroundColor: "{colors.dark-surface-1}"
    textColor: "{colors.dark-text-primary}"
  inspector-light:
    backgroundColor: "{colors.light-surface-1}"
    textColor: "{colors.light-text-primary}"
  focus-indicator-dark:
    backgroundColor: "{colors.dark-focus-ring}"
  focus-indicator-light:
    backgroundColor: "{colors.light-focus-ring}"
  accent-region-dark:
    backgroundColor: "{colors.dark-accent-soft}"
  accent-region-light:
    backgroundColor: "{colors.light-accent-soft}"
  monitor-status-dark:
    textColor: "{colors.dark-monitor}"
  monitor-status-light:
    textColor: "{colors.light-monitor}"
  monitor-region-dark:
    backgroundColor: "{colors.dark-monitor-soft}"
  monitor-region-light:
    backgroundColor: "{colors.light-monitor-soft}"
  positive-status-dark:
    textColor: "{colors.dark-positive}"
  positive-status-light:
    textColor: "{colors.light-positive}"
  warning-status-dark:
    textColor: "{colors.dark-warning}"
  warning-status-light:
    textColor: "{colors.light-warning}"
  negative-status-dark:
    textColor: "{colors.dark-negative}"
  negative-status-light:
    textColor: "{colors.light-negative}"
  critical-status-dark:
    textColor: "{colors.dark-critical}"
  critical-status-light:
    textColor: "{colors.light-critical}"
  offline-status-dark:
    textColor: "{colors.dark-offline}"
  offline-status-light:
    textColor: "{colors.light-offline}"
  high-contrast-dark:
    backgroundColor: "{colors.contrast-dark-canvas}"
    textColor: "{colors.contrast-dark-text-primary}"
  high-contrast-dark-surface:
    backgroundColor: "{colors.contrast-dark-surface-1}"
    textColor: "{colors.contrast-dark-text-secondary}"
  high-contrast-dark-divider:
    backgroundColor: "{colors.contrast-dark-line-default}"
  high-contrast-dark-focus:
    backgroundColor: "{colors.contrast-dark-focus-ring}"
  high-contrast-light:
    backgroundColor: "{colors.contrast-light-canvas}"
    textColor: "{colors.contrast-light-text-primary}"
  high-contrast-light-surface:
    backgroundColor: "{colors.contrast-light-surface-1}"
    textColor: "{colors.contrast-light-text-secondary}"
  high-contrast-light-divider:
    backgroundColor: "{colors.contrast-light-line-default}"
  high-contrast-light-focus:
    backgroundColor: "{colors.contrast-light-focus-ring}"
---

# KIN Design System

KIN 是面向信息网站、电商运营工具、数据产品和其他桌面式 Web 产品的界面设计系统。

它借鉴 Linear 对密度、层级、速度和低噪音界面的产品纪律，以及 Apple 对直接操控、连续性和辅助功能的交互原则，但不复制任何品牌资产、私有字体、专有图标、业务模型或产品外观。

KIN 的设计人格是：**Quiet Intelligence — 安静的智能。**

智能不通过发光、渐变、机器人图标或夸张动画证明自己。智能通过更少的操作、更清楚的上下文、可验证的依据和可逆的人类控制被感知。

本文件是设计合同，不是灵感板。产品设计师、工程师和编码 Agent 必须把其中的 `MUST`、`MUST NOT`、`SHOULD` 和 `MAY` 视为规范性要求：

- `MUST`：必须满足，否则不得交付。
- `MUST NOT`：禁止使用，除非产品负责人记录了明确例外。
- `SHOULD`：默认遵循；偏离时必须说明理由。
- `MAY`：可根据真实业务需要采用。

Frontmatter 中的 `version: alpha` 表示兼容 DESIGN.md 社区格式；`kin_version` 表示 KIN 规范版本。Frontmatter Token 是机器可读值，正文解释其语义、边界与使用方式。两者发生差异时必须停止交付并修复，不得由 Agent 自行选择其中一份。

---

## 0. Agent 执行协议

### 0.1 开始设计或编码前

Agent 必须先完成以下动作：

1. 阅读本文件全文。
2. 阅读项目的 `README`、`AGENTS.md`、现有 Token、组件库和路由。
3. 识别产品类型、核心对象、主要任务和信息来源。
4. 搜索已有组件，禁止先创建重复组件。
5. 识别真实数据状态：加载、空、错误、部分、过期、无权限和离线。
6. 确认日间、夜间、键盘、触控和 reduced motion 的影响。
7. 列出准备新增的依赖及每项依赖解决的真实问题。

### 0.2 设计顺序

必须按照以下顺序解决问题：

1. 用户任务与对象模型
2. 信息优先级
3. 页面结构与导航
4. 交互行为与状态
5. 可访问性
6. 响应式行为
7. 视觉样式
8. 动效与品牌增强

禁止从渐变、卡片、插画或动画开始。

### 0.3 每个新组件必须回答

- 它解决什么问题？
- 谁在什么上下文中使用它？
- 已有组件为什么不能解决？
- 它有哪些状态？
- 键盘、读屏和触控如何使用？
- 日间与夜间主题是否完整？
- reduced motion 下如何工作？
- 没有数据、数据过期或操作失败时显示什么？
- 删除它是否会明显降低任务完成效率？

若最后一题答案是否定的，优先不创建该组件。

### 0.4 禁止 Agent 自行假定

Agent 不得自行假定：

- 统计数字、准确率、用户数或覆盖范围；
- AI 后端、实时数据流、OTP 服务或导出任务已经存在；
- 第三方组件的默认视觉适合 KIN；
- 桌面端表格可以直接缩小为移动端；
- 所有页面都需要三栏；
- 所有对象都需要图表、Badge 或 AI 摘要。

---

## 1. 设计哲学

### 1.1 Quiet Intelligence

界面应像专业仪器：安静、可靠、反应迅速。AI 能力应融入现有工作流，而不是占据一个持续争抢注意力的视觉层。

AI 建议必须和人工设定、规则结果、原始数据清楚区分。推断必须能查看依据，自动化必须可控制、可回退、可审计。

### 1.2 Content Earns Attention

视觉权重必须由任务重要性获得。

- 当前对象、主要内容和关键行动处于最高层级。
- 导航、辅助属性和次要操作主动后退。
- 不因为某元素“可点击”就给它品牌色。
- 不因为某模块“重要”就把它做成大卡片。
- 不同时制造多个视觉中心。

### 1.3 Structure Should Be Felt, Not Seen

结构通过对齐、间距、表面差异和少量柔和边界被感知。分隔线只在能解释关系时存在。

如果移除一条边线后关系依然清楚，应移除它。如果必须依赖粗边框理解布局，应重新检查结构。

### 1.4 Data Before Decoration

任何关键数字必须有定义、单位、时间范围和来源。相对时间应能查看绝对时间。预测、估算和事实必须在语言和视觉上区分。

### 1.5 Human Control

高影响操作必须满足：

- 结果可预览或清楚说明；
- 默认不隐式执行；
- 可撤销时提供撤销；
- 不可撤销时要求明确确认；
- AI 操作显示范围、依据和预期影响；
- 自动化保留暂停、检查和接管路径。

### 1.6 Density With Clarity

KIN 面向高复杂度工作，默认信息密度较高。密度来自减少重复文案和装饰，不来自牺牲可读性。

界面应允许熟练用户快速扫描，同时让新用户依靠清楚的标题、列对齐和渐进披露完成任务。

---

## 2. 产品人格与视觉方向

### 2.1 人格

- Precise：精确，不含糊。
- Calm：安静，不争抢注意力。
- Intelligent：理解上下文，而非装饰性 AI。
- Trustworthy：显示来源、边界和不确定性。
- Efficient：键盘、鼠标和触控均高效。
- Technical：具有工具感，但不扮演终端。
- Refined：细节统一，不靠奢华效果。

### 2.2 不属于 KIN

- Cyberpunk 或 gaming UI
- 霓虹监控大屏
- 通用 SaaS Admin 模板
- 营销 Landing Page 套进产品内部
- 玻璃卡片墙
- 蓝紫 AI 渐变
- 大量漂浮圆角卡片
- Emoji 与 sparkle 图标表达 AI
- 伪造的实时状态或假思考过程

### 2.3 风格参数

```yaml
design_variance: 3
motion_intensity: 4
visual_density: 8
decoration_level: 2
content_priority: 10
```

---

## 3. 语义颜色系统

### 3.1 原则

KIN 以中性色为主体，只保留一个主要交互强调色。业务颜色只表达语义，不用于装饰。

组件必须引用语义 Token，禁止在组件文件中散落 Hex。Primitive Token 可在主题生成层存在，业务组件只消费 alias。

建议主题模型由三个输入参数派生：

```ts
type ThemeSeed = {
  base: string;      // 中性基色
  accent: string;    // 主要交互色
  contrast: number;  // 0–100，对比度偏好
};
```

自定义主题 SHOULD 使用 OKLCH/LCH 等感知更均匀的色彩空间生成表面、文字、边界和控件状态。以下默认值是基准，而非允许组件硬编码的颜色清单。

### 3.2 暗色主题

```css
[data-theme="dark"] {
  color-scheme: dark;

  --canvas: #08090a;
  --surface-sidebar: #0b0c0d;
  --surface-1: #0f1011;
  --surface-2: #141516;
  --surface-3: #191a1c;
  --surface-4: #202124;
  --surface-hover: rgba(255, 255, 255, 0.045);
  --surface-selected: rgba(94, 106, 210, 0.12);
  --surface-overlay: rgba(8, 9, 10, 0.72);

  --text-primary: #f4f5f7;
  --text-secondary: #c9cbd1;
  --text-muted: #8b8f98;
  --text-disabled: #62666d;
  --text-inverse: #151619;

  --icon-primary: #d7d9de;
  --icon-muted: #7f838b;

  --line-subtle: rgba(255, 255, 255, 0.055);
  --line-default: rgba(255, 255, 255, 0.09);
  --line-strong: rgba(255, 255, 255, 0.15);

  --accent: #5e6ad2;
  --accent-hover: #626dcc;
  --accent-active: #515dbf;
  --accent-soft: rgba(94, 106, 210, 0.14);
  --focus-ring: rgba(130, 143, 255, 0.72);

  --monitor: #4fd0de;
  --monitor-soft: rgba(79, 208, 222, 0.10);

  --positive: #50ad7d;
  --warning: #c69a45;
  --negative: #d26a5c;
  --critical: #d85866;
  --offline: #777c85;
}
```

暗色 Canvas 不使用纯黑。侧栏默认比工作区更暗、更低对比；用户到达内容后，导航应退后。

### 3.3 亮色主题

```css
[data-theme="light"] {
  color-scheme: light;

  --canvas: #f6f7f8;
  --surface-sidebar: #f0f1f3;
  --surface-1: #ffffff;
  --surface-2: #f4f5f6;
  --surface-3: #eceef0;
  --surface-4: #e4e6e9;
  --surface-hover: rgba(20, 22, 26, 0.045);
  --surface-selected: rgba(82, 94, 196, 0.10);
  --surface-overlay: rgba(246, 247, 248, 0.76);

  --text-primary: #18191c;
  --text-secondary: #494c53;
  --text-muted: #6b7079;
  --text-disabled: #a1a5ad;
  --text-inverse: #f7f8fa;

  --icon-primary: #3f4248;
  --icon-muted: #7d828b;

  --line-subtle: rgba(20, 22, 26, 0.06);
  --line-default: rgba(20, 22, 26, 0.10);
  --line-strong: rgba(20, 22, 26, 0.17);

  --accent: #5360c5;
  --accent-hover: #4653b7;
  --accent-active: #3e4aa6;
  --accent-soft: rgba(83, 96, 197, 0.10);
  --focus-ring: rgba(73, 88, 196, 0.62);

  --monitor: #167f8d;
  --monitor-soft: rgba(22, 127, 141, 0.09);

  --positive: #247b56;
  --warning: #8e650f;
  --negative: #a94838;
  --critical: #b23749;
  --offline: #6f747d;
}
```

亮色主题不是“灰背景 + 白卡片”。主要工作区可以是连续的 `surface-1`，Canvas 只用于应用外层、导航差异和分区。

### 3.4 状态语义

状态默认使用“小图形 + 文本”，而非彩色胶囊。

必须区分：

- 业务状态：对象当前处于什么阶段。
- 健康状态：服务或任务是否正常。
- 风险等级：发生不利事件的可能性或影响。
- 证据可信度：证据来源与佐证质量。
- 数据完整度：所需字段的覆盖程度。
- AI 置信度：模型对当前推断的自评或校准结果。

这些概念不得共用同一组件名称、颜色规则或文案。

`证据可信度 90 / 100` 必须附带定义；不得简写为 `90 高可信`。

### 3.5 对比度

- 正文 MUST 达到 WCAG AA 4.5:1。
- 大文字和 UI 图形 MUST 达到至少 3:1。
- `text-disabled` 不得用于仍需阅读的说明。
- 颜色不得成为唯一状态提示。
- 高对比度模式应增强文字、边界和焦点，而不是改变业务颜色含义。

### 3.6 高对比度参考主题

高对比度是辅助偏好，不是新的品牌皮肤。它只增强中性色、结构边界和焦点，不改变风险、证据、健康、监测或 AI 置信度的业务语义。

```css
[data-theme="dark"][data-contrast="more"] {
  --canvas: #000000;
  --surface-1: #08090a;
  --text-primary: #ffffff;
  --text-secondary: #e1e4e8;
  --line-default: #747a86;
  --focus-ring: #a8b1ff;
}

[data-theme="light"][data-contrast="more"] {
  --canvas: #ffffff;
  --surface-1: #ffffff;
  --text-primary: #08090a;
  --text-secondary: #343840;
  --line-default: #6a707a;
  --focus-ring: #3946b8;
}
```

组件 MAY 在高对比度模式下减少或取消透明度、阴影和细微 Surface 差异。焦点、选择、当前导航和错误仍必须分别可辨认。

---

## 4. 字体系统

### 4.1 字体栈

KIN 不依赖私有字体。优先复用产品已有的合法字体。

```css
--font-sans: Inter, Geist, "SF Pro Text", -apple-system, BlinkMacSystemFont,
  "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  system-ui, sans-serif;

--font-display: Inter, Geist, "SF Pro Display", var(--font-sans);

--font-mono: "Geist Mono", "JetBrains Mono", "SFMono-Regular", Consolas,
  monospace;
```

如果实际使用 Inter Variable，MAY 启用适合品牌的 OpenType alternates，但不得将第三方观察中的特定字形或 510 权重宣称为 KIN 的强制要求。中文必须单独进行光学校准。

### 4.2 字级

| Token | Size / line-height | Weight | 用途 |
|---|---:|---:|---|
| `display` | 32 / 38 | 600 | 仅品牌页、空白首次体验 |
| `page-title` | 20 / 26 | 600 | 页面标题 |
| `entity-title` | 18 / 24 | 600 | 对象标题 |
| `section-title` | 14 / 20 | 600 | 区块标题 |
| `body` | 14 / 22 | 400 | 中文正文、说明 |
| `ui` | 13 / 18 | 500 | 按钮、导航、数据行 |
| `metadata` | 12 / 17 | 400 | 时间、来源、辅助信息 |
| `micro` | 11 / 15 | 500 | 极小状态与表头，谨慎使用 |
| `mono` | 12 / 18 | 450 | ID、代码、技术值 |

### 4.3 排版规则

- 中文正文 letter-spacing 为 `0`。
- 中文标题 MAY 使用 `-0.005em` 至 `-0.01em`，必须视觉验证。
- 拉丁标题 18px 以上 MAY 使用 `-0.01em` 至 `-0.02em`。
- 14px 以下不使用负字距。
- 数字使用 `font-variant-numeric: tabular-nums`。
- 表头不使用全大写英文模拟专业感。
- 不在每个标题上方增加英文 kicker。
- 一个页面不超过三个主要字重。
- 应用工作台不使用 48–72px 营销标题。

---

## 5. 空间、尺寸与密度

### 5.1 间距

使用 4px 基础网格：

```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

间距表达关系：同组元素更近，不同区块更远。禁止机械地为所有区块使用相同 gap。

### 5.2 工作台尺寸

```css
--sidebar-width: 232px;
--inspector-width: 344px;
--topbar-height: 48px;
--viewbar-height: 40px;
--row-height-compact: 36px;
--row-height-default: 40px;
--row-height-comfortable: 44px;
--content-reading-max: 760px;
```

这些是默认值，不是所有产品的硬编码。电商素材工作台、CAD 画布和全屏分析视图 MAY 改变列宽或隐藏栏位。

### 5.3 圆角

```css
--radius-xs: 3px;
--radius-sm: 5px;
--radius-md: 7px;
--radius-lg: 10px;
--radius-xl: 14px;
--radius-round: 999px;
```

- 数据行、标签、紧凑控件：3–5px。
- 输入框、按钮、菜单项：5–7px。
- Popover、命令菜单：7–10px。
- Dialog、移动抽屉：10–14px。
- `radius-round` 仅用于头像、状态点、开关和确实需要胶囊的单行筛选。

禁止 `rounded-xl everywhere` 和组件内多层圆角套叠。

### 5.4 图标

- 核心工作台只使用一套单色线性图标。
- 默认 16px；紧凑工具栏 14px；主要触控操作 18–20px。
- 默认 stroke 约 1.5px，保持视觉统一。
- 图标必须使用 `currentColor`。
- 侧栏非活动图标应弱于正文。
- 能用文字清楚表达时，不强制添加图标。
- 禁止彩色图标底砖和技术 Logo 墙进入工作区。

---

## 6. Surface、边界与层级

### 6.1 Surface Ladder

层级从低到高：

1. `canvas`：应用底层。
2. `surface-sidebar`：退后的导航层。
3. `surface-1`：主要工作内容。
4. `surface-2`：选中、分组、嵌入区域。
5. `surface-3`：菜单、浮层和短暂提升。
6. `surface-4`：最高层浮动内容。

较高层在暗色中通常更亮，在亮色中通过细微明度、边线和必要的小阴影区分。

### 6.2 边界

- 默认使用 1px 半透明 hairline，跨显示器比 0.5px 更稳定。
- 只在解释包含关系、列关系或交互边界时使用。
- 相邻表面已有足够差异时不增加边线。
- 新版界面应优先减少无意义分隔线，并软化保留的边界。
- 区块结束可用留白替代 divider。

### 6.3 阴影

普通页面、表格、Inspector section 和 Sidebar 不使用外部阴影。

阴影只允许用于：

- Dialog
- Command menu
- Popover / Context menu
- Toast
- 浮动 AI 面板
- 移动端 Drawer

```css
--shadow-floating:
  0 16px 44px rgba(0, 0, 0, 0.22),
  0 3px 10px rgba(0, 0, 0, 0.14);
```

阴影必须小而紧，不得产生光晕。

### 6.4 透明材质

桌面端毛玻璃不是基础材质。MAY 用于短暂浮层或操作系统风格的移动底栏，但必须支持 `prefers-reduced-transparency`，并提供实心 surface 替代。

---

## 7. 应用架构

### 7.1 标准工作台

```text
App Shell
├── Sidebar：导航、保存视图、工作区切换
├── Chrome
│   ├── Location Bar：当前位置与全局动作
│   └── View Bar：视图、筛选、排序与显示方式
├── Workspace：用户当前任务的主内容
├── Inspector：当前对象的属性与上下文
└── Command Layer：命令、菜单、Dialog、Toast
```

位置栏和视图栏的动作位置必须在不同模块中保持一致。分享、复制链接、更多操作等不得在页面之间随意换位。

### 7.2 视觉优先级

1. Workspace
2. 当前对象与主要操作
3. Inspector 上下文
4. View Bar
5. Sidebar 与全局导航

Sidebar 在用户到达目标后应退后，不应持续成为页面最亮的区域。

### 7.3 视图类型

KIN 支持但不强制以下结构：

- List：高密度对象列表。
- Split：列表 + 对象详情。
- Detail：单个对象完整档案。
- Board：阶段或空间关系确实重要时。
- Timeline：时间、依赖和区间是核心时。
- Canvas：设计、CAD、创意和关系图。
- Fullscreen：分析、演示或专注编辑。

不得把所有业务强行做成 Dashboard cards。

### 7.4 响应式

- `>= 1280px`：可使用 Sidebar + Workspace + Inspector。
- `1024–1279px`：Inspector 可收起或覆盖。
- `768–1023px`：Sidebar 折叠，Inspector overlay。
- `< 768px`：单栏；底部导航或顶层返回；属性进入 Drawer 或详情页。

移动端必须重新排序信息，不得只缩小桌面界面。触控目标至少 44×44px，视觉图标可以更小，但命中区域不能缩小。

---

## 8. 核心组件规范

适用组件的完整状态、交互与验收矩阵见 [`components/core-states.md`](./components/core-states.md)。正文定义设计原则，状态合同把原则转成可检查行为；两者均为规范性要求。

### 8.1 Sidebar

Purpose：建立全局位置感并快速切换工作区。

Rules：

- 背景比 Workspace 更退后。
- 非活动文字与图标使用 muted 层级。
- 活动项使用轻微 surface 和清楚文字，不使用高饱和整块背景。
- 图标更少、更小；不为每一项加彩色容器。
- 分组标题克制，支持折叠但不要层层树状嵌套。
- 保存视图和收藏可重排时显示专用 drag handle。

Anti-patterns：卡片化导航、彩虹图标、粗分隔、巨型 Logo、每项 Badge。

### 8.2 Location Bar 与 View Bar

Location Bar 回答“我在哪里”，View Bar 回答“我如何查看这里”。二者不可混成一排杂乱按钮。

- 高度紧凑、对齐精确。
- 常用操作保持固定位置。
- 次要操作收进上下文菜单。
- 小屏可合并，但语义仍应区分。

### 8.3 Data Row

```text
Identity | Primary metadata | Status | Recent change | Time | Actions
```

- 默认行高 40px，必要时 44px。
- 文本与图标严格列对齐。
- Hover 只提升轻微 surface。
- Selected 使用 `surface-selected`，焦点另有 focus ring。
- 操作按钮默认弱化，hover/focus/selection 时显现。
- 整行可点击时，内部操作必须有正确事件和键盘处理。
- 虚拟化不得破坏 aria、焦点和选中项恢复。

### 8.4 Inspector

Inspector 是属性空间，不是第二个 Dashboard。

结构：

```text
Status
Primary properties
Relationships
Evidence / provenance
Secondary actions
```

- 属性标签在左，值在右；长内容可换行。
- Section 使用留白与必要 hairline，不套卡片。
- 不把每个值做成 Badge。
- 只显示当前对象必要信息，详情进入 Workspace。
- Overlay 关闭后焦点返回触发元素。

### 8.5 Metric Strip

多个相关指标使用连续横向条或属性列，不使用独立统计卡片。

每个指标必须包含：名称、值、单位或范围、必要的更新时间。趋势颜色按业务含义决定，不能机械使用“涨绿跌红”。

### 8.6 Activity Feed

Activity 表达事件历史，不是装饰性营销时间轴。

```text
Time
Event title
Concise change description
Actor / source
```

- 事件按时间与来源可核查。
- 类型图标使用中性色，风险事件才使用语义色。
- 不用贯穿全页的粗线和大量彩点。
- 新事件不得强制改变用户滚动位置。
- 相对时间可查看绝对时间。

### 8.7 Button

层级：Primary、Secondary、Ghost、Destructive。

- 每个页面通常只有一个主要动作区域。
- Primary 使用 accent 实色；不要铺满工具栏。
- Destructive 仅在危险动作确认位置使用。
- 图标按钮必须有 accessible name 和 Tooltip。
- Press 立即反馈，不依赖请求完成。
- Loading 不改变按钮宽度。

### 8.8 Input 与 Form

- Label 永久可见，placeholder 不替代 label。
- 帮助文字在输入前可理解，错误在输入后明确出现。
- Focus 使用清楚但克制的 accent ring。
- Disabled 与 readonly 必须视觉和语义区分。
- 表单提交错误优先内联，Toast 只做补充。
- OTP 只用于真实验证码流程，不创建假安全界面。

### 8.9 Command Menu

全局快捷键：`Cmd/Ctrl + K`。

分组：搜索、前往、当前对象操作、外观与设置。

- 支持完整键盘操作。
- 大数据使用服务端搜索，不把全库塞入客户端。
- 默认每组显示少量最佳结果。
- 选中项仅使用 surface 提升。
- 不使用大面积 blur、渐变或彩色图标。

### 8.10 Toast

只反馈用户主动动作：保存、复制、导出、撤销、失败和重试。

禁止：欢迎回来、页面加载成功、搜索成功、主题切换成功、打开详情成功。

同时展示不超过 3 个。可逆操作 SHOULD 提供撤销。

### 8.11 Dialog / Drawer / Popover

- 从触发位置或预期方向进入和退出。
- 支持 Esc、focus trap 和焦点恢复。
- 内容能内联完成时不使用 Dialog。
- 移动端优先 Drawer 或完整页面。
- 不使用大幅 scale 或 bounce。

### 8.12 Empty / Error / Stale

Empty state 说明“为什么为空”和“可以做什么”，不需要大型插画。

Error state 明确失败对象、可能范围和重试方式。过期数据必须显示最后成功更新时间，不能悄悄当成实时数据。

---

## 9. Motion System

### 9.1 原则

- Immediate：按下即反馈。
- Interruptible：动画可被新操作打断。
- Reversible：反向操作从当前视觉状态继续。
- Spatial：进出路径保持一致。
- Purposeful：动效解释变化，不装饰页面。
- Calm：默认无弹跳、无 overshoot。

### 9.2 Token

```css
--duration-instant: 0ms;
--duration-press: 90ms;
--duration-fast: 140ms;
--duration-normal: 180ms;
--duration-panel: 240ms;
--duration-drawer: 300ms;
--duration-number: 400ms;

--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
```

### 9.3 允许动画的属性

优先：`transform`、`opacity`。

谨慎：`background-color`、`border-color`、`color`、`box-shadow`。

避免：`width`、`height`、`top`、`left`，除非布局技术已避免持续重排。

禁止 `transition: all`。

### 9.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
  }
}
```

不要用全局 `0.01ms` 粗暴破坏所有必要状态。组件应提供明确替代：

- Panel slide 改为短 crossfade。
- NumberFlow 直接更新。
- 实时曲线减少插值或静态刷新。
- 拖放保留功能，缩短落位动画。
- 品牌动画显示静态标志。
- Loader 使用进度文字或静态进度条。

---

## 10. 数据可视化

图表是理解工具，不是页面装饰。

- 默认单序列或极少序列。
- 使用 1–1.5px 线宽。
- 无发光、粒子、shake 和强渐变填充。
- 网格默认无或非常弱。
- Hover 与键盘 focus 显示准确值。
- Canvas 图表必须有文本摘要或表格 fallback。
- 实时图表在不可见时降低更新频率。
- 必要时下采样，不能为了“实时感”牺牲性能。
- 颜色按语义和主题分别校准。

Number animation 只用于已有值真实变化。首次载入不得从 0 数到目标值；主题切换、Tab 切换和虚拟行重挂载不得重播。

---

## 11. AI Interaction Contract

### 11.1 AI 输出结构

重要 AI 结果 SHOULD 包含：

```text
Conclusion：当前建议或判断
Evidence：引用的数据、规则和来源
Uncertainty：未知、冲突或置信范围
Action：用户可执行、可预览的下一步
```

### 11.2 来源区分

界面必须明确区分：

- 用户输入
- 人工确认的属性
- 业务规则结果
- 原始外部数据
- AI 建议
- AI 已执行的动作

AI 不得把建议伪装成已确认事实。

### 11.3 Thinking 与进度

只有真实长任务才显示工作状态。状态应描述正在完成的阶段与耗时，不虚构“思维链”。可展示可审计的工具调用、检索来源和动作日志，但不得泄露不适合用户的内部推理文本。

### 11.4 自动化

- 高影响动作默认人工确认。
- 可按动作类别逐步授权自动执行。
- 用户随时能查看自动化范围与历史。
- 每个动作有 actor、time、input、result 和 rollback 状态。
- AI 信心不足时应请求信息或降低自动化级别。

### 11.5 AI 面板

AI 不默认常驻占据主工作区。优先使用上下文入口、侧面板或对象内模块。只有 AI 是核心任务时才成为主视图。

没有真实 AI 后端时，不显示假聊天框、假回答或假思考动画。

---

## 12. 第三方组件策略

第三方库提供行为，不提供最终视觉。所有组件必须重新绑定 KIN Token。

### Core candidates

- `cmdk`：全局命令与搜索。
- `Virtuoso`：真实大数据长列表与持续事件流。
- `Sonner`：用户主动操作反馈。

### Conditional candidates

- `NumberFlow`：少量关键数值变化。
- `Liveline`：小型实时趋势。
- `dnd kit`：收藏、对比、规则与证据排序。
- `input-otp`：已接入真实后端的安全流程。

### Development only

- `Leva`：开发环境调节密度、列宽、对比度和动效；生产入口必须排除。

### Brand / exceptional tasks

- `Pixel2Motion`：品牌 reveal；核心产品稳定后评估。
- Math curve loader：仅真实长任务，并显示阶段与进度。

### Not in core workspace

- `ICONIC` 或其他品牌 Logo 图标集不得进入 Sidebar、状态系统、表格、Inspector 和 Command Menu。

引入依赖前必须检查现有等价能力、包体、SSR/hydration、可访问性、维护状态和按需加载方式。

---

## 13. 产品扩展

每类产品的完整任务模型、状态、结构、禁止项和验收条件分别记录在：

- [`patterns/information-site.md`](./patterns/information-site.md)
- [`patterns/intelligence-workspace.md`](./patterns/intelligence-workspace.md)
- [`patterns/ecommerce-operations.md`](./patterns/ecommerce-operations.md)
- [`patterns/engineering-canvas.md`](./patterns/engineering-canvas.md)

### 13.0 Information Site

核心对象：文章、记录、主题、来源、作者、修订和集合。

信息网站优先解决查找、阅读、验证、引用和返回。公开内容必须保留稳定 URL、语义标题、来源、更新时间、搜索索引和必要的修订历史；不得用营销 Hero、等宽卡片墙或无来源 AI 摘要替代信息结构。

### 13.1 Intelligence Workspace

核心对象：服务商、域名、频道、风险信号、证据、监测任务。

额外语义：

- Risk：风险等级与影响。
- Evidence：来源、可信度与冲突。
- Monitor：在线、检测和更新时间。
- Relationship：关联域名、频道和实体。

默认视图：高密度列表、Split view、对象档案、Activity、Inspector。

### 13.2 Ecommerce Workspace

核心对象：商品、素材、渠道、活动、库存、订单、工作流、Agent run。

额外语义：

- Inventory health：库存健康，不等于任务状态。
- Commerce delta：价格、转化和库存变化按业务含义着色。
- Creative provenance：素材来源、版本、授权与 AI 生成记录。
- Approval：草稿、待审、批准、发布和回滚。

工作台可共享同一 App Shell、主题、表格、Inspector、Activity 和 Command Layer，但不能复制代理情报字段或风险模型。

### 13.3 Engineering / CAD Workspace

核心对象：文件、模型、图层、构件、版本、仿真、评审。

Canvas 是主工作区；Sidebar 与 Inspector 服务画布，不与画布竞争。选择、测量、版本与约束必须精确，动效不能妨碍空间判断。

---

## 14. Anti-Slop Contract

以下模式默认禁止：

- 蓝紫或青紫渐变背景
- 渐变文字
- AI glow、发光边框、发光状态点
- 大面积 glassmorphism
- Card within card
- 巨型弥散阴影
- `rounded-xl` everywhere
- Pill badge spam
- 彩色图标砖
- 每个模块都带图标、标题、描述和按钮
- 三张等宽营销卡作为默认布局
- 巨型 Hero 进入产品工作台
- 装饰性编号 `01 / 02 / 03`
- Emoji 与 sparkle 表达 AI
- 无意义终端代码、扫描线、网格背景
- 所有 hover 上浮、缩放或弹跳
- 页面整体淡入
- 无限循环装饰动画
- 编造指标、实时状态、客户 Logo 或用户评价
- “不只是 X，而是 Y”等模板化 AI 文案
- “智能、极速、专业、安全”且没有证据的形容词

出现例外时，必须记录它传递的具体信息，以及为何更克制的方案无法完成任务。

---

## 15. Accessibility Contract

所有核心流程 MUST 支持：

- 完整键盘操作与合理 Tab 顺序
- 清楚的 `:focus-visible`
- Esc 关闭浮层，关闭后焦点恢复
- `aria-current`、`aria-selected`、`aria-expanded`
- Dialog focus trap
- 导航与 Main landmarks
- 状态不只依赖颜色
- Tooltip 可由键盘触发
- 图表文本替代
- DnD 键盘操作与读屏反馈
- OTP label、错误与 autocomplete
- 44×44px 触控命中区域
- 200% 缩放下不丢失内容和功能

快捷键必须在输入框、编辑器和组合输入状态中暂停或正确处理。

---

## 16. Theme Contract

必须支持：`light`、`dark`、`system`。

- 首次访问默认 `system`。
- 用户选择持久化。
- 多标签页同步。
- system 模式实时响应系统变化。
- hydration 前设置 `html[data-theme]`，避免闪白。
- 同步 `color-scheme`。
- 主题切换不重建应用树、不重播数字、不清空图表。
- 首次加载不播放主题 transition。
- 只过渡背景、边界、文字和必要阴影，150–200ms。
- reduced motion 下立即切换。
- reduced transparency 下浮层使用实色。

所有基础组件必须同时验证两种主题；不得只完成首页主题。

---

## 17. 性能与工程合同

- 服务端渲染项目应保留服务端边界，交互组件叶子化。
- 不将整个 App Shell 无理由变成 client component。
- 图表、AI、Leva、OTP 和品牌动画按需加载。
- 不引入多个重叠动画或图标库。
- 虚拟列表使用稳定 key，恢复滚动与选择。
- Inspector 打开不应导致整页重渲染。
- 实时数据更新应批处理或限频。
- Skeleton 使用真实布局轮廓，不使用强 shimmer。
- 所有新增依赖记录用途、版本、包体与替代方案。

目标：LCP < 2.5s、INP < 200ms、CLS < 0.1；必须报告真实测量环境，不得伪造结果。

---

## 18. 内容设计

文案必须简洁、客观、可核查。

推荐：

- `最近一次检测失败`
- `数据不足，暂无法判断`
- `最后更新于 2 分钟前`
- `证据存在冲突`

不推荐：

- `系统正在全力守护您的安全`
- `暂无数据，敬请期待更多精彩内容`
- `实时`（没有更新时间）
- `AI 已为你智能完成一切`

危险或争议性判断使用客观语言，并显示证据与审核状态。

---

## 19. 质量门禁

### 19.1 视觉

- 当前任务是否是最清楚的视觉中心？
- Sidebar 和辅助 chrome 是否主动退后？
- 是否可以移除更多边线、图标、Badge 或容器？
- 是否依赖阴影、渐变或颜色制造层级？
- 日间是否变成白卡片墙？
- 夜间是否变成纯黑霓虹大屏？
- 中文小字是否清晰、紧凑但不拥挤？

### 19.2 产品

- 用户是否知道当前位置、当前对象和下一步？
- 关键数据是否有定义、单位、来源和时间？
- AI 建议是否和事实区分？
- 高影响动作是否可确认、撤销或审计？
- 空、错、部分、过期和无权限状态是否完整？

### 19.3 交互与可访问性

- Mouse、Keyboard、Touch 是否都可完成核心任务？
- Focus 是否清楚且不被遮挡？
- reduced motion / transparency / contrast 是否有效？
- 浮层焦点是否正确恢复？
- 快捷键是否避开输入状态？

### 19.4 工程

- 是否复用已有组件与 Token？
- 是否新增了无必要依赖？
- 是否保留 SSR、SEO、权限和真实 API？
- 是否通过 lint、typecheck、test、build？
- 是否有可回滚的阶段性提交？

---

## 20. 推荐交付流程

1. Audit：业务、路由、数据、组件、主题和视觉基线。
2. Foundations：Token、Typography、Theme、Focus、Motion。
3. Shell：Sidebar、Chrome、Workspace、Inspector、响应式。
4. Core flow：先完成一个真实对象的列表—详情—操作闭环。
5. Stress test：用长名称、缺失数据、冲突状态、极端数量和小屏测试。
6. Behavior definition：记录 Sidebar、Header、View Bar、Inspector 和浮层行为。
7. Feature flag：与旧版并行比较。
8. Incremental rollout：逐模块迁移，不一次复制模板。
9. Quality audit：视觉、可访问性、性能、Anti-Slop。
10. Removal：新版本功能对等且稳定后再删除旧实现。

每阶段结束必须汇报：决策、文件、依赖、截图、测试、已知问题、偏离与回滚方式，然后停止等待批准。

---

## 21. 来源与原创边界

KIN 是独立设计系统，不是 Linear 克隆。

本规范受到以下公开思想启发：

- Linear 对低噪音、高密度、精确对齐、稳定操作位置、柔和结构和主题生成的公开设计讨论。
- Apple 平台对直接操控、空间连续性、可中断动效和辅助偏好的通用原则。
- Anti-AI-Slop 社区对模板化生成界面的批评。
- DESIGN.md 社区面向编码 Agent 的结构化文档实践。

不得复制或暗示隶属关系：

- Linear Logo、wordmark、品牌资产或私有图标。
- Linear 私有字体或未授权字体。
- Linear 专有业务命名、页面布局或源代码。
- 第三方 DESIGN.md 中未经验证的“唯一正确”数值声明。

KIN 的 Token、业务扩展、AI 合同和组件行为必须根据自身产品验证并持续演进。

---

## 22. 最小 Agent 提示词

```md
Read DESIGN.md completely before changing UI.

Treat it as a normative product design contract. Start from the real user task,
entity model, data states, and existing components. Keep the workspace calm,
dense, keyboard-friendly, evidence-aware, and human-controlled.

Classify the work as build, redesign-preserve, redesign-overhaul, audit, or
review. State the primary surface, user task, constraints, and source of truth.
Do not silently change routes, data meaning, permissions, analytics, brand
assets, or public API behavior.

Do not create card walls, gradients, glow, decorative AI visuals, fake metrics,
or unnecessary dependencies. Use semantic tokens, preserve light/dark/system,
mobile, accessibility, reduced motion, SSR, SEO, permissions, and real APIs.

Before coding, report the current structure, reusable parts, proposed changes,
risks, and verification plan. Verify real content and states, light/dark themes,
desktop/mobile, keyboard, focus, and reduced motion. Inspect rendered screenshots
when the project can run. Report commands, evidence, deviations, known issues,
and rollback. After each approved phase, stop for review.
```

---

## 23. Tooling and adoption contract

接入项目 MUST 固定一个经过评审的 KIN 精确版本，并在项目内保留可离线读取的合同副本。项目自己的品牌决定、组件映射、Token 路径、验证命令和例外写入 `kin.config.json` 或等价记录，不得反向修改共享规范来掩盖局部差异。

KIN 的机器输出分为三层：

1. `kin.tokens.json` 与 `kin.tailwind.css`：从规范 Token 生成的互操作文件。
2. `kin.figma.variables.json`：面向 Figma Variables REST API 的 create-only 请求体；不包含凭据，不负责同步既有 ID。
3. `audit-project.mjs`：只读静态候选扫描；输出位置、严重度和复核提示，不自动修改代码。

工具结果不得越过以下边界：

- 正则命中不是视觉缺陷的证明，必须结合源码上下文和渲染界面复核。
- 自动评分不能替代完整的产品、无障碍、交互和视觉评审。
- P2/P3 审美候选默认不作为自动失败条件；P1 仍需人工确认后才能阻断发布。
- 例外必须记录规则、路径、具体理由和责任人或评审上下文；不得使用空泛的“品牌需要”。
- 设计工具导入前必须检查模式映射、别名、现有变量 ID、字体可用性和回滚方式。
- 接入脚本不得安装依赖、改变路由、覆盖现有文件或批量修复产品代码，除非用户明确批准对应操作。

产品升级 KIN 时，必须同时检查配置版本、合同版本、生成 Token、项目主题适配和视觉回归。只有文档版本号变化不算完成迁移。

---

## 24. Versioning

- Patch：澄清规则、修正 Token 或补充示例，不改变组件行为。
- Minor：新增组件、模式或产品扩展，向后兼容。
- Major：改变核心哲学、语义 Token、主题模型、交互合同或接入合同。

所有规则变更必须记录：问题、证据、受影响产品、迁移方式和视觉回归范围。

KIN 的目标不是永远保持相同外观，而是在产品复杂度增长时持续删减噪音，让结构更一致，让重要内容更容易被看见。
