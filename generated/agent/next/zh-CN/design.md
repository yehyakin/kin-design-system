---
kind: "kin-agent-design"
schema_version: "1.0.0"
schema_locator: "schemas/snapshot.schema.json"
generated: true
normative: false
artifact_status: "generated-derivative"
editable: false
publication:
  state: "repository-only"
  published: false
  public_locators: "reserved-for-phase-2"
kin_version: "3.0.0"
release_status: "development"
latest_stable_contract: "2.3.0"
channel: "next"
locale: "zh-CN"
direction: "ltr"
theme: "light"
contrast: "normal"
coverage: "compact-foundations-and-routing"
features:
  component_recipes: "unavailable"
locale_review:
  status: "unreviewed"
  reviewers: []
  normative_source_checksum: "28d428a4429c45b5bcc6dc4cfddfd97682ef2f6a2b0297852954be1c247c4fe2"
  localized_content_checksum: "5ce67d168f77941fa5cf023d00f72ffcbc0235a0fcf13c2af5a34fcf93cd2bc2"
source:
  contract_path: "DESIGN.md"
  checksum_algorithm: "sha256"
  checksum: "75e62f81a34d95dd9efbb36a32ad672c9d13e413ca8910992a3ea9de286c3a6d"
  input_set_checksum: "4762b422a910fa772de56a0fbc8d14660f870c947510714d68af1f6f38b5867a"
  ref: "main"
  revision_status: "mutable"
manifest_locator: "design-manifest.json"
full_contract_path: "DESIGN.md"
visual_signature_path: "principles/visual-signature.md"
delivery_contract_path: "DELIVERY.md"
product_profiles:
  - "information-site"
  - "intelligence-workspace"
  - "ecommerce-operations"
  - "engineering-canvas"
rules:
  -
    id: "snapshot-source-boundary"
    level: "must"
    source_path: "DELIVERY.md"
    source_heading: "Current decision"
  -
    id: "task-before-explanation"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "1. The task appears before the explanation"
  -
    id: "one-dominant-region"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "2. One region owns attention"
  -
    id: "neutral-precise-emphasis"
    level: "should"
    source_path: "principles/visual-signature.md"
    source_heading: "5. Neutral structure, precise emphasis"
  -
    id: "typography-supports-hierarchy"
    level: "must"
    source_path: "DESIGN.md"
    source_heading: "4.3 排版规则"
  -
    id: "density-removes-repetition"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "4. Density removes repetition"
  -
    id: "continuous-structure"
    level: "should"
    source_path: "principles/visual-signature.md"
    source_heading: "3. Structure is continuous"
  -
    id: "motion-explains-change"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "7. Motion explains change"
  -
    id: "semantics-remain-separate"
    level: "must"
    source_path: "principles/visual-signature.md"
    source_heading: "6. Semantics remain separate"
  -
    id: "route-by-product-profile"
    level: "must"
    source_path: "DELIVERY.md"
    source_heading: "What may be consumed directly"
  -
    id: "delivery-is-not-adoption"
    level: "must-not"
    source_path: "principles/visual-signature.md"
    source_heading: "Adoption claims"
colors:
  canvas: "#f6f7f8"
  sidebar: "#f0f1f3"
  surface-1: "#ffffff"
  surface-2: "#f4f5f6"
  surface-3: "#eceef0"
  surface-4: "#e4e6e9"
  surface-hover: "#14161a0b"
  surface-selected: "#525ec41a"
  surface-overlay: "#f6f7f8c2"
  text-primary: "#18191c"
  text-secondary: "#494c53"
  text-muted: "#6b7079"
  text-disabled: "#a1a5ad"
  text-inverse: "#f7f8fa"
  icon-primary: "#3f4248"
  icon-muted: "#7d828b"
  line-subtle: "#14161a0f"
  line-default: "#14161a1a"
  line-strong: "#14161a2b"
  accent: "#5360c5"
  accent-hover: "#4653b7"
  accent-active: "#3e4aa6"
  accent-soft: "#5360c51a"
  focus-ring: "#4958c49e"
  monitor: "#167f8d"
  monitor-soft: "#167f8d17"
  positive: "#247b56"
  warning: "#8e650f"
  negative: "#a94838"
  critical: "#b23749"
  offline: "#6f747d"
typography:
  body:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "14px"
    font_weight: 400
    line_height: 22
    letter_spacing: "0em"
  display:
    font_family: "Inter, Geist, \"SF Pro Display\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "32px"
    font_weight: 600
    line_height: 38
    letter_spacing: "-0.02em"
  entity-title:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "18px"
    font_weight: 600
    line_height: 24
    letter_spacing: "-0.01em"
  metadata:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "12px"
    font_weight: 400
    line_height: 17
    letter_spacing: "0em"
  micro:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "11px"
    font_weight: 500
    line_height: 15
    letter_spacing: "0em"
  mono:
    font_family: "\"Geist Mono\", \"JetBrains Mono\", \"SFMono-Regular\", Consolas, monospace"
    font_size: "12px"
    font_weight: 450
    line_height: 18
    letter_spacing: "0em"
  page-title:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "20px"
    font_weight: 600
    line_height: 26
    letter_spacing: "-0.01em"
  section-title:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "14px"
    font_weight: 600
    line_height: 20
    letter_spacing: "0em"
  ui:
    font_family: "Inter, Geist, \"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif"
    font_size: "13px"
    font_weight: 500
    line_height: 18
    letter_spacing: "0em"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
rounded:
  lg: "10px"
  md: "7px"
  round: "999px"
  sm: "5px"
  xl: "14px"
  xs: "3px"
motion:
  duration-drawer: "300ms"
  duration-fast: "140ms"
  duration-instant: "0ms"
  duration-normal: "180ms"
  duration-number: "400ms"
  duration-panel: "240ms"
  duration-press: "90ms"
  ease-enter: "cubic-bezier(0.16, 1, 0.3, 1)"
  ease-exit: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-standard: "cubic-bezier(0.2, 0, 0, 1)"
component_recipes: null
---

# KIN Agent 设计快照

> 生成衍生文件。修改规范行为或交付边界时，必须阅读完整合同。

## 状态与来源

- 这份精简文件由当前 KIN 合同生成。它不是规范来源、不得直接编辑，也不能替代所链接的完整文档。
- 合同校验和: `75e62f81a34d95dd9efbb36a32ad672c9d13e413ca8910992a3ea9de286c3a6d`
- 已解析模式: `light` / `normal`
- 本地化文案审核: `unreviewed`
- 发布状态: `repository-only`; 公开地址仅为预留，Phase 1 尚未上线

## 视觉基调

- 第一有效视图先呈现用户要使用的对象、任务、搜索、列表、文档或操作。
- 每个状态只有一个主导工作或阅读区域；完成定位后，导航、元数据和次要界面应退后。

## 主题使用

- 大部分结构保持中性，只用一个主要交互强调色表达焦点、选择、链接和主要操作。
- 将 color-scheme 设置为当前主题，并在产品中保留亮色、暗色、跟随系统和高对比度行为。

## 字体角色

- 用字体角色建立层级；界面文字保持紧凑，正文保持可读，需要比较的数字使用等宽数字。

| 角色 | 解析值 |
|---|---|
| `body` | 14px / 400 / 22 |
| `display` | 32px / 600 / 38 |
| `entity-title` | 18px / 600 / 24 |
| `metadata` | 12px / 400 / 17 |
| `micro` | 11px / 500 / 15 |
| `mono` | 12px / 450 / 18 |
| `page-title` | 20px / 600 / 26 |
| `section-title` | 14px / 600 / 20 |
| `ui` | 13px / 500 / 18 |

## 布局与密度

- 对齐重复值和操作，用共享列或分组控件承载共同含义，用留白说明优先级。

## 表面与层级

- 先用对齐、节奏、列、属性行、分隔线和细微表面差建立层级，再考虑增加容器。

## 动效

- 动效用于保留来源、方向、状态连续性和提交结果；可逆交互从当前视觉状态继续。

## 内容规则

- 只要产品有所区分，状态、风险、置信度、完整度、可用性、权限和进度就必须保持独立。

## 应当

- 先用它确定主题模式、产品类型和首轮约束，再按任务打开详细合同。
- 让真实内容和用户任务决定构图。
- 用视觉权重让下一项有用操作清楚可见。
- 让语义颜色始终对应各自独立的产品含义。
- 把命名角色映射到产品可用字体，不分发私有字体。
- 比较型数据行保持紧凑，同时保留要求的命中区域。
- 只有独立对象、浮层、选中上下文或任务模式等真实边界才使用 Surface。
- 动效保持可中断；减少动态效果时仍保留相同终态和层级。
- 除了颜色，还要用文字或符号表达含义；关键数据要显示来源和时间。
- 混合产品按路由族选择类型，并保留用户要求与产品事实。
- 声明接入前，记录明确范围、真实状态、可比截图、人工评审、例外、责任人和回滚。

## 不要

- 不要把生成文件、通过的检查或主题化组件展示当成产品已经接入 KIN 的证据。
- 不要在工作任务之前放营销 Hero、泛化价值主张或装饰图表。
- 不要因为有网格，就让无关面板拥有相同视觉权重。
- 不要用颜色、徽标、图标或动效弥补内容顺序和对齐问题。
- 不要为了模仿其他产品而放大标题或过度压缩中文字符间距。
- 不要在每一行重复标签和帮助文字，也不要用大片空白掩盖未解决的构图。
- 不要默认把正文、元数据、活动、属性组、筛选器和表格区域做成嵌套卡片。
- 不要用反复抬升、自动计数、整页淡入或装饰性入场制造完成感。
- 不要把不同判断折叠成一个好看的分数、徽标或缺乏依据的结论。
- 不要把一种工作台布局套给所有路由，也不要让任务意图提示覆盖本地要求。
- 不要根据这份快照、通过的生成器或孤立的样式组件推断生产接入。

## 任务与产品类型路由

- 根据真实路由和任务选择产品类型，修改构图前打开对应的详细模式合同。

| 产品类型 | 任务意图 | 详细合同 |
|---|---|---|
| `information-site` | `find`, `read`, `verify`, `cite` | `patterns/information-site.md` |
| `intelligence-workspace` | `inspect`, `monitor`, `investigate`, `verify`, `decide` | `patterns/intelligence-workspace.md` |
| `ecommerce-operations` | `operate`, `compare`, `approve`, `recover` | `patterns/ecommerce-operations.md` |
| `engineering-canvas` | `create`, `select`, `inspect`, `modify`, `compare`, `undo` | `patterns/engineering-canvas.md` |

## 验证与接入边界

- 生成快照、Token 一致、构建通过和组件参考都只是交付证据，不能证明产品已经具备可见或完整的 KIN 接入。
