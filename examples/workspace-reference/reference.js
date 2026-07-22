import {
  Activity,
  Check,
  ChevronDown,
  CirclePlay,
  Contrast,
  createIcons,
  Database,
  Ellipsis,
  ExternalLink,
  FileSearch,
  Languages,
  LayoutDashboard,
  Link,
  LoaderCircle,
  Moon,
  Palette,
  PanelRight,
  Pause,
  RefreshCw,
  Save,
  ScanLine,
  Search,
  Star,
  Sun,
  TriangleAlert,
  X,
} from "lucide";

const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeSwitch = document.querySelector("[data-theme-switch]");
const themeControl = document.querySelector("[data-theme-control]");
const themeMenuTrigger = document.querySelector("[data-theme-menu-trigger]");
const themeMenu = document.querySelector("[data-theme-menu]");
const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
const appShell = document.querySelector(".app-shell");
const sidebar = document.querySelector(".sidebar");
const workspace = document.querySelector(".workspace");
const inspector = document.querySelector(".inspector");
const inspectorOpen = document.querySelector("[data-inspector-open]");
const inspectorClose = document.querySelector("[data-inspector-close]");
const inspectorScrim = document.querySelector("[data-inspector-scrim]");
const contrastToggle = document.querySelector("[data-contrast-toggle]");
const locationOverflow = document.querySelector("[data-location-overflow]");
const locationOverflowTrigger = document.querySelector("[data-location-overflow-trigger]");
const locationOverflowMenu = document.querySelector("[data-location-overflow-menu]");
const locationOverflowItems = [...locationOverflowMenu.querySelectorAll('[role^="menuitem"]')];
const copyLocation = document.querySelector("[data-copy-location]");
const locationStatus = document.querySelector("[data-location-status]");
const languageControl = document.querySelector("[data-language-control]");
const languageTrigger = document.querySelector("[data-language-trigger]");
const languageMenu = document.querySelector("[data-language-menu]");
const localeButtons = [...document.querySelectorAll("[data-locale-value]")];
const overlayLayout = matchMedia("(max-width: 1180px)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const workspaceView = ["risk-queue", "investigation"].includes(root.dataset.workspaceView) ? root.dataset.workspaceView : "entity";
const riskQueue = document.querySelector("[data-risk-queue]");
const riskTableWrap = document.querySelector("[data-risk-table-wrap]");
const riskCount = document.querySelector("[data-risk-count]");
const riskRows = [...document.querySelectorAll("[data-risk-row]")];
const riskSignalButtons = [...document.querySelectorAll("[data-risk-signal]")];
const riskInspectorTitle = document.querySelector("[data-risk-inspector-title]");
const riskDetailSeverity = document.querySelector("[data-risk-detail-severity]");
const riskDetailEvidence = document.querySelector("[data-risk-detail-evidence]");
const riskDetailOwner = document.querySelector("[data-risk-detail-owner]");
const riskDetailReview = document.querySelector("[data-risk-detail-review]");
const riskDetailSummary = document.querySelector("[data-risk-detail-summary]");
const riskEvidenceSources = [...document.querySelectorAll("[data-risk-evidence-source]")];
const riskEvidenceResults = [...document.querySelectorAll("[data-risk-evidence-result]")];
const riskReviewForm = document.querySelector("[data-risk-review-form]");
const riskReviewFields = document.querySelector("[data-risk-review-fields]");
const riskOwner = document.querySelector("[data-risk-owner]");
const riskReason = document.querySelector("[data-risk-reason]");
const riskSubmit = document.querySelector("[data-risk-submit]");
const riskCommitRecord = document.querySelector("[data-risk-commit-record]");
const riskCommitOwner = document.querySelector("[data-risk-commit-owner]");
const riskCommitDecision = document.querySelector("[data-risk-commit-decision]");
const riskCommitReason = document.querySelector("[data-risk-commit-reason]");
const riskUndoAction = document.querySelector("[data-risk-undo-action]");
const riskRetry = document.querySelector("[data-risk-retry]");
const riskRefresh = document.querySelector("[data-risk-refresh]");
const riskOwnerError = document.querySelector("[data-risk-owner-error]");
const riskReasonError = document.querySelector("[data-risk-reason-error]");
const riskQueueTitle = document.querySelector("[data-risk-queue] h1");
const riskLocationTitle = document.querySelector('.location-identity strong[data-view="risk-queue"]');
const riskScopeValue = document.querySelector('[data-risk-queue] [data-i18n="riskScopeValue"]');
const riskStatePanels = [...document.querySelectorAll("[data-risk-state-panel]")];
const riskScopeLinks = [...document.querySelectorAll("[data-risk-scope]")];
let sonnerModulePromise;
const transientSurfaceCleanups = new WeakMap();

function transientIsOpen(surface) {
  return surface.dataset.state === "opening" || surface.dataset.state === "open";
}

function setTransientSurface(surface, open, { trigger, focusTarget, restoreFocus = false } = {}) {
  transientSurfaceCleanups.get(surface)?.();
  if (open) {
    surface.hidden = false;
    surface.inert = false;
    surface.dataset.state = "opening";
    trigger.setAttribute("aria-expanded", "true");
    focusTarget?.focus();
    requestAnimationFrame(() => {
      if (surface.dataset.state !== "opening") return;
      surface.dataset.state = "open";
    });
    return;
  }

  trigger.setAttribute("aria-expanded", "false");
  surface.inert = true;
  surface.dataset.state = "closing";
  if (restoreFocus) trigger.focus();

  let timer;
  const detach = () => {
    window.clearTimeout(timer);
    surface.removeEventListener("transitionend", onTransitionEnd);
    transientSurfaceCleanups.delete(surface);
  };
  const finish = () => {
    if (surface.dataset.state !== "closing") return;
    detach();
    surface.hidden = true;
    surface.dataset.state = "closed";
  };
  const onTransitionEnd = (event) => {
    if (event.target === surface && (event.propertyName === "opacity" || event.propertyName === "transform")) finish();
  };
  surface.addEventListener("transitionend", onTransitionEnd);
  timer = window.setTimeout(finish, reducedMotion.matches ? 90 : 190);
  transientSurfaceCleanups.set(surface, detach);
}

const copy = {
  zh: {
    skip: "跳到主要内容", primaryNav: "主导航", workspaceNav: "工作区", overview: "情报概览",
    database: "对象数据库", signals: "风险信号", monitoring: "监测任务", savedViews: "保存视图",
    stable: "近期稳定", changed: "最近变化", review: "等待复核", workspaceSettings: "工作区设置",
    admin: "管理员", breadcrumb: "面包屑", search: "搜索", properties: "属性", language: "切换语言",
    contrast: "切换高对比度", moreActions: "更多操作", copyLink: "复制对象链接", copiedLink: "对象链接已复制", copyLinkFailed: "无法复制对象链接",
    entityViews: "对象视图", summaryTab: "概览", activityTab: "事件",
    sourcesTab: "来源", relationsTab: "关联", description: "持续记录入口、公开频道、运行状态和可验证事件。",
    follow: "加入关注", runScan: "运行检测", metrics: "关键指标", currentStatus: "当前状态",
    healthy: "正常", operatingRecord: "运营记录", operatingValue: "6 年 3 个月", completeness: "数据完整度",
    latestEvent: "最近事件", latestEventValue: "2 小时前", statusSummary: "状态摘要",
    statusSummaryDescription: "基于最近一次公开数据和监测结果。", updatedAt: "更新于 14:32",
    summaryText: "官网与公开频道当前可访问。过去 30 天记录到 2 次短时异常，均已恢复；现有证据不足以提高风险等级。",
    recentEvents: "最近事件", eventsDescription: "变化按发生时间排列，结论与来源分开显示。", viewAll: "查看全部",
    todayTime: "今天 09:42", eventOneTitle: "香港节点延迟恢复正常", eventOneBody: "HK-02 延迟从 328ms 降至 89ms。",
    monitorSystem: "检测系统", yesterdayTime: "昨天 23:18", eventTwoTitle: "公开频道发布维护通知",
    eventTwoBody: "计划维护窗口为 7 月 13 日 02:00–03:00。", publicChannel: "公开频道", dateTime: "7 月 9 日",
    eventThreeTitle: "主域名证书完成续期", eventThreeBody: "证书签发机构未发生变化。", certificateMonitor: "证书监测",
    currentObject: "当前对象", closeInspector: "关闭属性面板", status: "状态", operatingStatus: "运行状态",
    riskLevel: "风险等级", watch: "观察", lastScan: "最后检测", lastScanValue: "3 分钟前", operations: "运营信息",
    firstRecorded: "首次收录", primaryRegion: "主要地区", eastAsia: "东亚", relatedDomains: "关联域名",
    fourItems: "4 个", evidence: "证据", evidenceCount: "证据数量", sourceCount: "来源数量",
    confidence: "证据可信度", confidenceDefinition: "该分数表示当前证据来源的可信程度，不代表对象整体安全等级。",
    feedbackTitle: "交互反馈", feedbackDescription: "按钮状态说明操作进度，Sonner 只反馈用户主动触发的结果。",
    toggleLabel: "成对状态", watchButton: "暂停监测", watchingButton: "继续监测", toggleDescription: "图标、下一动作标签和 aria-pressed 共同表达可逆状态。",
    asyncLabel: "异步完成", saveButton: "保存视图", savingButton: "正在保存", savedButton: "已保存", asyncDescription: "同一按钮连续呈现等待、完成和恢复状态。",
    taskButton: "启动导出任务", taskDescription: "同一条通知从处理中更新为完成，不重复堆叠。",
    errorLabel: "失败与重试", retryButton: "模拟请求失败", errorDescription: "失败通知保留上下文，并提供明确的重试动作。",
    switchToLight: "切换到日间模式", switchToDark: "切换到夜间模式", appearance: "选择外观", themeLight: "日间模式", themeDark: "夜间模式", themeSystem: "跟随系统",
    followedTitle: "已加入关注", followedDescription: "Alpha Network 的变化会出现在关注视图中。", undo: "撤销", undone: "已撤销关注",
    scanTitle: "检测任务已创建", scanDescription: "系统将检测公开入口和监测节点。", viewTask: "查看任务", taskOpened: "检测任务已打开",
    savedTitle: "视图已保存", savedDescription: "筛选条件和列顺序已保存。",
    exportLoading: "正在创建导出任务", exportSuccess: "导出任务已创建", exportDescription: "任务完成后可在下载中心查看。",
    errorTitle: "请求失败", errorToastDescription: "监测服务暂时没有响应。", retry: "重试", retryQueued: "已重新提交请求",
    investigations: "调查记录",
    riskSavedView: "高优先级待复核", riskReview: "审核", riskQueueViews: "风险队列视图", riskScopeElevated: "高优先级", riskScopeUnassigned: "未指派", riskScopeConflicting: "证据冲突", riskScopeResolved: "已解决",
    riskSavedViewLabel: "保存视图 · 过去 24 小时", riskQueueTitle: "高优先级待复核", riskQueueDescription: "先核对严重度与证据状态，再指派负责人或记录可撤销结论。", riskRefresh: "刷新本地范围", riskFixtureNote: "确定性本地参考，基准时间为 2026-07-19 10:32 +08:00；相对时间均以该时刻计算。未连接实时监测、权限服务或持久化存储。",
    riskScopeSummary: "保存范围摘要", riskScopeLabel: "范围", riskScopeValue: "高或严重 · 未解决", riskSortLabel: "排序", riskSortValue: "严重度 → 观察时间", riskCoverageLabel: "证据要求", riskCoverageValue: "至少 2 个可归因来源",
    riskLoadingTitle: "正在刷新保存范围", riskLoadingBody: "保留当前队列与选择，等待本地 fixture 完成。", riskConflictTitle: "证据存在冲突", riskConflictBody: "两个来源对证书变更是否预期给出不同结论，需记录人工判断。", riskPendingTitle: "正在记录审核决定", riskPendingBody: "本地 fixture 暂时锁定控件，队列范围与草稿保持不变。",
    riskCommittedTitle: "审核决定已记录", riskCommittedBody: "该决定仍可撤销；风险等级本身未被自动改写。", riskUndoTitle: "审核决定已撤销", riskUndoBody: "信号回到待复核状态，原理由保留在本地草稿中。", riskPermissionTitle: "仅可查看", riskPermissionBody: "当前 fixture 模拟缺少审核权限；队列与证据仍可读取。", riskErrorTitle: "审核记录失败", riskErrorBody: "本地草稿、负责人和理由均已保留，可以重试。",
    riskTableTitle: "信号队列", riskTableDescription: "严重度、证据状态和审核状态分别显示，不合并为单一分数。", riskCount: "4 个本地信号", riskCountEmpty: "0 个本地信号", riskEmptyTitle: "当前范围没有待复核信号", riskEmptyBody: "可以切换保存视图；本地 fixture 不会自动扩大范围。", riskTableLabel: "风险信号队列",
    riskColumnSignal: "信号", riskColumnSeverity: "严重度", riskColumnEvidence: "证据状态", riskColumnOwner: "负责人", riskColumnReview: "审核状态", riskColumnObserved: "观察时间",
    riskSignal204: "证书签发者发生变化", riskSignal198: "公开频道入口不可用", riskSignal191: "新增关联域名待核验", riskSignal184: "节点延迟已恢复", riskSeverityCritical: "严重", riskSeverityHigh: "高", riskSeverityMedium: "中", riskSeverityLow: "低", riskEvidenceConflict: "冲突", riskEvidenceConfirmed: "已确认", riskEvidencePending: "待核验", riskUnassigned: "未指派", riskReviewOpen: "待复核", riskReviewActive: "审核中", riskReviewEvidence: "等待证据", riskReviewResolved: "已解决", riskObservedEight: "8 分钟前", riskObservedFortyOne: "41 分钟前", riskObservedTwoHours: "2 小时前", riskObservedThreeHours: "3 小时前",
    riskSelectedSignal: "选中信号", riskSignalContext: "信号上下文", riskEvidenceRows: "可归因证据", riskReviewDecision: "审核决定", riskOwnerLabel: "负责人", riskChooseOwner: "选择负责人", riskDecisionLabel: "决定", riskDecisionWatch: "保持观察", riskDecisionEscalate: "升级复核", riskDecisionResolve: "按预期变更解决", riskReasonLabel: "记录理由", riskReasonPlaceholder: "说明证据如何支持该决定", riskRecordDecision: "记录决定", riskRecordingDecision: "正在记录", riskRecordedTitle: "已记录的决定", riskRecordedAt: "记录时间", riskReviewSignal: "审核选中信号",
    riskSummary204: "证书观察记录到新签发者；公开入口扫描未发现主机变化。", riskSummary198: "公开频道入口连续两次不可用；独立检查得到相同结果。", riskSummary191: "发现新关联域名，但第二来源与所有权记录仍待核验。", riskSummary184: "节点延迟恢复并由独立检查确认；该信号已有解决记录。",
    riskEvidencePrimary: "主要来源", riskEvidenceIndependent: "独立监测", riskEvidenceReview: "审核记录", riskResultObserved: "变更已观察", riskResultBaseline: "基线未变化", riskResultMissing: "没有对应说明", riskResultFailureConfirmed: "故障已确认", riskResultCheckAgrees: "独立检查一致", riskResultReviewAvailable: "已有审核记录", riskResultRelationObserved: "关联已观察", riskResultCheckPending: "独立检查待完成", riskResultDecisionOpen: "尚未记录决定", riskResultRecoveryConfirmed: "恢复已确认", riskResultResolutionRecorded: "已记录解决结论", riskDraftReason: "证书轮换与已核对的入口状态一致。", riskDraftPreserved: "草稿已保留", riskCountTemplate: "{count} 个本地信号", riskCountOne: "1 个本地信号", riskOwnerError: "记录决定前请选择负责人。", riskReasonError: "请记录证据如何支持该决定。", riskScopeValueElevated: "高或严重 · 未解决", riskScopeValueUnassigned: "未指派 · 未解决", riskScopeValueConflicting: "证据冲突 · 待判断", riskScopeValueResolved: "已记录解决结论",
  },
  en: {
    skip: "Skip to main content", primaryNav: "Primary navigation", workspaceNav: "Workspace", overview: "Overview",
    database: "Entity database", signals: "Risk signals", monitoring: "Monitoring", savedViews: "Saved views",
    stable: "Recently stable", changed: "Recent changes", review: "Pending review", workspaceSettings: "Workspace settings",
    admin: "Administrator", breadcrumb: "Breadcrumb", search: "Search", properties: "Properties", language: "Change language",
    contrast: "Toggle high contrast", moreActions: "More actions", copyLink: "Copy entity link", copiedLink: "Entity link copied", copyLinkFailed: "Unable to copy entity link",
    entityViews: "Entity views", summaryTab: "Summary", activityTab: "Activity",
    sourcesTab: "Sources", relationsTab: "Relations", description: "Tracks public endpoints, channels, operating status, and verifiable events.",
    follow: "Follow", runScan: "Run scan", metrics: "Key metrics", currentStatus: "Current status",
    healthy: "Healthy", operatingRecord: "Operating record", operatingValue: "6 years 3 months", completeness: "Data completeness",
    latestEvent: "Latest event", latestEventValue: "2 hours ago", statusSummary: "Status summary",
    statusSummaryDescription: "Based on the latest public data and monitoring result.", updatedAt: "Updated at 14:32",
    summaryText: "The website and public channel are currently reachable. Two brief incidents were recorded in the past 30 days and both recovered; current evidence does not justify raising the risk level.",
    recentEvents: "Recent activity", eventsDescription: "Changes are ordered by time, with findings separated from sources.", viewAll: "View all",
    todayTime: "Today 09:42", eventOneTitle: "Hong Kong node latency recovered", eventOneBody: "HK-02 latency fell from 328ms to 89ms.",
    monitorSystem: "Monitoring system", yesterdayTime: "Yesterday 23:18", eventTwoTitle: "Maintenance notice published",
    eventTwoBody: "The maintenance window is scheduled for July 13, 02:00–03:00.", publicChannel: "Public channel", dateTime: "July 9",
    eventThreeTitle: "Primary domain certificate renewed", eventThreeBody: "The certificate authority did not change.", certificateMonitor: "Certificate monitor",
    currentObject: "Current entity", closeInspector: "Close properties panel", status: "Status", operatingStatus: "Operating status",
    riskLevel: "Risk level", watch: "Watch", lastScan: "Last scan", lastScanValue: "3 minutes ago", operations: "Operations",
    firstRecorded: "First recorded", primaryRegion: "Primary region", eastAsia: "East Asia", relatedDomains: "Related domains",
    fourItems: "4 items", evidence: "Evidence", evidenceCount: "Evidence count", sourceCount: "Source count",
    confidence: "Evidence confidence", confidenceDefinition: "This score describes confidence in the current evidence sources, not the overall safety level of the entity.",
    feedbackTitle: "Interaction feedback", feedbackDescription: "Button states communicate progress; Sonner reports results initiated by the user.",
    toggleLabel: "Paired state", watchButton: "Pause monitoring", watchingButton: "Resume monitoring", toggleDescription: "The icon, next-action label, and aria-pressed communicate a reversible state together.",
    asyncLabel: "Async completion", saveButton: "Save view", savingButton: "Saving", savedButton: "Saved", asyncDescription: "One button moves through pending, complete, and restored states without shifting layout.",
    taskButton: "Start export task", taskDescription: "One notification updates from processing to complete instead of stacking duplicates.",
    errorLabel: "Failure and retry", retryButton: "Simulate request failure", errorDescription: "The error keeps its context and offers a clear retry action.",
    switchToLight: "Switch to light mode", switchToDark: "Switch to dark mode", appearance: "Choose appearance", themeLight: "Light", themeDark: "Dark", themeSystem: "System",
    followedTitle: "Added to following", followedDescription: "Changes to Alpha Network will appear in your followed view.", undo: "Undo", undone: "Follow removed",
    scanTitle: "Scan created", scanDescription: "Public endpoints and monitoring nodes will be checked.", viewTask: "View task", taskOpened: "Scan task opened",
    savedTitle: "View saved", savedDescription: "Filters and column order have been saved.",
    exportLoading: "Creating export task", exportSuccess: "Export task created", exportDescription: "The result will appear in Downloads when ready.",
    errorTitle: "Request failed", errorToastDescription: "The monitoring service did not respond.", retry: "Retry", retryQueued: "Request submitted again",
    investigations: "Investigations",
    riskSavedView: "Elevated signals", riskReview: "Review", riskQueueViews: "Risk queue views", riskScopeElevated: "Elevated", riskScopeUnassigned: "Unassigned", riskScopeConflicting: "Conflicting evidence", riskScopeResolved: "Resolved",
    riskSavedViewLabel: "Saved view · Last 24 hours", riskQueueTitle: "Elevated signals", riskQueueDescription: "Check severity and evidence state before assigning an owner or recording a reversible decision.", riskRefresh: "Refresh local scope", riskFixtureNote: "Deterministic local reference as of 2026-07-19 10:32 +08:00; relative times are anchored to that instant. No live monitoring, permission service, or persistent storage is connected.",
    riskScopeSummary: "Saved scope summary", riskScopeLabel: "Scope", riskScopeValue: "High or critical · Unresolved", riskSortLabel: "Sort", riskSortValue: "Severity → Observed time", riskCoverageLabel: "Evidence requirement", riskCoverageValue: "At least 2 attributable sources",
    riskLoadingTitle: "Refreshing saved scope", riskLoadingBody: "The current queue and selection remain visible while the local fixture completes.", riskConflictTitle: "Evidence is conflicting", riskConflictBody: "Two sources disagree about whether the certificate change was expected; a human judgment is required.", riskPendingTitle: "Recording review decision", riskPendingBody: "The local fixture temporarily locks controls while preserving the scope and draft.",
    riskCommittedTitle: "Review decision recorded", riskCommittedBody: "The decision remains reversible; the risk severity was not changed automatically.", riskUndoTitle: "Review decision undone", riskUndoBody: "The signal is open for review again and the previous reason remains in the local draft.", riskPermissionTitle: "View only", riskPermissionBody: "This fixture simulates missing review permission; the queue and evidence remain readable.", riskErrorTitle: "Review record failed", riskErrorBody: "The local draft, owner, and reason are preserved and can be retried.",
    riskTableTitle: "Signal queue", riskTableDescription: "Severity, evidence state, and review state stay separate instead of collapsing into one score.", riskCount: "4 local signals", riskCountEmpty: "0 local signals", riskEmptyTitle: "No signals need review in this scope", riskEmptyBody: "Choose another saved view; the local fixture will not widen the scope automatically.", riskTableLabel: "Risk signal queue",
    riskColumnSignal: "Signal", riskColumnSeverity: "Severity", riskColumnEvidence: "Evidence state", riskColumnOwner: "Owner", riskColumnReview: "Review state", riskColumnObserved: "Observed",
    riskSignal204: "Certificate issuer changed", riskSignal198: "Public channel endpoint unavailable", riskSignal191: "New related domain needs verification", riskSignal184: "Node latency recovered", riskSeverityCritical: "Critical", riskSeverityHigh: "High", riskSeverityMedium: "Medium", riskSeverityLow: "Low", riskEvidenceConflict: "Conflicting", riskEvidenceConfirmed: "Confirmed", riskEvidencePending: "Pending verification", riskUnassigned: "Unassigned", riskReviewOpen: "Open review", riskReviewActive: "In review", riskReviewEvidence: "Awaiting evidence", riskReviewResolved: "Resolved", riskObservedEight: "8 minutes ago", riskObservedFortyOne: "41 minutes ago", riskObservedTwoHours: "2 hours ago", riskObservedThreeHours: "3 hours ago",
    riskSelectedSignal: "Selected signal", riskSignalContext: "Signal context", riskEvidenceRows: "Attributable evidence", riskReviewDecision: "Review decision", riskOwnerLabel: "Owner", riskChooseOwner: "Choose owner", riskDecisionLabel: "Decision", riskDecisionWatch: "Keep watch", riskDecisionEscalate: "Escalate review", riskDecisionResolve: "Resolve as expected change", riskReasonLabel: "Recorded reason", riskReasonPlaceholder: "Explain how the evidence supports this decision", riskRecordDecision: "Record decision", riskRecordingDecision: "Recording", riskRecordedTitle: "Recorded decision", riskRecordedAt: "Recorded at", riskReviewSignal: "Review selected signal",
    riskSummary204: "The certificate observer found a new issuer; the public endpoint scan found no host change.", riskSummary198: "The public channel endpoint was unavailable in two observations and an independent check agreed.", riskSummary191: "A new related domain was observed, but a second source and ownership record are still pending.", riskSummary184: "Node latency recovered and an independent check confirmed the result; a resolution is recorded.",
    riskEvidencePrimary: "Primary source", riskEvidenceIndependent: "Independent monitor", riskEvidenceReview: "Review record", riskResultObserved: "Change observed", riskResultBaseline: "Baseline unchanged", riskResultMissing: "No matching note", riskResultFailureConfirmed: "Failure confirmed", riskResultCheckAgrees: "Independent check agrees", riskResultReviewAvailable: "Review record available", riskResultRelationObserved: "Relationship observed", riskResultCheckPending: "Independent check pending", riskResultDecisionOpen: "No decision recorded", riskResultRecoveryConfirmed: "Recovery confirmed", riskResultResolutionRecorded: "Resolution recorded", riskDraftReason: "The certificate rotation matches the verified endpoint state.", riskDraftPreserved: "Draft preserved", riskCountTemplate: "{count} local signals", riskCountOne: "1 local signal", riskOwnerError: "Choose an owner before recording the decision.", riskReasonError: "Record how the evidence supports this decision.", riskScopeValueElevated: "High or critical · Unresolved", riskScopeValueUnassigned: "Unassigned · Unresolved", riskScopeValueConflicting: "Conflicting evidence · Judgment needed", riskScopeValueResolved: "Resolution recorded",
  },
};

const riskSignals = {
  "RSK-204": {
    entity: "Alpha Network",
    severityKey: "riskSeverityHigh",
    evidenceKey: "riskEvidenceConflict",
    owner: "",
    reviewKey: "riskReviewOpen",
    summaryKey: "riskSummary204",
    resultKeys: ["riskResultObserved", "riskResultBaseline", "riskResultMissing"],
  },
  "RSK-198": {
    entity: "Beacon Relay",
    severityKey: "riskSeverityCritical",
    evidenceKey: "riskEvidenceConfirmed",
    owner: "Mina Chen",
    reviewKey: "riskReviewActive",
    summaryKey: "riskSummary198",
    resultKeys: ["riskResultFailureConfirmed", "riskResultCheckAgrees", "riskResultReviewAvailable"],
  },
  "RSK-191": {
    entity: "Northstar Index",
    severityKey: "riskSeverityMedium",
    evidenceKey: "riskEvidencePending",
    owner: "Omar Li",
    reviewKey: "riskReviewEvidence",
    summaryKey: "riskSummary191",
    resultKeys: ["riskResultRelationObserved", "riskResultCheckPending", "riskResultDecisionOpen"],
  },
  "RSK-184": {
    entity: "Harbor Node",
    severityKey: "riskSeverityLow",
    evidenceKey: "riskEvidenceConfirmed",
    owner: "Kaito Wu",
    reviewKey: "riskReviewResolved",
    summaryKey: "riskSummary184",
    resultKeys: ["riskResultRecoveryConfirmed", "riskResultCheckAgrees", "riskResultResolutionRecorded"],
  },
};
const riskEvidenceSourceKeys = ["riskEvidencePrimary", "riskEvidenceIndependent", "riskEvidenceReview"];
const allowedRiskStates = new Set(["normal", "loading", "empty", "conflict", "pending", "committed", "undo", "permission", "error"]);
const riskScopeSignals = {
  elevated: ["RSK-204", "RSK-198"],
  unassigned: ["RSK-204"],
  conflicting: ["RSK-204"],
  resolved: ["RSK-184"],
};
const allowedRiskScopes = new Set(Object.keys(riskScopeSignals));
const initialRiskParams = new URLSearchParams(window.location.search);
const initialRiskPanelRequested = initialRiskParams.get("panel") === "review";
let currentRiskScope = allowedRiskScopes.has(initialRiskParams.get("scope")) ? initialRiskParams.get("scope") : "elevated";
let selectedRiskId = riskSignals[initialRiskParams.get("signal")] ? initialRiskParams.get("signal") : riskScopeSignals[currentRiskScope][0];
if (!riskScopeSignals[currentRiskScope].includes(selectedRiskId)) selectedRiskId = riskScopeSignals[currentRiskScope][0];
let currentRiskState = allowedRiskStates.has(initialRiskParams.get("state")) ? initialRiskParams.get("state") : "normal";
const riskDrafts = new Map();
const riskRecords = new Map(Object.entries(riskSignals).map(([id, signal]) => [id, {
  owner: signal.owner,
  reviewKey: signal.reviewKey,
}]));
const riskCommits = new Map();
const riskDecisionMessageKeys = {
  watch: "riskDecisionWatch",
  escalate: "riskDecisionEscalate",
  resolve: "riskDecisionResolve",
};
const riskDecisionReviewKeys = {
  watch: "riskReviewOpen",
  escalate: "riskReviewActive",
  resolve: "riskReviewResolved",
};
let riskSubmissionFailed = currentRiskState === "error";
let pendingRiskSubmission = null;
let inspectorReturnTarget = inspectorOpen;
let riskStateTimer;

function currentLocale() {
  return root.dataset.locale === "en" ? "en" : "zh";
}

let investigationController;
if (workspaceView === "investigation") {
  const module = await import("./investigation-reference.js");
  Object.assign(copy.zh, module.investigationCopy.zh);
  Object.assign(copy.en, module.investigationCopy.en);
  investigationController = module.createInvestigationController({
    root,
    copy,
    currentLocale,
    overlayLayout,
    appShell,
    inspectorOpen,
    inspectorIsOpen,
    setInspector,
  });
}

function translate(locale, persist = true) {
  const messages = copy[locale];
  root.dataset.locale = locale;
  root.lang = locale === "zh" ? "zh-CN" : "en";
  for (const element of document.querySelectorAll("[data-i18n]")) {
    const value = messages[element.dataset.i18n];
    if (value) element.textContent = value;
  }
  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    const value = messages[element.dataset.i18nAria];
    if (value) element.setAttribute("aria-label", value);
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    const value = messages[element.dataset.i18nPlaceholder];
    if (value) element.setAttribute("placeholder", value);
  }
  const riskColumnKeys = ["riskColumnSignal", "riskColumnSeverity", "riskColumnEvidence", "riskColumnOwner", "riskColumnReview", "riskColumnObserved"];
  for (const row of riskRows) {
    [...row.cells].forEach((cell, index) => {
      cell.dataset.label = messages[riskColumnKeys[index]];
    });
  }
  for (const button of localeButtons) {
    const active = button.dataset.localeValue === locale;
    button.setAttribute("aria-current", active ? "true" : "false");
  }
  updateThemeSwitch(root.dataset.theme);
  if (persist) {
    localStorage.setItem("kin-reference-locale", locale);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale === "zh" ? "zh-CN" : "en");
    history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  }
  if (sonnerModulePromise) sonnerModulePromise.then((module) => module.updateToasterTheme(root.dataset.theme, locale));
  const toggle = document.querySelector("[data-motion-toggle]");
  if (toggle) {
    const label = toggle.querySelector("span");
    label.textContent = messages[toggle.getAttribute("aria-pressed") === "true" ? "watchingButton" : "watchButton"];
  }
  if (workspaceView === "risk-queue") {
    inspectorOpen.dataset.i18nAria = "riskReviewSignal";
    inspectorOpen.setAttribute("aria-label", messages.riskReviewSignal);
    renderRiskScope();
    renderRiskSignal({ syncForm: false });
    renderRiskState();
  } else if (workspaceView === "investigation") {
    investigationController.translate(messages);
  }
}

function syncWorkspaceView() {
  root.dataset.workspaceView = workspaceView;
  for (const link of document.querySelectorAll("[data-nav-view]")) {
    if (link.dataset.navView === workspaceView) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  for (const link of riskScopeLinks) {
    if (link.dataset.riskScope === currentRiskScope) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  inspector.setAttribute("aria-labelledby", workspaceView === "risk-queue"
    ? "risk-inspector-title"
    : workspaceView === "investigation"
        ? "investigation-inspector-title"
        : "inspector-title");
}

function writeRiskUrl({ mode = "replace", panel = overlayLayout.matches && appShell.classList.contains("inspector-open") } = {}) {
  if (workspaceView !== "risk-queue") return;
  const url = new URL(window.location.href);
  url.searchParams.set("view", "risk-queue");
  url.searchParams.set("scope", currentRiskScope);
  url.searchParams.set("state", currentRiskState);
  url.searchParams.set("signal", selectedRiskId);
  if (panel) url.searchParams.set("panel", "review");
  else url.searchParams.delete("panel");
  const panelPushed = Boolean(panel && (mode === "push" || history.state?.kinRiskPanelPushed));
  const nextState = {
    ...(history.state || {}),
    kinRiskEntry: true,
    kinRiskPanel: Boolean(panel),
    kinRiskPanelPushed: panelPushed,
  };
  history[mode + "State"](nextState, "", url.pathname + url.search + url.hash);
}

function riskDraft(id = selectedRiskId) {
  if (!riskDrafts.has(id)) {
    riskDrafts.set(id, { owner: riskRecords.get(id)?.owner || "", decision: "watch", reason: "" });
  }
  return riskDrafts.get(id);
}

function saveRiskDraft(id = selectedRiskId) {
  if (!riskReviewForm || !riskSignals[id]) return;
  const decision = riskReviewForm.querySelector('input[name="decision"]:checked')?.value || "watch";
  riskDrafts.set(id, { owner: riskOwner.value, decision, reason: riskReason.value });
}

function applyRiskDraft(id = selectedRiskId) {
  const draft = riskDraft(id);
  riskOwner.value = draft.owner;
  riskReason.value = draft.reason;
  const decision = riskReviewForm.querySelector(`input[name="decision"][value="${draft.decision}"]`);
  if (decision) decision.checked = true;
}

function renderRiskRows() {
  const messages = copy[currentLocale()];
  for (const row of riskRows) {
    const record = riskRecords.get(row.dataset.riskRow);
    if (!record) continue;
    const owner = row.querySelector("[data-risk-row-owner]");
    const review = row.querySelector("[data-risk-row-review]");
    if (record.owner) {
      owner.removeAttribute("data-i18n");
      owner.textContent = record.owner;
    } else {
      owner.dataset.i18n = "riskUnassigned";
      owner.textContent = messages.riskUnassigned;
    }
    review.dataset.i18n = record.reviewKey;
    review.textContent = messages[record.reviewKey];
  }
}

function commitRiskSubmission(submission) {
  if (!submission || !riskRecords.has(submission.signalId)) return;
  const record = riskRecords.get(submission.signalId);
  const existing = riskCommits.get(submission.signalId);
  const previous = existing?.previous || { owner: record.owner, reviewKey: record.reviewKey };
  record.owner = submission.draft.owner;
  record.reviewKey = riskDecisionReviewKeys[submission.draft.decision] || "riskReviewOpen";
  riskCommits.set(submission.signalId, {
    previous,
    draft: { ...submission.draft },
  });
  renderRiskRows();
}

function ensureRiskCommit(id = selectedRiskId) {
  if (riskCommits.has(id)) return;
  ensureRiskDraft(id);
  commitRiskSubmission({ signalId: id, draft: { ...riskDraft(id) } });
}

function restoreRiskCommit(id = selectedRiskId) {
  const commit = riskCommits.get(id);
  if (!commit || !riskRecords.has(id)) return;
  const record = riskRecords.get(id);
  record.owner = commit.previous.owner;
  record.reviewKey = commit.previous.reviewKey;
  riskCommits.delete(id);
  renderRiskRows();
}

function renderRiskScope() {
  if (!riskQueue) return;
  const messages = copy[currentLocale()];
  const visibleIds = riskScopeSignals[currentRiskScope];
  if (!visibleIds.includes(selectedRiskId)) selectedRiskId = visibleIds[0];
  for (const row of riskRows) row.hidden = !visibleIds.includes(row.dataset.riskRow);
  const scopeMessageKey = {
    elevated: "riskSavedView",
    unassigned: "riskScopeUnassigned",
    conflicting: "riskScopeConflicting",
    resolved: "riskScopeResolved",
  }[currentRiskScope];
  const scopeValueKey = {
    elevated: "riskScopeValueElevated",
    unassigned: "riskScopeValueUnassigned",
    conflicting: "riskScopeValueConflicting",
    resolved: "riskScopeValueResolved",
  }[currentRiskScope];
  riskQueueTitle.textContent = messages[scopeMessageKey];
  riskLocationTitle.textContent = messages[scopeMessageKey];
  riskScopeValue.textContent = messages[scopeValueKey];
  riskCount.textContent = visibleIds.length === 1
    ? messages.riskCountOne
    : messages.riskCountTemplate.replace("{count}", String(visibleIds.length));
  syncWorkspaceView();
}

function renderRiskSignal({ syncForm = false } = {}) {
  if (!riskQueue) return;
  const messages = copy[currentLocale()];
  const signal = riskSignals[selectedRiskId] || riskSignals["RSK-204"];
  const record = riskRecords.get(selectedRiskId);
  renderRiskRows();
  for (const row of riskRows) {
    const selected = row.dataset.riskRow === selectedRiskId;
    row.dataset.selected = String(selected);
    const button = row.querySelector("[data-risk-signal]");
    if (selected) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  }
  riskInspectorTitle.textContent = selectedRiskId + " · " + signal.entity;
  riskDetailSeverity.textContent = messages[signal.severityKey];
  riskDetailEvidence.textContent = messages[signal.evidenceKey];
  riskDetailOwner.textContent = record?.owner || messages.riskUnassigned;
  riskDetailReview.textContent = messages[record?.reviewKey || signal.reviewKey];
  riskDetailSummary.textContent = messages[signal.summaryKey];
  riskEvidenceSources.forEach((element, index) => {
    element.textContent = messages[riskEvidenceSourceKeys[index]];
  });
  riskEvidenceResults.forEach((element, index) => {
    element.textContent = messages[signal.resultKeys[index]];
  });
  if (syncForm) {
    applyRiskDraft();
  }
}

function ensureRiskDraft(id = selectedRiskId) {
  const messages = copy[currentLocale()];
  const draft = riskDraft(id);
  const needsFixtureDraft = !draft.reason;
  if (!draft.owner) draft.owner = "Mina Chen";
  if (needsFixtureDraft) draft.reason = messages.riskDraftReason;
  if (needsFixtureDraft || !draft.decision) {
    draft.decision = "resolve";
  }
  applyRiskDraft(id);
  if (![...riskReviewForm.elements.decision].some((option) => option.checked)) {
    riskReviewForm.querySelector('input[name="decision"][value="resolve"]').checked = true;
  }
}

function renderRiskState() {
  if (!riskQueue) return;
  const messages = copy[currentLocale()];
  const state = currentRiskState;
  const isEmpty = state === "empty";
  const isCommitted = state === "committed";
  const locked = ["loading", "pending", "permission"].includes(state);
  if (["pending", "committed", "undo", "error"].includes(state)) ensureRiskDraft();
  if (isCommitted) ensureRiskCommit();

  riskQueue.dataset.riskState = state;
  riskQueue.setAttribute("aria-busy", String(state === "loading" || state === "pending"));
  for (const panel of riskStatePanels) panel.hidden = panel.dataset.riskStatePanel !== state;
  riskTableWrap.hidden = isEmpty;
  if (isEmpty) riskCount.textContent = messages.riskCountEmpty;
  else {
    const count = riskScopeSignals[currentRiskScope].length;
    riskCount.textContent = count === 1 ? messages.riskCountOne : messages.riskCountTemplate.replace("{count}", String(count));
  }
  riskReviewForm.hidden = isCommitted || isEmpty;
  riskCommitRecord.hidden = !isCommitted;
  riskReviewFields.disabled = locked;
  for (const button of riskSignalButtons) button.disabled = state === "pending";
  for (const link of riskScopeLinks) {
    if (state === "pending") link.setAttribute("aria-disabled", "true");
    else link.removeAttribute("aria-disabled");
  }
  riskSubmit.textContent = messages[state === "pending" ? "riskRecordingDecision" : "riskRecordDecision"];
  inspectorOpen.disabled = isEmpty;

  const signal = riskSignals[selectedRiskId];
  const record = riskRecords.get(selectedRiskId);
  riskDetailReview.textContent = state === "pending"
    ? messages.riskRecordingDecision
    : state === "error"
        ? messages.riskDraftPreserved
        : messages[record?.reviewKey || signal.reviewKey];
  riskDetailOwner.textContent = record?.owner || messages.riskUnassigned;

  if (isCommitted) {
    const commit = riskCommits.get(selectedRiskId);
    riskCommitOwner.textContent = commit.draft.owner;
    riskCommitDecision.textContent = messages[riskDecisionMessageKeys[commit.draft.decision] || "riskDecisionWatch"];
    riskCommitReason.textContent = commit.draft.reason;
  }
}

function setRiskState(state, { write = true, historyMode = "replace" } = {}) {
  if (!allowedRiskStates.has(state)) return;
  const previous = currentRiskState;
  currentRiskState = state;
  renderRiskState();
  if (write) writeRiskUrl({ mode: historyMode });
  if (state === "empty" && inspectorIsOpen()) setInspector(false, false);
  if (previous === "empty" && state !== "empty" && !overlayLayout.matches) setInspector(true, false);
}

function completeRiskDecision({ retry = false } = {}) {
  window.clearTimeout(riskStateTimer);
  saveRiskDraft();
  const submission = {
    signalId: selectedRiskId,
    draft: { ...riskDraft(selectedRiskId) },
  };
  pendingRiskSubmission = submission;
  setRiskState("pending");
  const shouldFail = !retry
    && new URLSearchParams(window.location.search).get("outcome") === "error"
    && !riskSubmissionFailed;
  riskStateTimer = window.setTimeout(() => {
    if (pendingRiskSubmission !== submission) return;
    if (shouldFail) {
      riskSubmissionFailed = true;
      pendingRiskSubmission = null;
      setRiskState("error");
      riskRetry.focus({ preventScroll: true });
      return;
    }
    commitRiskSubmission(submission);
    pendingRiskSubmission = null;
    setRiskState("committed");
    riskUndoAction.focus({ preventScroll: true });
  }, 240);
}

function updateThemeSwitch(theme) {
  const dark = theme === "dark";
  themeSwitch.setAttribute("aria-checked", String(dark));
  themeSwitch.setAttribute("aria-label", copy[currentLocale()][dark ? "switchToLight" : "switchToDark"]);
  for (const option of themeOptions) {
    const selected = option.dataset.themeOption === root.dataset.themePreference;
    option.setAttribute("aria-checked", String(selected));
    option.setAttribute("aria-current", selected ? "true" : "false");
  }
}

function applyTheme(preference, persist = true) {
  const theme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  themeColor.content = theme === "dark" ? "#08090a" : "#f6f7f8";
  updateThemeSwitch(theme);
  if (persist) localStorage.setItem("kin-reference-theme", preference);
  if (sonnerModulePromise) sonnerModulePromise.then((module) => module.updateToasterTheme(theme, currentLocale()));
}

themeSwitch.addEventListener("click", () => {
  if (transientIsOpen(themeMenu)) setThemeMenu(false, false);
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
media.addEventListener("change", () => {
  if (root.dataset.themePreference === "system") applyTheme("system", false);
});

function applyContrast(enabled, persist = true) {
  root.dataset.contrast = enabled ? "more" : "normal";
  contrastToggle.setAttribute("aria-checked", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

function setLocationOverflow(open, moveFocus = true) {
  setTransientSurface(locationOverflowMenu, open, {
    trigger: locationOverflowTrigger,
    focusTarget: moveFocus ? locationOverflowItems[0] : null,
    restoreFocus: moveFocus && !open,
  });
}

locationOverflowTrigger.addEventListener("click", () => setLocationOverflow(!transientIsOpen(locationOverflowMenu)));
locationOverflowMenu.addEventListener("keydown", (event) => {
  const index = locationOverflowItems.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    locationOverflowItems[(index + (event.key === "ArrowDown" ? 1 : -1) + locationOverflowItems.length) % locationOverflowItems.length].focus();
  }
  if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    locationOverflowItems[event.key === "Home" ? 0 : locationOverflowItems.length - 1].focus();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    setLocationOverflow(false);
  }
});

contrastToggle.addEventListener("click", () => {
  applyContrast(root.dataset.contrast !== "more");
  setLocationOverflow(false);
});

copyLocation.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    locationStatus.textContent = copy[currentLocale()].copiedLink;
  } catch {
    locationStatus.textContent = copy[currentLocale()].copyLinkFailed;
  }
  setLocationOverflow(false);
});

function setLanguageMenu(open, moveFocus = true) {
  setTransientSurface(languageMenu, open, {
    trigger: languageTrigger,
    focusTarget: moveFocus ? languageMenu.querySelector('[role="menuitem"]') : null,
    restoreFocus: moveFocus && !open,
  });
}

function setThemeMenu(open, moveFocus = true) {
  const selected = themeOptions.find((option) => option.getAttribute("aria-checked") === "true") ?? themeOptions[0];
  setTransientSurface(themeMenu, open, {
    trigger: themeMenuTrigger,
    focusTarget: moveFocus ? selected : null,
    restoreFocus: moveFocus && !open,
  });
}

function bindMenuKeyboard(menu, items, close) {
  menu.addEventListener("keydown", (event) => {
    const index = items.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  });
}

languageTrigger.addEventListener("click", () => setLanguageMenu(!transientIsOpen(languageMenu)));
for (const button of localeButtons) {
  button.addEventListener("click", () => {
    translate(button.dataset.localeValue);
    setLanguageMenu(false);
  });
}
themeMenuTrigger.addEventListener("click", () => setThemeMenu(!transientIsOpen(themeMenu)));
for (const option of themeOptions) {
  option.addEventListener("click", () => {
    applyTheme(option.dataset.themeOption);
    setThemeMenu(false);
  });
}
bindMenuKeyboard(languageMenu, localeButtons, () => setLanguageMenu(false));
bindMenuKeyboard(themeMenu, themeOptions, () => setThemeMenu(false));
document.addEventListener("click", (event) => {
  if (transientIsOpen(languageMenu) && !languageControl.contains(event.target)) setLanguageMenu(false, false);
  if (transientIsOpen(themeMenu) && !themeControl.contains(event.target)) setThemeMenu(false, false);
  if (transientIsOpen(locationOverflowMenu) && !locationOverflow.contains(event.target)) setLocationOverflow(false, false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-reference-contrast") applyContrast(event.newValue === "more", false);
  if (event.key === "kin-reference-locale") translate(event.newValue === "en" ? "en" : "zh", false);
});

function inspectorIsOpen() {
  return appShell.classList.contains("inspector-open") || appShell.classList.contains("inspector-closing");
}

let inspectorCloseTimer;

function finishInspectorClose() {
  if (!appShell.classList.contains("inspector-closing")) return;
  window.clearTimeout(inspectorCloseTimer);
  inspectorCloseTimer = undefined;
  appShell.classList.remove("inspector-closing");
  appShell.classList.add("inspector-closed");
}

function syncInspectorMode() {
  if (overlayLayout.matches) {
    inspector.setAttribute("role", "dialog");
    inspector.setAttribute("aria-modal", "true");
  } else {
    inspector.removeAttribute("role");
    inspector.removeAttribute("aria-modal");
  }
}

function setInspector(open, moveFocus = true, returnTarget) {
  window.clearTimeout(inspectorCloseTimer);
  inspectorCloseTimer = undefined;
  if (open && returnTarget) inspectorReturnTarget = returnTarget;
  const modal = overlayLayout.matches && open;
  if (open) {
    appShell.classList.remove("inspector-closing", "inspector-closed");
    appShell.classList.add("inspector-open");
  } else {
    appShell.classList.remove("inspector-open");
    appShell.classList.add("inspector-closing");
    if (reducedMotion.matches) finishInspectorClose();
    else inspectorCloseTimer = window.setTimeout(finishInspectorClose, 190);
  }
  inspectorOpen.setAttribute("aria-expanded", String(open));
  inspector.setAttribute("aria-hidden", String(!open));
  if (open) {
    inspector.inert = false;
    sidebar.inert = modal;
    workspace.inert = modal;
  } else {
    sidebar.inert = false;
    workspace.inert = false;
  }
  document.body.classList.toggle("inspector-modal-open", modal);
  syncInspectorMode();
  if (moveFocus) {
    const target = open
      ? inspectorClose
      : inspectorReturnTarget?.isConnected
        ? inspectorReturnTarget
        : inspectorOpen;
    if (open) {
      inspector.addEventListener("transitionend", (event) => {
        if (event.target === inspector && appShell.classList.contains("inspector-open") && document.activeElement !== target) {
          target.focus({ preventScroll: true });
        }
      }, { once: true });
    }
    target.focus({ preventScroll: true });
    // Chromium may clear focus after the clicked control's ancestor becomes
    // inert. Reassert only when that deferred inert update displaced focus.
    queueMicrotask(() => {
      if (document.activeElement !== target) target.focus({ preventScroll: true });
    });
    // In Chromium the inert propagation can also land during rendering. Keep
    // the synchronous transfer above, then repair that browser-specific loss
    // once without delaying the Inspector's visible response.
    requestAnimationFrame(() => {
      const requestIsCurrent = open
        ? appShell.classList.contains("inspector-open")
        : !appShell.classList.contains("inspector-open");
      if (requestIsCurrent && document.activeElement !== target) {
        target.focus({ preventScroll: true });
      }
      requestAnimationFrame(() => {
        const stillCurrent = open
          ? appShell.classList.contains("inspector-open")
          : !appShell.classList.contains("inspector-open");
        if (stillCurrent && document.activeElement !== target) target.focus({ preventScroll: true });
      });
    });
  }
  if (!open) inspector.inert = true;
}

function closeInspectorFromUser() {
  if (workspaceView === "risk-queue" && overlayLayout.matches && history.state?.kinRiskPanelPushed) {
    history.back();
    return;
  }
  if (workspaceView === "investigation" && investigationController.shouldGoBackOnClose()) {
    history.back();
    return;
  }
  setInspector(false);
  if (workspaceView === "risk-queue") writeRiskUrl({ panel: false });
  if (workspaceView === "investigation") investigationController.writeUrl({ panel: false });
}

inspectorOpen.addEventListener("click", () => {
  if (workspaceView === "risk-queue" && overlayLayout.matches) {
    inspectorReturnTarget = inspectorOpen;
    writeRiskUrl({ mode: "push", panel: true });
  }
  if (workspaceView === "investigation" && overlayLayout.matches) {
    inspectorReturnTarget = inspectorOpen;
    investigationController.openFromToolbar();
  }
  setInspector(true, true, inspectorOpen);
});
inspectorClose.addEventListener("click", closeInspectorFromUser);
inspectorScrim.addEventListener("click", closeInspectorFromUser);

inspector.addEventListener("keydown", (event) => {
  if (!overlayLayout.matches || !inspectorIsOpen() || event.key !== "Tab") return;
  const focusable = [...inspector.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((element) => {
      if (element.disabled || element.closest("[hidden], [inert]")) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    });
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && transientIsOpen(languageMenu)) {
    setLanguageMenu(false);
  } else if (event.key === "Escape" && transientIsOpen(themeMenu)) {
    setThemeMenu(false);
  } else if (event.key === "Escape" && transientIsOpen(locationOverflowMenu)) {
    setLocationOverflow(false);
  } else if (event.key === "Escape" && inspectorIsOpen()) {
    closeInspectorFromUser();
  }
});

async function showToast(kind) {
  sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
  const module = await sonnerModulePromise;
  const messages = copy[currentLocale()];
  const isFollow = kind === "follow";
  const isError = kind === "error";
  module.showKinToast({
    title: messages[isError ? "errorTitle" : isFollow ? "followedTitle" : "scanTitle"],
    description: messages[isError ? "errorToastDescription" : isFollow ? "followedDescription" : "scanDescription"],
    actionLabel: messages[isError ? "retry" : isFollow ? "undo" : "viewTask"],
    undoTitle: messages[isError ? "retryQueued" : isFollow ? "undone" : "taskOpened"],
    theme: root.dataset.theme,
    locale: currentLocale(),
    tone: isError ? "error" : "default",
  });
}

for (const trigger of document.querySelectorAll("[data-toast]")) {
  trigger.addEventListener("click", () => showToast(trigger.dataset.toast));
}

const motionToggle = document.querySelector("[data-motion-toggle]");
motionToggle.addEventListener("click", () => {
  const active = motionToggle.getAttribute("aria-pressed") !== "true";
  motionToggle.setAttribute("aria-pressed", String(active));
  motionToggle.querySelector("span").textContent = copy[currentLocale()][active ? "watchingButton" : "watchButton"];
});

const asyncButton = document.querySelector("[data-motion-async]");
asyncButton.addEventListener("click", () => {
  if (asyncButton.disabled) return;
  const messages = copy[currentLocale()];
  const label = asyncButton.querySelector("[data-motion-label]");
  asyncButton.disabled = true;
  asyncButton.classList.add("is-loading");
  label.textContent = messages.savingButton;
  window.setTimeout(async () => {
    asyncButton.classList.remove("is-loading");
    asyncButton.classList.add("is-success");
    label.textContent = copy[currentLocale()].savedButton;
    sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
    const module = await sonnerModulePromise;
    const currentMessages = copy[currentLocale()];
    module.showKinToast({
      title: currentMessages.savedTitle,
      description: currentMessages.savedDescription,
      theme: root.dataset.theme,
      locale: currentLocale(),
      tone: "success",
    });
    window.setTimeout(() => {
      asyncButton.classList.remove("is-success");
      asyncButton.disabled = false;
      label.textContent = copy[currentLocale()].saveButton;
    }, 1100);
  }, 700);
});

document.querySelector("[data-motion-task]").addEventListener("click", async () => {
  sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
  const module = await sonnerModulePromise;
  const messages = copy[currentLocale()];
  module.showKinTaskToast({
    loadingTitle: messages.exportLoading,
    successTitle: messages.exportSuccess,
    description: messages.exportDescription,
    theme: root.dataset.theme,
    locale: currentLocale(),
  });
});

function setRiskFieldValidity(field, error, invalid) {
  field.setAttribute("aria-invalid", String(invalid));
  error.hidden = !invalid;
}

function clearRiskFormErrors() {
  setRiskFieldValidity(riskOwner, riskOwnerError, false);
  setRiskFieldValidity(riskReason, riskReasonError, false);
}

function validateRiskReview() {
  const ownerInvalid = !riskOwner.value;
  const reasonInvalid = !riskReason.value.trim();
  setRiskFieldValidity(riskOwner, riskOwnerError, ownerInvalid);
  setRiskFieldValidity(riskReason, riskReasonError, reasonInvalid);
  if (ownerInvalid) riskOwner.focus({ preventScroll: true });
  else if (reasonInvalid) riskReason.focus({ preventScroll: true });
  return !ownerInvalid && !reasonInvalid;
}

for (const link of riskScopeLinks) {
  link.addEventListener("click", (event) => {
    if (workspaceView !== "risk-queue") return;
    event.preventDefault();
    if (currentRiskState === "pending") return;
    saveRiskDraft();
    currentRiskScope = link.dataset.riskScope;
    selectedRiskId = riskScopeSignals[currentRiskScope][0];
    if (currentRiskState !== "permission") currentRiskState = "normal";
    clearRiskFormErrors();
    renderRiskScope();
    renderRiskSignal({ syncForm: true });
    renderRiskState();
    writeRiskUrl({ mode: "push", panel: false });
    if (overlayLayout.matches) setInspector(false, false);
  });
}

for (const button of riskSignalButtons) {
  button.addEventListener("click", () => {
    if (currentRiskState === "pending") return;
    const changed = selectedRiskId !== button.dataset.riskSignal;
    saveRiskDraft();
    selectedRiskId = button.dataset.riskSignal;
    if (changed && currentRiskState !== "permission") currentRiskState = "normal";
    clearRiskFormErrors();
    renderRiskSignal({ syncForm: changed });
    renderRiskState();
    if (overlayLayout.matches) {
      if (changed) writeRiskUrl({ mode: "push", panel: false });
      writeRiskUrl({ mode: "push", panel: true });
      setInspector(true, true, button);
    } else {
      writeRiskUrl({ mode: "push", panel: false });
    }
  });
}

riskReviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateRiskReview()) return;
  completeRiskDecision();
});

riskOwner.addEventListener("change", () => {
  setRiskFieldValidity(riskOwner, riskOwnerError, false);
  saveRiskDraft();
});
riskReason.addEventListener("input", () => {
  if (riskReason.value.trim()) setRiskFieldValidity(riskReason, riskReasonError, false);
  saveRiskDraft();
});
for (const decision of riskReviewForm.elements.decision) {
  decision.addEventListener("change", () => saveRiskDraft());
}

riskUndoAction.addEventListener("click", () => {
  saveRiskDraft();
  restoreRiskCommit();
  setRiskState("undo");
  riskSubmit.focus();
});

riskRetry.addEventListener("click", () => completeRiskDecision({ retry: true }));
riskRefresh.addEventListener("click", () => {
  window.clearTimeout(riskStateTimer);
  pendingRiskSubmission = null;
  setRiskState("loading");
  riskStateTimer = window.setTimeout(() => setRiskState("normal"), 320);
});

overlayLayout.addEventListener("change", (event) => {
  if (workspaceView === "investigation") {
    investigationController.handleOverlayChange(event.matches);
    return;
  }
  const emptyRiskQueue = workspaceView === "risk-queue" && currentRiskState === "empty";
  setInspector(!event.matches && !emptyRiskQueue, false);
  if (workspaceView === "risk-queue") writeRiskUrl({ panel: false });
});

window.addEventListener("popstate", () => {
  if (workspaceView === "risk-queue") {
    window.clearTimeout(riskStateTimer);
    pendingRiskSubmission = null;
    saveRiskDraft();
    const params = new URLSearchParams(window.location.search);
    const nextScope = allowedRiskScopes.has(params.get("scope")) ? params.get("scope") : "elevated";
    const requestedSignal = riskSignals[params.get("signal")] ? params.get("signal") : riskScopeSignals[nextScope][0];
    const nextSignal = riskScopeSignals[nextScope].includes(requestedSignal) ? requestedSignal : riskScopeSignals[nextScope][0];
    const changed = selectedRiskId !== nextSignal;
    currentRiskScope = nextScope;
    selectedRiskId = nextSignal;
    currentRiskState = allowedRiskStates.has(params.get("state")) ? params.get("state") : "normal";
    riskSubmissionFailed = currentRiskState === "error";
    clearRiskFormErrors();
    renderRiskScope();
    renderRiskSignal({ syncForm: changed });
    renderRiskState();
    const shouldOpen = !overlayLayout.matches
      ? currentRiskState !== "empty"
      : params.get("panel") === "review" && currentRiskState !== "empty";
    const wasOpen = inspectorIsOpen();
    const selectedButton = document.querySelector(`[data-risk-signal="${selectedRiskId}"]`);
    inspectorReturnTarget = selectedButton || inspectorOpen;
    setInspector(shouldOpen, shouldOpen !== wasOpen, inspectorReturnTarget);
    return;
  }
  if (workspaceView === "investigation") {
    investigationController.handlePopState();
  }
});
syncWorkspaceView();
applyTheme(root.dataset.themePreference || "system", false);
applyContrast(root.dataset.contrast === "more", false);
const requestedLocale = new URLSearchParams(window.location.search).get("lang");
const initialLocale = requestedLocale === "en" ? "en" : requestedLocale === "zh-CN" ? "zh" : root.dataset.locale === "en" ? "en" : "zh";
if (workspaceView === "risk-queue") {
  renderRiskScope();
  renderRiskSignal({ syncForm: true });
} else if (workspaceView === "investigation") {
  investigationController.initialize();
}
const initialRiskPanelOpen = workspaceView === "risk-queue"
  && overlayLayout.matches
  && initialRiskPanelRequested
  && currentRiskState !== "empty";
const initialInvestigationPanelOpen = workspaceView === "investigation" && investigationController.initialPanelOpen();
const initialInspectorOpen = workspaceView === "risk-queue"
  ? currentRiskState !== "empty" && (!overlayLayout.matches || initialRiskPanelRequested)
  : workspaceView === "investigation"
      ? investigationController.initialInspectorOpen()
      : !overlayLayout.matches;
const initialInspectorReturnTarget = workspaceView === "risk-queue"
  ? document.querySelector(`[data-risk-signal="${selectedRiskId}"]`) || inspectorOpen
  : workspaceView === "investigation"
      ? investigationController.initialReturnTarget()
      : inspectorOpen;
setInspector(initialInspectorOpen, initialRiskPanelOpen || initialInvestigationPanelOpen, initialInspectorReturnTarget);
translate(initialLocale, false);
if (workspaceView === "risk-queue") writeRiskUrl({ panel: initialRiskPanelOpen });
if (workspaceView === "investigation") investigationController.writeUrl({ panel: initialInvestigationPanelOpen });

createIcons({
  icons: {
    Activity,
    Check,
    ChevronDown,
    CirclePlay,
    Contrast,
    Database,
    Ellipsis,
    ExternalLink,
    FileSearch,
    Languages,
    LayoutDashboard,
    Link,
    LoaderCircle,
    Moon,
    Palette,
    PanelRight,
    RefreshCw,
    Pause,
    Save,
    ScanLine,
    Search,
    Star,
    Sun,
    TriangleAlert,
    X,
  },
  attrs: { "aria-hidden": "true", "stroke-width": "1.5" },
});
