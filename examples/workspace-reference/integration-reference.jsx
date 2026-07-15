import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Check,
  ChevronDown,
  Command as CommandIcon,
  GripVertical,
  Languages,
  Monitor,
  Moon,
  PanelLeft,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sun,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import { KinToaster, kinToast } from "@kin-design/react/sonner";

const AnimatedMetric = React.lazy(() => import("@kin-design/react/experimental/number-flow").then((module) => ({ default: module.AnimatedMetric })));
const KinCommandMenu = React.lazy(() => import("@kin-design/react/cmdk").then((module) => ({ default: module.KinCommandMenu })));
const KinVirtualList = React.lazy(() => import("@kin-design/react/virtuoso").then((module) => ({ default: module.KinVirtualList })));
const KinSortableList = React.lazy(() => import("@kin-design/react/experimental/dnd-kit").then((module) => ({ default: module.KinSortableList })));
const KinOTPInput = React.lazy(() => import("@kin-design/react/experimental/input-otp").then((module) => ({ default: module.KinOTPInput })));
const KinLiveChart = React.lazy(() => import("@kin-design/react/experimental/liveline").then((module) => ({ default: module.KinLiveChart })));

const copy = {
  zh: {
    back: "工作台",
    themeToLight: "切换为日间模式",
    themeToDark: "切换为夜间模式",
    appearance: "外观选项",
    light: "日间",
    dark: "夜间",
    system: "跟随系统",
    language: "切换语言",
    eyebrow: "直接使用官方运行时",
    title: "第三方能力成为 KIN 的一部分",
    intro: "以下交互直接运行官方包。KIN 统一语义、Token、主题和验收边界，不重写成熟项目的动效与核心引擎。",
    statusTitle: "集成状态",
    statusBody: "“运行时集成”要求依赖、KIN API、可操作示例和自动化证据同时存在。",
    package: "官方包",
    api: "KIN API",
    evidence: "当前证据",
    live: "已运行",
    devOnly: "仅开发环境",
    loadingRuntime: "正在载入官方运行时…",
    sonnerTitle: "操作反馈",
    sonnerBody: "Sonner 保留原生堆叠、更新、关闭和手势动效；KIN 只约束何时通知以及如何表达恢复。",
    save: "保存视图",
    undo: "移出关注列表",
    export: "创建导出任务",
    saved: "视图已保存",
    removed: "已移出关注列表",
    undoLabel: "撤销",
    restored: "已恢复关注",
    exporting: "正在创建导出任务",
    exported: "导出任务已创建",
    exportFailed: "导出任务创建失败",
    failedDescription: "导出服务暂时没有响应。",
    retry: "重试",
    retryQueued: "已重新提交导出任务",
    error: "模拟失败与重试",
    toastPosition: "通知位置",
    toastDirection: "阅读方向",
    directionLtr: "从左到右",
    directionRtl: "从右到左",
    toastPositions: {
      "top-left": "左上",
      "top-center": "顶部居中",
      "top-right": "右上",
      "bottom-left": "左下",
      "bottom-center": "底部居中",
      "bottom-right": "右下",
    },
    numberTitle: "数值连续性",
    numberBody: "NumberFlow 只在已有值真实变化时运行；首次渲染、主题切换和 Reduced Motion 不制造计数动画。",
    sample: "记录下一组样本",
    availability: "可用率",
    latency: "平均延迟",
    events: "新增事件",
    commandTitle: "命令与搜索",
    commandBody: "cmdk 负责组合、筛选、选中和焦点；KIN 保持键盘调用即时、分组清楚并恢复焦点。",
    openCommand: "打开命令菜单",
    commandLabel: "KIN 命令菜单",
    commandInput: "搜索命令",
    commandPlaceholder: "搜索页面或操作…",
    noResults: "没有匹配结果",
    navigate: "前往",
    actions: "操作",
    virtualTitle: "长列表",
    virtualBody: "React Virtuoso 维护真实虚拟化与滚动测量；J、K 或方向键移动当前项。",
    listLabel: "虚拟化对象列表",
    sortableTitle: "可控排序",
    sortableBody: "dnd kit 保留指针、触控、键盘传感器和 Drop 动效；拖动只发生在专用手柄。",
    sortWatch: "关注列表",
    sortReview: "待复核",
    sortRecent: "最近变化",
    sortSaved: "已保存查询",
    reorder: "调整顺序：",
    dragInstructions: "按空格键拿起项目，使用方向键移动，再按空格键放下；按 Esc 取消。",
    dragPicked: "已拿起",
    dragOver: "移动到",
    dragPlaced: "已放到",
    dragReturned: "已回到原位置",
    otpTitle: "验证码输入",
    otpBody: "input-otp 负责粘贴、自动填充和焦点行为。本地样例不发送、不验证也不记录验证码。",
    otpLabel: "六位验证码",
    otpDescription: "本地输入夹具 · 不连接认证服务",
    chartTitle: "实时趋势",
    chartBody: "Liveline 保留 Canvas 实时插值；KIN 关闭粒子、发光和娱乐化效果，并提供文字摘要与数据表。",
    chartSummary: "过去 12 个样本的延迟在 82–126ms 之间；当前值为 94ms。",
    viewData: "查看数据表",
    time: "时间",
    latencyValue: "延迟（ms）",
    boundaryTitle: "边界",
    boundaryBody: "Leva 已有真实适配入口，但只允许通过 @kin-design/react/dev/leva 在开发构建中加载；公开展示页不会打包它。",
  },
  en: {
    back: "Workspace",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
    appearance: "Appearance options",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Change language",
    eyebrow: "Official runtimes, directly integrated",
    title: "Third-party strengths become part of KIN",
    intro: "Every interaction below runs the official package. KIN owns semantics, Tokens, themes, and acceptance boundaries without rewriting mature motion or core engines.",
    statusTitle: "Integration status",
    statusBody: "Runtime integration requires a dependency, KIN API, operable example, and automated evidence together.",
    package: "Official package",
    api: "KIN API",
    evidence: "Current evidence",
    live: "Running",
    devOnly: "Development only",
    loadingRuntime: "Loading official runtime…",
    sonnerTitle: "Action feedback",
    sonnerBody: "Sonner keeps its native stacking, updates, dismissal, and gesture motion. KIN governs when feedback appears and how recovery is expressed.",
    save: "Save view",
    undo: "Remove from watchlist",
    export: "Create export task",
    saved: "View saved",
    removed: "Removed from watchlist",
    undoLabel: "Undo",
    restored: "Watch restored",
    exporting: "Creating export task",
    exported: "Export task created",
    exportFailed: "Export task failed",
    failedDescription: "The export service did not respond.",
    retry: "Retry",
    retryQueued: "Export task submitted again",
    error: "Simulate failure and retry",
    toastPosition: "Notification position",
    toastDirection: "Reading direction",
    directionLtr: "Left to right",
    directionRtl: "Right to left",
    toastPositions: {
      "top-left": "Top left",
      "top-center": "Top center",
      "top-right": "Top right",
      "bottom-left": "Bottom left",
      "bottom-center": "Bottom center",
      "bottom-right": "Bottom right",
    },
    numberTitle: "Numeric continuity",
    numberBody: "NumberFlow runs only when an existing value truly changes. First render, theme changes, and Reduced Motion never manufacture counting.",
    sample: "Record next sample",
    availability: "Availability",
    latency: "Average latency",
    events: "New events",
    commandTitle: "Commands and search",
    commandBody: "cmdk owns composition, filtering, selection, and focus. KIN keeps keyboard invocation immediate, groups legible, and focus restoration intact.",
    openCommand: "Open command menu",
    commandLabel: "KIN command menu",
    commandInput: "Search commands",
    commandPlaceholder: "Search pages or actions…",
    noResults: "No matching results",
    navigate: "Go to",
    actions: "Actions",
    virtualTitle: "Long lists",
    virtualBody: "React Virtuoso retains real virtualization and scroll measurement. Use J, K, or arrow keys to move the active item.",
    listLabel: "Virtualized entity list",
    sortableTitle: "Controlled ordering",
    sortableBody: "dnd kit keeps pointer, touch, keyboard sensors, and drop motion. Drag starts only from the dedicated handle.",
    sortWatch: "Watchlist",
    sortReview: "Needs review",
    sortRecent: "Recently changed",
    sortSaved: "Saved queries",
    reorder: "Reorder: ",
    dragInstructions: "Press Space to pick up an item, use the arrow keys to move it, then press Space to drop it. Press Escape to cancel.",
    dragPicked: "Picked up",
    dragOver: "moved over",
    dragPlaced: "placed at",
    dragReturned: "returned to its original position",
    otpTitle: "Verification-code input",
    otpBody: "input-otp owns paste, autofill, and focus behavior. The local fixture does not send, verify, or record a code.",
    otpLabel: "Six-digit verification code",
    otpDescription: "Local input fixture · no authentication service",
    chartTitle: "Live trend",
    chartBody: "Liveline keeps its Canvas interpolation. KIN disables particles, glow, and entertainment effects, then provides a text summary and data table.",
    chartSummary: "Latency ranged from 82–126ms across the last 12 samples; the current value is 94ms.",
    viewData: "View data table",
    time: "Time",
    latencyValue: "Latency (ms)",
    boundaryTitle: "Boundary",
    boundaryBody: "Leva has a real adapter entry, but it may load only through @kin-design/react/dev/leva in development builds. The public showcase does not bundle it.",
  },
};

const metricSamples = [
  { availability: 98.7, latency: 428, events: 26 },
  { availability: 99.1, latency: 312, events: 28 },
  { availability: 98.9, latency: 346, events: 31 },
];

const chartEnd = Date.now() / 1_000;
const chartData = [126, 118, 121, 109, 103, 98, 101, 92, 88, 82, 91, 94].map((value, index) => ({
  time: chartEnd - (11 - index) * 5,
  value,
}));

const listItems = Array.from({ length: 1000 }, (_, index) => ({
  id: `ENT-${String(index + 1).padStart(4, "0")}`,
  name: `Reference object ${index + 1}`,
  state: index % 9 === 0 ? "Review" : "Available",
}));

const toastPositions = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];

const IconButton = React.forwardRef(function IconButton({ label, className = "", children, ...props }, ref) {
  return <button ref={ref} type="button" className={`icon-only-control ${className}`.trim()} aria-label={label} {...props}>{children}</button>;
});

function PreferenceMenu({ action, label, value, items, onSelect, children, className = "" }) {
  const [state, setState] = React.useState("closed");
  const stateRef = React.useRef("closed");
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const openFrameRef = React.useRef(null);
  const closeTimerRef = React.useRef(null);
  const restoreFocusRef = React.useRef(false);
  const reducedMotionRef = React.useRef(matchMedia("(prefers-reduced-motion: reduce)"));
  const expanded = state === "opening" || state === "open";

  const commitState = React.useCallback((nextState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const cancelPendingWork = React.useCallback(() => {
    if (openFrameRef.current !== null) cancelAnimationFrame(openFrameRef.current);
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    openFrameRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const openMenu = React.useCallback(() => {
    cancelPendingWork();
    restoreFocusRef.current = false;
    menuRef.current?.removeAttribute("inert");
    commitState("opening");
    openFrameRef.current = requestAnimationFrame(() => {
      openFrameRef.current = null;
      if (stateRef.current !== "opening") return;
      commitState("open");
      menuRef.current?.querySelector('[aria-checked="true"]')?.focus();
    });
  }, [cancelPendingWork, commitState]);

  const closeMenu = React.useCallback((restoreFocus = false) => {
    cancelPendingWork();
    restoreFocusRef.current = restoreFocusRef.current || restoreFocus;
    if (stateRef.current === "closed") {
      if (restoreFocusRef.current) triggerRef.current?.focus();
      restoreFocusRef.current = false;
      return;
    }
    if (menuRef.current) menuRef.current.inert = true;
    commitState("closing");
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      if (stateRef.current !== "closing") return;
      commitState("closed");
      if (menuRef.current) menuRef.current.inert = false;
      if (restoreFocusRef.current) triggerRef.current?.focus();
      restoreFocusRef.current = false;
    }, reducedMotionRef.current.matches ? 90 : 170);
  }, [cancelPendingWork, commitState]);

  React.useEffect(() => {
    if (!expanded) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) closeMenu(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [closeMenu, expanded]);

  React.useEffect(() => () => cancelPendingWork(), [cancelPendingWork]);

  const onMenuKeyDown = (event) => {
    const menuItems = [...menuRef.current.querySelectorAll('[role="menuitemradio"]')];
    const currentIndex = menuItems.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % menuItems.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = menuItems.length - 1;
    menuItems[nextIndex]?.focus();
  };

  return (
    <div ref={rootRef} className={`language-control integration-preference-menu-root ${className}`.trim()}>
      <IconButton
        ref={triggerRef}
        data-integration-action={action}
        label={label}
        aria-haspopup="menu"
        aria-expanded={expanded}
        onClick={() => (expanded ? closeMenu(false) : openMenu())}
      >
        {children}
      </IconButton>
      <div
        ref={menuRef}
        className="language-menu integration-preference-menu"
        role="menu"
        aria-label={label}
        data-state={state}
        hidden={state === "closed"}
        onKeyDown={onMenuKeyDown}
      >
        {items.map((item) => {
          const selected = item.value === value;
          const ItemIcon = item.icon;
          return (
            <button
              key={item.value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              aria-current={selected ? "true" : undefined}
              data-preference-value={item.value}
              onClick={() => {
                onSelect(item.value);
                closeMenu(true);
              }}
            >
              <span className="preference-icon-slot" aria-hidden="true">
                {ItemIcon ? <ItemIcon className="preference-leading-icon" size={14} /> : null}
              </span>
              <span>{item.label}</span>
              <Check className="preference-check" size={14} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ id, title, body, source, children }) {
  return (
    <section id={id} className="integration-section" aria-labelledby={`${id}-title`}>
      <header className="reference-section-heading">
        <div><h2 id={`${id}-title`}>{title}</h2><p>{body}</p></div>
        {source ? <a href={source.href} target="_blank" rel="noreferrer">{source.label}</a> : null}
      </header>
      {children}
    </section>
  );
}

function LazyMount({ label, force = false, children }) {
  const rootRef = React.useRef(null);
  const [visible, setVisible] = React.useState(force);

  React.useEffect(() => {
    if (force) {
      setVisible(true);
      return undefined;
    }
    const node = rootRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "180px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [force]);

  return (
    <div ref={rootRef} className="integration-lazy-boundary" data-runtime-ready={visible || undefined}>
      {visible ? <React.Suspense fallback={<p className="integration-runtime-loading" role="status">{label}</p>}>{children}</React.Suspense> : <p className="integration-runtime-loading" aria-hidden="true">{label}</p>}
    </div>
  );
}

function App() {
  const commandTriggerRef = React.useRef(null);
  const systemTheme = React.useMemo(() => matchMedia("(prefers-color-scheme: dark)"), []);
  const [locale, setLocale] = React.useState(() => localStorage.getItem("kin-integration-locale") === "en" ? "en" : "zh");
  const [themePreference, setThemePreference] = React.useState(() => {
    const preference = document.documentElement.dataset.themePreference;
    return ["light", "dark", "system"].includes(preference) ? preference : "system";
  });
  const [systemDark, setSystemDark] = React.useState(systemTheme.matches);
  const [toastPosition, setToastPosition] = React.useState("bottom-right");
  const [toastDirection, setToastDirection] = React.useState("ltr");
  const [sampleIndex, setSampleIndex] = React.useState(0);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [commandInvocation, setCommandInvocation] = React.useState("keyboard");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [sortItems, setSortItems] = React.useState([
    { id: "watch" },
    { id: "review" },
    { id: "recent" },
    { id: "saved" },
  ]);
  const [otp, setOtp] = React.useState("");
  const c = copy[locale];
  const theme = themePreference === "system" ? (systemDark ? "dark" : "light") : themePreference;
  const sample = metricSamples[sampleIndex];
  const sortLabels = React.useMemo(() => ({
    watch: c.sortWatch,
    review: c.sortReview,
    recent: c.sortRecent,
    saved: c.sortSaved,
  }), [c]);
  const dragAnnouncements = React.useMemo(() => ({
    onDragStart: ({ active }) => `${c.dragPicked} ${sortLabels[active.id] ?? active.id}.`,
    onDragOver: ({ active, over }) => over ? `${sortLabels[active.id] ?? active.id} ${c.dragOver} ${sortLabels[over.id] ?? over.id}.` : undefined,
    onDragEnd: ({ active, over }) => over ? `${sortLabels[active.id] ?? active.id} ${c.dragPlaced} ${sortLabels[over.id] ?? over.id}.` : `${sortLabels[active.id] ?? active.id} ${c.dragReturned}.`,
    onDragCancel: ({ active }) => `${sortLabels[active.id] ?? active.id} ${c.dragReturned}.`,
  }), [c, sortLabels]);

  React.useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    localStorage.setItem("kin-integration-locale", locale);
  }, [locale]);

  React.useEffect(() => {
    const onChange = (event) => setSystemDark(event.matches);
    systemTheme.addEventListener("change", onChange);
    return () => systemTheme.removeEventListener("change", onChange);
  }, [systemTheme]);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = themePreference;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("kin-reference-theme", themePreference);
    const canvasColor = getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim();
    if (canvasColor) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", canvasColor);
  }, [theme, themePreference]);

  React.useEffect(() => {
    const onStorage = (event) => {
      if (event.key === "kin-reference-theme" && ["light", "dark", "system"].includes(event.newValue)) setThemePreference(event.newValue);
      if (event.key === "kin-integration-locale" && ["zh", "en"].includes(event.newValue)) setLocale(event.newValue);
    };
    addEventListener("storage", onStorage);
    return () => removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.isComposing || event.defaultPrevented) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']")) return;
      event.preventDefault();
      setCommandInvocation("keyboard");
      setCommandOpen((open) => !open);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commandGroups = [
    {
      id: "navigate",
      heading: c.navigate,
      items: [
        { id: "workspace", label: <><PanelLeft size={15} /> {c.back}</>, keywords: ["workspace"], onSelect: () => location.assign("./index.html") },
        { id: "motion", label: <><RefreshCw size={15} /> Motion Lab</>, keywords: ["motion", "animation"], onSelect: () => location.assign("./motion.html") },
      ],
    },
    {
      id: "actions",
      heading: c.actions,
      items: [
        { id: "save", label: <><Save size={15} /> {c.save}</>, shortcut: "S", onSelect: () => kinToast.success(c.saved) },
        { id: "theme", label: <>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />} {theme === "dark" ? c.themeToLight : c.themeToDark}</>, onSelect: () => setThemePreference(theme === "dark" ? "light" : "dark") },
      ],
    },
  ];

  const moveActive = (event) => {
    if (!["j", "k", "ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "j" || event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((current) => Math.min(listItems.length - 1, Math.max(0, current + next)));
  };

  return (
    <>
      <header className="reference-header integration-header">
        <div><p>KIN reference</p><h1>Integration Lab</h1></div>
        <div className="reference-actions">
          <a className="reference-back icon-action" href="./index.html"><PanelLeft size={15} /><span>{c.back}</span></a>
          <PreferenceMenu
            action="language"
            label={c.language}
            value={locale}
            items={[{ value: "zh", label: "中文" }, { value: "en", label: "English" }]}
            onSelect={setLocale}
          >
            <Languages size={16} />
          </PreferenceMenu>
          <div className="integration-theme-control">
            <button
              type="button"
              className="theme-switch integration-theme-switch"
              role="switch"
              data-integration-action="theme"
              data-preference={themePreference}
              aria-checked={theme === "dark"}
              aria-label={theme === "dark" ? c.themeToLight : c.themeToDark}
              onClick={() => setThemePreference(theme === "dark" ? "light" : "dark")}
            >
              <span className="theme-switch-icon"><Sun size={13} aria-hidden="true" /></span>
              <span className="theme-switch-track" aria-hidden="true"><span /></span>
              <span className="theme-switch-icon"><Moon size={13} aria-hidden="true" /></span>
            </button>
            <PreferenceMenu
              action="theme-menu"
              label={c.appearance}
              value={themePreference}
              items={[
                { value: "light", label: c.light, icon: Sun },
                { value: "dark", label: c.dark, icon: Moon },
                { value: "system", label: c.system, icon: Monitor },
              ]}
              onSelect={setThemePreference}
              className="integration-theme-menu"
            >
              <ChevronDown size={14} />
            </PreferenceMenu>
          </div>
        </div>
      </header>

      <main className="reference-main integration-lab" tabIndex={-1}>
        <section className="integration-intro" aria-labelledby="integration-title">
          <p className="motion-kicker">{c.eyebrow}</p>
          <h2 id="integration-title">{c.title}</h2>
          <p>{c.intro}</p>
        </section>

        <Section id="integration-status" title={c.statusTitle} body={c.statusBody}>
          <div className="integration-status-table" role="table" aria-label={c.statusTitle}>
            <div role="row" className="integration-status-head"><span role="columnheader">{c.package}</span><span role="columnheader">{c.api}</span><span role="columnheader">{c.evidence}</span></div>
            {[
              ["Sonner", "KinToaster / kinToast", c.live],
              ["NumberFlow", "AnimatedMetric", c.live],
              ["cmdk", "KinCommandMenu", c.live],
              ["React Virtuoso", "KinVirtualList", c.live],
              ["dnd kit", "KinSortableList", c.live],
              ["input-otp", "KinOTPInput", c.live],
              ["Liveline", "KinLiveChart", c.live],
              ["Leva", "KinDevPanel", c.devOnly],
            ].map(([library, api, state]) => <div role="row" key={library}><span role="cell">{library}</span><code role="cell">{api}</code><span role="cell" className="integration-status-value"><Check size={14} />{state}</span></div>)}
          </div>
        </Section>

        <Section id="sonner" title={c.sonnerTitle} body={c.sonnerBody} source={{ href: "https://github.com/emilkowalski/sonner", label: "Sonner" }}>
          <div className="integration-toast-config">
            <fieldset>
              <legend>{c.toastPosition}</legend>
              <div className="toast-position-grid" role="radiogroup" aria-label={c.toastPosition}>
                {toastPositions.map((position) => (
                  <button
                    key={position}
                    type="button"
                    role="radio"
                    aria-checked={toastPosition === position}
                    data-toast-position={position}
                    onClick={() => setToastPosition(position)}
                  >
                    <span aria-hidden="true" />
                    {c.toastPositions[position]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{c.toastDirection}</legend>
              <div className="toast-direction-control" role="radiogroup" aria-label={c.toastDirection}>
                {[
                  ["ltr", "LTR", c.directionLtr],
                  ["rtl", "RTL", c.directionRtl],
                ].map(([direction, shortLabel, label]) => (
                  <button
                    key={direction}
                    type="button"
                    role="radio"
                    aria-checked={toastDirection === direction}
                    aria-label={label}
                    data-toast-direction={direction}
                    onClick={() => setToastDirection(direction)}
                  >
                    {shortLabel}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="integration-actions">
            <button data-integration-action="toast-success" className="icon-action" onClick={() => kinToast.success(c.saved)}><Save size={15} />{c.save}</button>
            <button data-integration-action="toast-undo" className="icon-action" onClick={() => kinToast.undoable(c.removed, { undoLabel: c.undoLabel, onUndo: () => kinToast.success(c.restored) })}><Undo2 size={15} />{c.undo}</button>
            <button data-integration-action="toast-task" className="icon-action" onClick={() => kinToast.task(() => new Promise((resolve) => setTimeout(resolve, 900)), { loading: c.exporting, success: c.exported, error: c.exportFailed })}><Bell size={15} />{c.export}</button>
            <button
              data-integration-action="toast-error"
              className="icon-action"
              onClick={() => kinToast.error(c.exportFailed, {
                description: c.failedDescription,
                action: { label: c.retry, onClick: () => kinToast.success(c.retryQueued) },
              })}
            >
              <TriangleAlert size={15} />{c.error}
            </button>
          </div>
        </Section>

        <Section id="number-flow" title={c.numberTitle} body={c.numberBody} source={{ href: "https://github.com/barvian/number-flow", label: "NumberFlow" }}>
          <LazyMount label={c.loadingRuntime}>
            <div className="integration-metrics">
              <AnimatedMetric label={c.availability} value={sample.availability} suffix="%" format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
              <AnimatedMetric label={c.latency} value={sample.latency} suffix="ms" />
              <AnimatedMetric label={c.events} value={sample.events} />
            </div>
            <button data-integration-action="number-sample" className="icon-action" onClick={() => setSampleIndex((sampleIndex + 1) % metricSamples.length)}><RefreshCw size={15} />{c.sample}</button>
          </LazyMount>
        </Section>

        <Section id="cmdk" title={c.commandTitle} body={c.commandBody} source={{ href: "https://github.com/dip/cmdk", label: "cmdk" }}>
          <button ref={commandTriggerRef} data-integration-action="command-open" className="icon-action" onClick={() => { setCommandInvocation("pointer"); setCommandOpen(true); }}><CommandIcon size={15} />{c.openCommand}<kbd>Ctrl K</kbd></button>
          {commandOpen ? (
            <React.Suspense fallback={<p className="integration-runtime-loading" role="status">{c.loadingRuntime}</p>}>
              <KinCommandMenu
                open={commandOpen}
                onOpenChange={setCommandOpen}
                groups={commandGroups}
                label={c.commandLabel}
                inputLabel={c.commandInput}
                placeholder={c.commandPlaceholder}
                emptyLabel={c.noResults}
                invocation={commandInvocation}
                returnFocusRef={commandTriggerRef}
              />
            </React.Suspense>
          ) : null}
        </Section>

        <Section id="virtuoso" title={c.virtualTitle} body={c.virtualBody} source={{ href: "https://github.com/petyosi/react-virtuoso", label: "React Virtuoso" }}>
          <LazyMount label={c.loadingRuntime}>
            <div data-integration-virtual className="integration-virtual-shell" tabIndex={0} onKeyDown={moveActive} aria-label={c.listLabel}>
              <div className="integration-list-toolbar"><Search size={14} /><span>{listItems.length.toLocaleString()} objects</span><span>J / K</span></div>
              <KinVirtualList
                items={listItems}
                getKey={(item) => item.id}
                activeIndex={activeIndex}
                label={c.listLabel}
                defaultItemHeight={42}
                renderItem={(item, index) => <button type="button" className="integration-entity-row" aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)}><span>{item.id}</span><strong>{item.name}</strong><small>{item.state}</small></button>}
              />
            </div>
          </LazyMount>
        </Section>

        <Section id="dnd-kit" title={c.sortableTitle} body={c.sortableBody} source={{ href: "https://github.com/clauderic/dnd-kit", label: "dnd kit" }}>
          <LazyMount label={c.loadingRuntime}>
            <KinSortableList
              items={sortItems}
              onReorder={setSortItems}
              getLabel={(item) => sortLabels[item.id]}
              dragHandleLabel={(item) => `${c.reorder}${sortLabels[item.id]}`}
              dragHandleContent={<GripVertical size={16} />}
              announcements={dragAnnouncements}
              screenReaderInstructions={{ draggable: c.dragInstructions }}
              renderItem={(item) => <span data-sort-id={item.id}>{sortLabels[item.id]}</span>}
            />
          </LazyMount>
        </Section>

        <Section id="input-otp" title={c.otpTitle} body={c.otpBody} source={{ href: "https://github.com/guilhermerodz/input-otp", label: "input-otp" }}>
          <LazyMount label={c.loadingRuntime}>
            <KinOTPInput label={c.otpLabel} description={c.otpDescription} value={otp} onChange={setOtp} />
          </LazyMount>
        </Section>

        <Section id="liveline" title={c.chartTitle} body={c.chartBody} source={{ href: "https://github.com/benjitaylor/liveline", label: "Liveline" }}>
          <LazyMount label={c.loadingRuntime}>
            <KinLiveChart
              data={chartData}
              value={94}
              theme={theme}
              summary={c.chartSummary}
              tableLabel={c.viewData}
              timeLabel={c.time}
              valueLabel={c.latencyValue}
              formatValue={(value) => `${Math.round(value)}ms`}
              formatTime={(time) => new Date(time * 1_000).toLocaleTimeString(locale === "zh" ? "zh-CN" : "en", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              style={{ height: 220 }}
            />
          </LazyMount>
        </Section>

        <Section id="leva" title={c.boundaryTitle} body={c.boundaryBody}>
          <div className="integration-code-boundary"><code>@kin-design/react/dev/leva</code><ChevronDown size={14} aria-hidden="true" /><span>{c.devOnly}</span></div>
        </Section>
      </main>
      <KinToaster theme={theme} locale={locale} position={toastPosition} direction={toastDirection} />
    </>
  );
}

createRoot(document.getElementById("integration-app")).render(<App />);
