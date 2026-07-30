import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  Archive,
  ArrowDown,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Command as CommandIcon,
  Copy,
  Database,
  FileCode2,
  FileSearch,
  Globe2,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  PackageSearch,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { KinCommandMenu } from "@kin-design/react/cmdk";
import { KinToaster, kinToast } from "@kin-design/react/sonner";

const specimenIds = new Set([
  "button",
  "command-menu",
  "evidence-list",
  "suggested-change-review",
  "execution-preview",
  "background-task-queue",
  "data-table",
  "authentication-dialog",
  "app-shell",
  "agent-activity-trace",
  "code-block",
  "story-timeline",
]);

const copy = {
  en: {
    localFixture: "Local interaction fixture",
    stable: "Stable",
    candidate: "Candidate",
    close: "Close",
    undo: "Undo",
    retry: "Retry",
    copied: "Link copied",
    copyFailed: "Copy permission was unavailable",
    buttons: {
      title: "Actions with distinct consequences",
      body: "Hierarchy, content, and feedback change with the job. A button does not become a new component because its label changed.",
      hierarchy: "Hierarchy",
      primary: "Save changes",
      secondary: "Export records",
      quiet: "Copy link",
      danger: "Delete draft",
      content: "Content and state",
      iconOnly: "Open notifications",
      archive: "Archive",
      loading: "Saving…",
      saved: "Changes saved",
      exported: "Export task created",
      archived: "Draft archived",
      removed: "Draft deleted",
      restored: "Draft restored",
      confirm: "Delete this local draft?",
      confirmBody: "The example keeps the action reversible so recovery remains visible.",
      cancel: "Cancel",
      delete: "Delete draft",
      disabled: "Unavailable",
      note: "Notifications appear only after a user action.",
    },
    command: {
      title: "Command menu",
      body: "Search, navigation, and contextual actions share one keyboard path.",
      open: "Open command menu",
      label: "KIN command menu",
      input: "Search commands",
      placeholder: "Search pages or actions…",
      empty: "No matching command",
      goTo: "Go to",
      actions: "Actions",
      overview: "Open overview",
      evidence: "Open evidence",
      tasks: "Open background tasks",
      save: "Save current view",
      copy: "Copy current link",
      selected: "Command completed",
    },
    evidence: {
      title: "Evidence and citations",
      body: "A conclusion remains mapped to support, missing context, expiry, and conflicting sources.",
      count: "3 sources",
      heading: "Price evidence",
      intro: "The current price cannot be published until the conflict is resolved.",
      internal: "Internal price record",
      internalBody: "Approved value: CNY 1,299.00",
      campaign: "Campaign calendar",
      campaignBody: "Promotion state still needs operator confirmation.",
      external: "External channel snapshot",
      externalBody: "Shows CNY 1,399.00 and conflicts with the approved record.",
      verified: "Verified",
      partial: "Partly verified",
      conflict: "Conflict",
      source: "Source",
      observed: "Observed",
      status: "Status",
      next: "Next step",
      nextInternal: "Use as the approved baseline.",
      nextCampaign: "Confirm whether the promotion is still active.",
      nextExternal: "Do not publish until the source is reconciled.",
    },
    review: {
      title: "Suggested price change",
      body: "Proposal, approval, execution, and completion remain separate states.",
      current: "Current value",
      proposed: "Suggested value",
      reason: "Reason",
      reasonValue: "Matches the approved internal price record.",
      impact: "Impact",
      impactValue: "Website and two sales channels; inventory is unchanged.",
      evidence: "Evidence",
      reject: "Reject",
      edit: "Edit suggestion",
      accept: "Accept suggestion",
      accepted: "Suggestion accepted for execution",
      rejected: "Suggestion rejected",
      edited: "Editing opened",
      pending: "Awaiting review",
      acceptedState: "Accepted",
      rejectedState: "Rejected",
    },
    execution: {
      title: "Execution preview",
      body: "Show the exact target, writes, and recoverable effects before a consequential action runs.",
      target: "Target",
      targetValue: "Product PRD-184 · approved sales channels",
      writes: "Writes",
      writesValue: "Price value and publication timestamp",
      effect: "External effect",
      effectValue: "Two storefront updates",
      rollback: "Recovery",
      rollbackValue: "Restore the previous approved price",
      run: "Run local preview",
      ready: "Ready to preview",
      running: "Executing local fixture…",
      complete: "Preview completed",
      reset: "Reset",
      queued: "Execution started",
      noExternal: "No external system is connected.",
    },
    tasks: {
      title: "Background task queue",
      body: "Persistent work exposes progress, failures, results, and recovery without blocking the workspace.",
      export: "Export approved catalog",
      exportBody: "Preparing 2,418 records",
      sync: "Sync campaign prices",
      syncBody: "Rate limit interrupted the last run",
      report: "Generate discrepancy report",
      reportBody: "Completed · 14 findings",
      running: "Running",
      failed: "Failed",
      complete: "Complete",
      retrying: "Retrying",
      retryQueued: "Task submitted again",
      view: "View result",
    },
    table: {
      title: "Operational records",
      body: "Dense rows preserve scanning, sorting, selection, and exact status meaning.",
      product: "Product",
      price: "Price",
      channel: "Channel",
      state: "State",
      updated: "Updated",
      approved: "Approved",
      review: "Needs review",
      draft: "Draft",
      selected: "Selected",
      count: "3 records",
    },
    auth: {
      contextTitle: "Authentication belongs to the interrupted task",
      contextBody: "The dialog returns focus to the action that opened it. No credential is sent or stored in this local fixture.",
      reopen: "Open sign-in dialog",
      title: "Sign in to continue",
      body: "Use your work account to resume the approval flow.",
      email: "Work email",
      emailPlaceholder: "name@company.com",
      cancel: "Cancel",
      continue: "Continue",
      submitted: "Authentication fixture submitted",
    },
    shell: {
      title: "Workspace shell",
      overview: "Overview",
      catalog: "Catalog",
      evidence: "Evidence",
      tasks: "Tasks",
      location: "Catalog / Price review",
      records: "3 records",
      heading: "Products needing attention",
      state: "State",
      owner: "Owner",
      lastChange: "Last change",
      selected: "Selected record",
      review: "Needs review",
      approved: "Approved",
      operator: "Merchandising",
      today: "Today, 09:42",
    },
    trace: {
      title: "Agent activity trace",
      body: "Expose actions, tools, inputs, and results that can be audited. Never reveal hidden chain-of-thought.",
      complete: "Complete",
      running: "Running",
      waiting: "Waiting",
      failed: "Failed",
      overallState: "Run state",
      started: "Started",
      startedValue: "2026-07-30 09:40:11 UTC+8",
      initiatedBy: "Initiated by",
      initiatedByValue: "Local fixture operator",
      reviewPath: "Review and recovery",
      reviewPathValue: "Open local review route",
      reviewPathBody: "Approve, reject, or recover this fictional run from one governed path.",
      received: "Request received",
      receivedBody: "Review PRD-184 for channel price conflicts.",
      retrieved: "Evidence retrieved",
      retrievedBody: "Three permitted sources returned.",
      compared: "Records compared",
      comparedBody: "One conflict found; no external write attempted.",
      proposed: "Suggested change prepared",
      proposedBody: "Awaiting operator approval.",
      tool: "Tool activity",
      toolBody: "catalog.search · 3 results · 184ms",
      input: "Input",
      inputValue: "PRD-184, approved sources only",
      result: "Result",
      resultValue: "One conflict; confidence not used as approval.",
      permission: "Permission",
      permissionValue: "Read only",
    },
    code: {
      title: "Code block",
      body: "Long lines, copy feedback, language metadata, and wrapping remain usable without turning code into decoration.",
      filename: "pricing-rule.ts",
      copy: "Copy code",
      copied: "Code copied",
      wrap: "Wrap lines",
      unwrap: "Do not wrap lines",
      lineCount: "9 lines",
    },
    timeline: {
      title: "One story, two orientations",
      body: "The same ordered facts scroll horizontally on wide screens and read vertically on narrow screens.",
      cue: "Use arrow keys; scroll when needed",
      detail: "Selected milestone",
      source: "Source",
      sourceValue: "Fictional local fixture",
      fixtureNotice: "Fictional scenario — not KIN release history.",
      introduced: "Review opened",
      introducedBody: "A product operator starts a local price review.",
      evidence: "Evidence gathered",
      evidenceBody: "Three permitted sources are attached to the record.",
      mobile: "Conflict identified",
      mobileBody: "One external price differs from the approved internal value.",
      agents: "Decision recorded",
      agentsBody: "The operator accepts a proposed correction after review.",
      current: "Recovery checked",
      currentBody: "The previous approved value remains available for recovery.",
    },
  },
  zh: {
    localFixture: "本地交互示例",
    stable: "稳定",
    candidate: "候选",
    close: "关闭",
    undo: "撤销",
    retry: "重试",
    copied: "链接已复制",
    copyFailed: "无法访问剪贴板",
    buttons: {
      title: "不同后果对应不同操作",
      body: "层级、内容和反馈随任务改变。只更换按钮文案，不会产生一个新组件。",
      hierarchy: "操作层级",
      primary: "保存更改",
      secondary: "导出记录",
      quiet: "复制链接",
      danger: "删除草稿",
      content: "内容与状态",
      iconOnly: "打开通知",
      archive: "归档",
      loading: "保存中…",
      saved: "更改已保存",
      exported: "导出任务已创建",
      archived: "草稿已归档",
      removed: "草稿已删除",
      restored: "草稿已恢复",
      confirm: "删除这份本地草稿？",
      confirmBody: "示例保留撤销入口，让恢复路径保持可见。",
      cancel: "取消",
      delete: "删除草稿",
      disabled: "暂不可用",
      note: "只有用户主动操作后才显示通知。",
    },
    command: {
      title: "命令菜单",
      body: "搜索、导航和当前操作共用一条键盘路径。",
      open: "打开命令菜单",
      label: "KIN 命令菜单",
      input: "搜索命令",
      placeholder: "搜索页面或操作…",
      empty: "没有匹配的命令",
      goTo: "前往",
      actions: "操作",
      overview: "打开概览",
      evidence: "打开证据",
      tasks: "打开后台任务",
      save: "保存当前视图",
      copy: "复制当前链接",
      selected: "命令已执行",
    },
    evidence: {
      title: "证据与引用",
      body: "结论始终映射到支持材料、缺失信息、有效期和冲突来源。",
      count: "3 个来源",
      heading: "价格证据",
      intro: "解决冲突前，当前价格不能发布。",
      internal: "内部价格记录",
      internalBody: "已批准价格：CNY 1,299.00",
      campaign: "活动日历",
      campaignBody: "活动状态仍需运营人员确认。",
      external: "外部渠道快照",
      externalBody: "显示 CNY 1,399.00，与已批准记录冲突。",
      verified: "已核验",
      partial: "部分核验",
      conflict: "存在冲突",
      source: "来源",
      observed: "记录时间",
      status: "状态",
      next: "下一步",
      nextInternal: "作为已批准基准使用。",
      nextCampaign: "确认活动是否仍在进行。",
      nextExternal: "来源完成核对前不要发布。",
    },
    review: {
      title: "建议调整商品价格",
      body: "提案、批准、执行和完成是四种不同状态。",
      current: "当前值",
      proposed: "建议值",
      reason: "原因",
      reasonValue: "与已批准的内部价格记录一致。",
      impact: "影响",
      impactValue: "官网与两个销售渠道；库存不变。",
      evidence: "依据",
      reject: "拒绝",
      edit: "编辑建议",
      accept: "接受建议",
      accepted: "建议已接受，等待执行",
      rejected: "建议已拒绝",
      edited: "已打开编辑",
      pending: "待复核",
      acceptedState: "已接受",
      rejectedState: "已拒绝",
    },
    execution: {
      title: "执行预览",
      body: "在高后果操作运行前，先展示准确目标、写入内容、外部影响和恢复方式。",
      target: "目标",
      targetValue: "商品 PRD-184 · 已批准销售渠道",
      writes: "写入",
      writesValue: "价格与发布时间",
      effect: "外部影响",
      effectValue: "更新两个店面",
      rollback: "恢复",
      rollbackValue: "恢复上一版已批准价格",
      run: "运行本地预览",
      ready: "可以运行预览",
      running: "正在执行本地示例…",
      complete: "预览已完成",
      reset: "重置",
      queued: "执行已开始",
      noExternal: "未连接任何外部系统。",
    },
    tasks: {
      title: "后台任务队列",
      body: "持久任务显示进度、失败、结果和恢复入口，不阻塞当前工作区。",
      export: "导出已批准商品目录",
      exportBody: "正在准备 2,418 条记录",
      sync: "同步活动价格",
      syncBody: "上次运行因限流中断",
      report: "生成差异报告",
      reportBody: "已完成 · 14 项发现",
      running: "运行中",
      failed: "失败",
      complete: "已完成",
      retrying: "重试中",
      retryQueued: "任务已重新提交",
      view: "查看结果",
    },
    table: {
      title: "运营记录",
      body: "紧凑数据行同时支持扫读、排序、选择和准确的状态语义。",
      product: "商品",
      price: "价格",
      channel: "渠道",
      state: "状态",
      updated: "更新时间",
      approved: "已批准",
      review: "待复核",
      draft: "草稿",
      selected: "已选择",
      count: "3 条记录",
    },
    auth: {
      contextTitle: "身份验证属于被中断的任务",
      contextBody: "关闭后，焦点返回打开弹窗的操作。本地示例不会发送或保存凭据。",
      reopen: "打开登录弹窗",
      title: "登录后继续",
      body: "使用工作账户继续审批流程。",
      email: "工作邮箱",
      emailPlaceholder: "name@company.com",
      cancel: "取消",
      continue: "继续",
      submitted: "身份验证示例已提交",
    },
    shell: {
      title: "工作台框架",
      overview: "概览",
      catalog: "商品目录",
      evidence: "证据",
      tasks: "任务",
      location: "商品目录 / 价格复核",
      records: "3 条记录",
      heading: "需要处理的商品",
      state: "状态",
      owner: "负责人",
      lastChange: "最近变化",
      selected: "当前记录",
      review: "待复核",
      approved: "已批准",
      operator: "商品运营",
      today: "今天 09:42",
    },
    trace: {
      title: "智能体活动记录",
      body: "展示可审计的操作、工具、输入和结果；不要暴露隐藏推理过程。",
      complete: "已完成",
      running: "运行中",
      waiting: "等待中",
      failed: "失败",
      overallState: "运行状态",
      started: "开始时间",
      startedValue: "2026-07-30 09:40:11 UTC+8",
      initiatedBy: "发起人",
      initiatedByValue: "本地示例操作员",
      reviewPath: "复核与恢复",
      reviewPathValue: "打开本地复核路径",
      reviewPathBody: "在同一受约束路径中批准、拒绝或恢复这次虚构运行。",
      received: "收到请求",
      receivedBody: "检查 PRD-184 的渠道价格冲突。",
      retrieved: "已获取证据",
      retrievedBody: "三个获准来源返回结果。",
      compared: "已对比记录",
      comparedBody: "发现一处冲突；未尝试外部写入。",
      proposed: "已准备变更建议",
      proposedBody: "等待运营人员批准。",
      tool: "工具活动",
      toolBody: "catalog.search · 3 个结果 · 184ms",
      input: "输入",
      inputValue: "PRD-184，仅限已批准来源",
      result: "结果",
      resultValue: "发现一处冲突；置信度不代替批准。",
      permission: "权限",
      permissionValue: "只读",
    },
    code: {
      title: "代码块",
      body: "长行、复制反馈、语言信息和换行都保持可用，代码不只是装饰。",
      filename: "pricing-rule.ts",
      copy: "复制代码",
      copied: "代码已复制",
      wrap: "自动换行",
      unwrap: "不自动换行",
      lineCount: "9 行",
    },
    timeline: {
      title: "同一个故事，两种方向",
      body: "同一组有序事实在宽屏横向滚动，在窄屏纵向阅读，含义不变。",
      cue: "使用方向键；内容超出时可滚动",
      detail: "当前里程碑",
      source: "来源",
      sourceValue: "虚构的本地示例",
      fixtureNotice: "虚构场景，不代表 KIN 的真实发布历史。",
      introduced: "开始复核",
      introducedBody: "商品运营人员发起一次本地价格复核。",
      evidence: "收集证据",
      evidenceBody: "三项获准来源已附加到记录。",
      mobile: "识别冲突",
      mobileBody: "一个外部价格与已批准的内部价格不同。",
      agents: "记录决定",
      agentsBody: "运营人员复核后接受建议调整。",
      current: "检查恢复",
      currentBody: "上一版已批准价格仍可用于恢复。",
    },
  },
};

function useResolvedTheme() {
  const [theme, setTheme] = React.useState(
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );

  React.useEffect(() => {
    const root = document.documentElement;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const updateResolvedTheme = (resolved) => {
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
      themeColor?.setAttribute("content", resolved === "dark" ? "#08090a" : "#f7f8fa");
      setTheme(resolved);
    };
    const resolvePreference = (preference) => (
      preference === "system" ? (media.matches ? "dark" : "light") : preference
    );
    const syncFromRoot = () => {
      const resolved = root.dataset.theme === "light" ? "light" : "dark";
      root.style.colorScheme = resolved;
      themeColor?.setAttribute("content", resolved === "dark" ? "#08090a" : "#f7f8fa");
      setTheme(resolved);
    };
    const onSystemChange = () => {
      if (root.dataset.themePreference === "system") {
        updateResolvedTheme(media.matches ? "dark" : "light");
      }
    };
    const onStorage = (event) => {
      if (event.key !== "kin-reference-theme") return;
      const preference = ["light", "dark", "system"].includes(event.newValue)
        ? event.newValue
        : "system";
      root.dataset.themePreference = preference;
      updateResolvedTheme(resolvePreference(preference));
    };
    const observer = new MutationObserver(syncFromRoot);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme", "data-theme-preference"],
    });
    media.addEventListener("change", onSystemChange);
    addEventListener("storage", onStorage);
    syncFromRoot();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", onSystemChange);
      removeEventListener("storage", onStorage);
    };
  }, []);

  return theme;
}

function SpecimenFrame({ title, body, status = "stable", actions, children, footer, flush = false }) {
  const c = copy[document.documentElement.lang === "zh-CN" ? "zh" : "en"];
  return (
    <main id="specimen-root" className="kin-showcase-specimen" tabIndex={-1}>
      <section className={`specimen-canvas${flush ? " specimen-canvas--flush" : ""}`}>
        <header className="specimen-bar">
          <div className="specimen-title">
            <strong>{title}</strong>
            <span>{body}</span>
          </div>
          <div className="specimen-actions">
            <span className="kin-status" data-tone={status === "candidate" ? "warning" : "positive"}>
              {status === "candidate" ? c.candidate : c.stable}
            </span>
            {actions}
          </div>
        </header>
        {children}
        {footer ? <footer className="specimen-footer">{footer}</footer> : null}
      </section>
    </main>
  );
}

function ButtonSpecimen({ c }) {
  const [saving, setSaving] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      kinToast.success(c.buttons.saved);
    }, 620);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      kinToast.success(c.copied);
    } catch {
      kinToast.error(c.copyFailed);
    }
  };

  const remove = () => {
    setConfirming(false);
    kinToast.undoable(c.buttons.removed, {
      undoLabel: c.undo,
      onUndo: () => kinToast.success(c.buttons.restored),
    });
  };

  return (
    <SpecimenFrame
      title={c.buttons.title}
      body={c.buttons.body}
      footer={<><span>{c.buttons.note}</span><span>{c.localFixture}</span></>}
    >
      <div className="button-specimen-grid">
        <section className="button-specimen-group">
          <h2>{c.buttons.hierarchy}</h2>
          <div className="button-specimen-row">
            <button className="kin-button kin-button--primary" type="button" onClick={save} disabled={saving}>
              {saving ? <LoaderCircle className="spinning" aria-hidden="true" /> : <Save aria-hidden="true" />}
              {saving ? c.buttons.loading : c.buttons.primary}
            </button>
            <button
              className="kin-button"
              type="button"
              onClick={() => kinToast.success(c.buttons.exported)}
            >
              <ArrowDown aria-hidden="true" />
              {c.buttons.secondary}
            </button>
            <button className="kin-button kin-button--ghost" type="button" onClick={copyLink}>
              <Copy aria-hidden="true" />
              {c.buttons.quiet}
            </button>
            <button className="kin-button kin-button--danger" type="button" onClick={() => setConfirming(true)}>
              <Trash2 aria-hidden="true" />
              {c.buttons.danger}
            </button>
          </div>
        </section>
        <section className="button-specimen-group">
          <h2>{c.buttons.content}</h2>
          <div className="button-specimen-row">
            <button
              className="kin-icon-button"
              type="button"
              aria-label={c.buttons.iconOnly}
              onClick={() => kinToast.message(c.buttons.note)}
            >
              <Bell aria-hidden="true" />
            </button>
            <button
              className="kin-button"
              type="button"
              onClick={() => kinToast.success(c.buttons.archived)}
            >
              <Archive aria-hidden="true" />
              {c.buttons.archive}
            </button>
            <button className="kin-button" type="button" disabled>
              {c.buttons.disabled}
            </button>
          </div>
        </section>
      </div>
      {confirming ? (
        <div className="confirmation-strip" role="region" aria-labelledby="delete-title">
          <div>
            <strong id="delete-title">{c.buttons.confirm}</strong>
            <span>{c.buttons.confirmBody}</span>
          </div>
          <div className="inline-actions">
            <button className="kin-button" type="button" onClick={() => setConfirming(false)}>
              {c.buttons.cancel}
            </button>
            <button className="kin-button kin-button--danger" type="button" onClick={remove}>
              {c.buttons.delete}
            </button>
          </div>
        </div>
      ) : null}
    </SpecimenFrame>
  );
}

function CommandMenuSpecimen({ c }) {
  const [open, setOpen] = React.useState(true);
  const triggerRef = React.useRef(null);
  const groups = React.useMemo(
    () => [
      {
        id: "go-to",
        heading: c.command.goTo,
        items: [
          {
            id: "overview",
            value: c.command.overview,
            label: <><LayoutDashboard aria-hidden="true" size={15} />{c.command.overview}</>,
            onSelect: () => kinToast.success(c.command.selected),
          },
          {
            id: "evidence",
            value: c.command.evidence,
            label: <><FileSearch aria-hidden="true" size={15} />{c.command.evidence}</>,
            onSelect: () => kinToast.success(c.command.selected),
          },
          {
            id: "tasks",
            value: c.command.tasks,
            label: <><ListChecks aria-hidden="true" size={15} />{c.command.tasks}</>,
            onSelect: () => kinToast.success(c.command.selected),
          },
        ],
      },
      {
        id: "actions",
        heading: c.command.actions,
        items: [
          {
            id: "save",
            value: c.command.save,
            shortcut: "S",
            label: <><Save aria-hidden="true" size={15} />{c.command.save}</>,
            onSelect: () => kinToast.success(c.command.selected),
          },
          {
            id: "copy",
            value: c.command.copy,
            shortcut: "C",
            label: <><Copy aria-hidden="true" size={15} />{c.command.copy}</>,
            onSelect: () => kinToast.success(c.command.selected),
          },
        ],
      },
    ],
    [c],
  );

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.isComposing || event.defaultPrevented) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      setOpen((value) => !value);
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <SpecimenFrame
      title={c.command.title}
      body={c.command.body}
      actions={
        <button ref={triggerRef} className="kin-button" type="button" onClick={() => setOpen(true)}>
          <CommandIcon aria-hidden="true" />
          {c.command.open}
        </button>
      }
      footer={<><span>Ctrl / ⌘ K</span><span>cmdk</span></>}
    >
      <div className="command-stage">
        <div className="command-stage__context" aria-hidden="true">
          <Search />
          <span>{c.command.placeholder}</span>
          <kbd>Ctrl K</kbd>
        </div>
      </div>
      <KinCommandMenu
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        label={c.command.label}
        inputLabel={c.command.input}
        placeholder={c.command.placeholder}
        emptyLabel={c.command.empty}
        invocation="keyboard"
        returnFocusRef={triggerRef}
      />
    </SpecimenFrame>
  );
}

function EvidenceSpecimen({ c }) {
  const evidence = [
    {
      id: "internal",
      title: c.evidence.internal,
      body: c.evidence.internalBody,
      status: c.evidence.verified,
      tone: "positive",
      source: "Pricing ledger",
      observed: "Today, 09:40",
      next: c.evidence.nextInternal,
    },
    {
      id: "campaign",
      title: c.evidence.campaign,
      body: c.evidence.campaignBody,
      status: c.evidence.partial,
      tone: "warning",
      source: "Campaign record",
      observed: "Yesterday, 17:20",
      next: c.evidence.nextCampaign,
    },
    {
      id: "external",
      title: c.evidence.external,
      body: c.evidence.externalBody,
      status: c.evidence.conflict,
      tone: "negative",
      source: "Channel snapshot",
      observed: "Today, 09:31",
      next: c.evidence.nextExternal,
    },
  ];
  const [selected, setSelected] = React.useState("external");
  const active = evidence.find((item) => item.id === selected) ?? evidence[0];

  return (
    <SpecimenFrame
      title={c.evidence.heading}
      body={c.evidence.intro}
      actions={<span className="specimen-meta">{c.evidence.count}</span>}
      footer={<><span>{c.evidence.body}</span><span>{c.localFixture}</span></>}
    >
      <div className="evidence-layout">
        <ol className="evidence-list">
          {evidence.map((item, index) => (
            <li key={item.id}>
              <button
                className="evidence-row"
                type="button"
                aria-pressed={selected === item.id}
                onClick={() => setSelected(item.id)}
              >
                <span className="evidence-index">[{index + 1}]</span>
                <span>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </span>
                <span className="kin-status" data-tone={item.tone}>{item.status}</span>
              </button>
            </li>
          ))}
        </ol>
        <aside className="evidence-detail" aria-live="polite">
          <h3>{active.title}</h3>
          <dl>
            <div><dt>{c.evidence.source}</dt><dd>{active.source}</dd></div>
            <div><dt>{c.evidence.observed}</dt><dd>{active.observed}</dd></div>
            <div><dt>{c.evidence.status}</dt><dd><span className="kin-status" data-tone={active.tone}>{active.status}</span></dd></div>
            <div><dt>{c.evidence.next}</dt><dd>{active.next}</dd></div>
          </dl>
        </aside>
      </div>
    </SpecimenFrame>
  );
}

function SuggestedChangeSpecimen({ c }) {
  const [state, setState] = React.useState("pending");
  const status =
    state === "accepted" ? c.review.acceptedState : state === "rejected" ? c.review.rejectedState : c.review.pending;

  const decide = (next) => {
    setState(next);
    kinToast.success(next === "accepted" ? c.review.accepted : c.review.rejected);
  };

  return (
    <SpecimenFrame
      title={c.review.title}
      body={c.review.body}
      actions={<span className="kin-status" data-tone={state === "accepted" ? "positive" : state === "rejected" ? "negative" : "warning"}>{status}</span>}
      footer={<><span>{c.localFixture}</span><span>PRD-184</span></>}
    >
      <div className="change-review">
        <div className="value-compare">
          <div><span>{c.review.current}</span><strong>CNY 1,399.00</strong></div>
          <div><span>{c.review.proposed}</span><strong>CNY 1,299.00</strong></div>
        </div>
        <dl>
          <div className="review-reason"><dt>{c.review.reason}</dt><dd>{c.review.reasonValue}</dd></div>
          <div className="review-reason"><dt>{c.review.impact}</dt><dd>{c.review.impactValue}</dd></div>
          <div className="review-reason"><dt>{c.review.evidence}</dt><dd><a href="#evidence-1">[1]</a> <a href="#evidence-2">[2]</a></dd></div>
        </dl>
        <div className="review-actions">
          <button className="kin-button" type="button" onClick={() => decide("rejected")}>{c.review.reject}</button>
          <button className="kin-button" type="button" onClick={() => kinToast.message(c.review.edited)}>{c.review.edit}</button>
          <button className="kin-button kin-button--primary" type="button" onClick={() => decide("accepted")}>
            <Check aria-hidden="true" />
            {c.review.accept}
          </button>
        </div>
      </div>
    </SpecimenFrame>
  );
}

function ExecutionPreviewSpecimen({ c }) {
  const [state, setState] = React.useState("ready");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (state !== "running") return undefined;
    const timers = [
      window.setTimeout(() => setProgress(36), 180),
      window.setTimeout(() => setProgress(72), 460),
      window.setTimeout(() => {
        setProgress(100);
        setState("complete");
        kinToast.success(c.execution.complete);
      }, 820),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [state, c.execution.complete]);

  const run = () => {
    setProgress(8);
    setState("running");
    kinToast.message(c.execution.queued);
  };

  return (
    <SpecimenFrame
      title={c.execution.title}
      body={c.execution.body}
      actions={<span className="kin-status" data-tone={state === "complete" ? "positive" : state === "running" ? "warning" : undefined}>{state === "complete" ? c.execution.complete : state === "running" ? c.execution.running : c.localFixture}</span>}
      footer={<><span>{c.execution.noExternal}</span><span>EXE-042</span></>}
    >
      <div className="execution-card">
        <ul className="scope-list">
          <li><PackageSearch aria-hidden="true" /><span><strong>{c.execution.target}</strong><br />{c.execution.targetValue}</span><Check aria-hidden="true" /></li>
          <li><Database aria-hidden="true" /><span><strong>{c.execution.writes}</strong><br />{c.execution.writesValue}</span><Check aria-hidden="true" /></li>
          <li><Globe2 aria-hidden="true" /><span><strong>{c.execution.effect}</strong><br />{c.execution.effectValue}</span><span>2</span></li>
          <li><RotateCcw aria-hidden="true" /><span><strong>{c.execution.rollback}</strong><br />{c.execution.rollbackValue}</span><Check aria-hidden="true" /></li>
        </ul>
        <div
          className="progress-track"
          aria-label={
            state === "running"
              ? c.execution.running
              : state === "complete"
                ? c.execution.complete
                : c.execution.ready
          }
        >
          <span style={{ "--progress": `${progress}%` }} />
        </div>
        <div className="review-actions">
          {state === "complete" ? (
            <button className="kin-button" type="button" onClick={() => { setState("ready"); setProgress(0); }}>
              <RotateCcw aria-hidden="true" />{c.execution.reset}
            </button>
          ) : (
            <button className="kin-button kin-button--primary" type="button" onClick={run} disabled={state === "running"}>
              {state === "running" ? <LoaderCircle className="spinning" aria-hidden="true" /> : <Play aria-hidden="true" />}
              {state === "running" ? c.execution.running : c.execution.run}
            </button>
          )}
        </div>
      </div>
    </SpecimenFrame>
  );
}

function BackgroundTaskSpecimen({ c }) {
  const [syncState, setSyncState] = React.useState("failed");
  React.useEffect(() => {
    if (syncState !== "retrying") return undefined;
    const timer = window.setTimeout(() => setSyncState("running"), 720);
    return () => window.clearTimeout(timer);
  }, [syncState]);

  const tasks = [
    { id: "export", title: c.tasks.export, body: c.tasks.exportBody, state: "running", progress: 62 },
    { id: "sync", title: c.tasks.sync, body: c.tasks.syncBody, state: syncState, progress: syncState === "running" ? 18 : 0 },
    { id: "report", title: c.tasks.report, body: c.tasks.reportBody, state: "complete", progress: 100 },
  ];

  const labels = {
    running: c.tasks.running,
    failed: c.tasks.failed,
    complete: c.tasks.complete,
    retrying: c.tasks.retrying,
  };

  return (
    <SpecimenFrame
      title={c.tasks.title}
      body={c.tasks.body}
      actions={<span className="specimen-meta">3</span>}
      footer={<><span>{c.localFixture}</span><span>TASK-204</span></>}
    >
      <ol className="task-list">
        {tasks.map((task) => (
          <li className="task-row" key={task.id}>
            <span className="task-icon" aria-hidden="true">
              {task.state === "complete" ? <CheckCircle2 /> : task.state === "failed" ? <XCircle /> : <LoaderCircle className={task.state === "running" || task.state === "retrying" ? "spinning" : ""} />}
            </span>
            <span><strong>{task.title}</strong><p>{task.body}</p></span>
            <span className="task-progress">
              <span>{labels[task.state]}</span>
              <span className="progress-track" aria-hidden="true"><span style={{ "--progress": `${task.progress}%` }} /></span>
            </span>
            {task.id === "sync" && task.state === "failed" ? (
              <button className="kin-button" type="button" onClick={() => { setSyncState("retrying"); kinToast.success(c.tasks.retryQueued); }}>
                <RefreshCw aria-hidden="true" />{c.retry}
              </button>
            ) : task.id === "report" ? (
              <button className="kin-button kin-button--ghost" type="button">{c.tasks.view}</button>
            ) : <span className="specimen-meta">{task.progress}%</span>}
          </li>
        ))}
      </ol>
    </SpecimenFrame>
  );
}

function DataTableSpecimen({ c }) {
  const [sortAscending, setSortAscending] = React.useState(true);
  const [selected, setSelected] = React.useState("PRD-184");
  const rows = [
    { id: "PRD-184", name: "Field Jacket", price: 1299, channel: "Web + 2", state: c.table.review, tone: "warning", updated: "09:42" },
    { id: "PRD-076", name: "Transit Bag", price: 899, channel: "Web", state: c.table.approved, tone: "positive", updated: "09:18" },
    { id: "PRD-231", name: "Studio Lamp", price: 649, channel: "Web + 1", state: c.table.draft, tone: undefined, updated: "Yesterday" },
  ].sort((a, b) => (a.price - b.price) * (sortAscending ? 1 : -1));

  return (
    <SpecimenFrame
      title={c.table.title}
      body={c.table.body}
      actions={<span className="specimen-meta">{c.table.count}</span>}
      footer={<><span>{c.localFixture}</span><span>{c.table.selected}: {selected}</span></>}
    >
      <div className="table-shell">
        <table className="kin-table">
          <thead>
            <tr>
              <th>{c.table.product}</th>
              <th>
                <button type="button" onClick={() => setSortAscending((value) => !value)}>
                  {c.table.price} <ArrowDown size={12} aria-hidden="true" />
                </button>
              </th>
              <th>{c.table.channel}</th>
              <th>{c.table.state}</th>
              <th>{c.table.updated}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} data-selected={selected === row.id}>
                <td><button type="button" onClick={() => setSelected(row.id)}><strong>{row.name}</strong><br /><span className="specimen-meta">{row.id}</span></button></td>
                <td>CNY {row.price.toLocaleString("en")}.00</td>
                <td>{row.channel}</td>
                <td><span className="kin-status" data-tone={row.tone}>{row.state}</span></td>
                <td>{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SpecimenFrame>
  );
}

function AuthenticationDialogSpecimen({ c }) {
  const dialogRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  const open = React.useCallback(() => dialogRef.current?.showModal(), []);
  const close = React.useCallback(() => {
    dialogRef.current?.close();
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, []);

  React.useEffect(() => {
    const frame = requestAnimationFrame(open);
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const submit = (event) => {
    event.preventDefault();
    close();
    kinToast.success(c.auth.submitted);
  };

  return (
    <main id="specimen-root" className="kin-showcase-specimen auth-stage" tabIndex={-1}>
      <div className="auth-context">
        <h2>{c.auth.contextTitle}</h2>
        <p>{c.auth.contextBody}</p>
      </div>
      <button ref={triggerRef} className="kin-button auth-reopen" type="button" onClick={open}>
        <UserRoundCheck aria-hidden="true" />{c.auth.reopen}
      </button>
      <dialog ref={dialogRef} className="kin-auth-dialog" data-auth-dialog onCancel={(event) => { event.preventDefault(); close(); }}>
        <form className="auth-dialog__body" method="dialog" onSubmit={submit}>
          <h2>{c.auth.title}</h2>
          <p>{c.auth.body}</p>
          <label>
            {c.auth.email}
            <input type="email" name="email" autoComplete="email" placeholder={c.auth.emailPlaceholder} required autoFocus />
          </label>
          <div className="auth-dialog__actions">
            <button className="kin-button" type="button" onClick={close}>{c.auth.cancel}</button>
            <button className="kin-button kin-button--primary" type="submit">{c.auth.continue}<ArrowRight aria-hidden="true" /></button>
          </div>
        </form>
      </dialog>
    </main>
  );
}

function AppShellSpecimen({ c }) {
  const products = [
    { id: "PRD-184", name: "Field Jacket", state: c.shell.review, owner: c.shell.operator },
    { id: "PRD-076", name: "Transit Bag", state: c.shell.approved, owner: c.shell.operator },
    { id: "PRD-231", name: "Studio Lamp", state: c.shell.review, owner: c.shell.operator },
  ];
  const [selected, setSelected] = React.useState(products[0].id);
  const active = products.find((product) => product.id === selected) ?? products[0];

  return (
    <main id="specimen-root" className="kin-showcase-specimen" tabIndex={-1}>
      <section className="specimen-canvas specimen-canvas--flush">
        <div className="mini-app-shell">
          <aside className="mini-sidebar">
            <div className="mini-brand">KIN</div>
            <nav className="mini-nav" aria-label={c.shell.title}>
              <button type="button"><LayoutDashboard aria-hidden="true" />{c.shell.overview}</button>
              <button type="button" aria-current="page"><PackageSearch aria-hidden="true" />{c.shell.catalog}</button>
              <button type="button"><FileSearch aria-hidden="true" />{c.shell.evidence}</button>
              <button type="button"><ListChecks aria-hidden="true" />{c.shell.tasks}</button>
            </nav>
          </aside>
          <section className="mini-workspace">
            <header className="mini-location"><span>{c.shell.location}</span><span className="specimen-meta">{c.shell.records}</span></header>
            <div className="mini-content">
              <h2>{c.shell.heading}</h2>
              <div className="mini-list">
                {products.map((product) => (
                  <button key={product.id} type="button" aria-pressed={selected === product.id} onClick={() => setSelected(product.id)}>
                    <strong>{product.name}<br /><span>{product.id}</span></strong>
                    <span className="kin-status" data-tone={product.state === c.shell.approved ? "positive" : "warning"}>{product.state}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside className="mini-inspector" aria-live="polite">
            <h3>{c.shell.selected}</h3>
            <dl>
              <div><dt>ID</dt><dd>{active.id}</dd></div>
              <div><dt>{c.shell.state}</dt><dd>{active.state}</dd></div>
              <div><dt>{c.shell.owner}</dt><dd>{active.owner}</dd></div>
              <div><dt>{c.shell.lastChange}</dt><dd>{c.shell.today}</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}

function AgentActivityTraceSpecimen({ c }) {
  const steps = [
    { id: "received", state: "complete", time: "09:40:11", title: c.trace.received, body: c.trace.receivedBody },
    { id: "retrieved", state: "complete", time: "09:40:12", title: c.trace.retrieved, body: c.trace.retrievedBody, tool: true },
    { id: "compared", state: "complete", time: "09:40:13", title: c.trace.compared, body: c.trace.comparedBody },
    { id: "proposed", state: "waiting", time: "09:40:14", title: c.trace.proposed, body: c.trace.proposedBody },
  ];
  const stateLabels = {
    complete: c.trace.complete,
    running: c.trace.running,
    waiting: c.trace.waiting,
    failed: c.trace.failed,
  };
  const stateTones = {
    complete: "positive",
    running: "warning",
    waiting: "warning",
    failed: "negative",
  };

  return (
    <SpecimenFrame
      title={c.trace.title}
      body={c.trace.body}
      status="candidate"
      footer={<><span>{c.localFixture}</span><span>RUN-142</span></>}
    >
      <div className="trace-shell">
        <section className="trace-main">
          <div className="trace-heading"><h2>RUN-142</h2><p>{c.trace.receivedBody}</p></div>
          <ol className="trace-list">
            {steps.map((step) => (
              <li className="trace-step" data-state={step.state} key={step.id}>
                <span className="trace-node" aria-hidden="true" />
                <span>
                  <span className="trace-step__heading">
                    <strong>{step.title}</strong>
                    <span className="kin-status" data-tone={stateTones[step.state]}>{stateLabels[step.state]}</span>
                  </span>
                  <p>{step.body}</p>
                  {step.tool ? (
                    <details className="tool-activity">
                      <summary><ChevronDown aria-hidden="true" />{c.trace.tool}</summary>
                      <pre>{c.trace.toolBody}</pre>
                    </details>
                  ) : null}
                </span>
                <time>{step.time}</time>
              </li>
            ))}
          </ol>
        </section>
        <aside className="trace-context">
          <dl>
            <div><dt>{c.trace.overallState}</dt><dd><span className="kin-status" data-tone="warning">{c.trace.waiting}</span></dd></div>
            <div><dt>{c.trace.started}</dt><dd>{c.trace.startedValue}</dd></div>
            <div><dt>{c.trace.initiatedBy}</dt><dd>{c.trace.initiatedByValue}</dd></div>
            <div><dt>{c.trace.input}</dt><dd>{c.trace.inputValue}</dd></div>
            <div><dt>{c.trace.result}</dt><dd>{c.trace.resultValue}</dd></div>
            <div><dt>{c.trace.permission}</dt><dd><span className="kin-status">{c.trace.permissionValue}</span></dd></div>
          </dl>
          <a className="trace-review-link" href="#review-recovery">{c.trace.reviewPathValue}</a>
          <div className="trace-recovery" id="review-recovery">
            <strong>{c.trace.reviewPath}</strong>
            <p>{c.trace.reviewPathBody}</p>
          </div>
        </aside>
      </div>
    </SpecimenFrame>
  );
}

const codeText = `export function resolvePrice(record, evidence) {
  const approved = evidence.find((item) => item.status === "verified");

  if (!approved) {
    return { state: "needs-review", value: record.price };
  }

  return { state: "ready", value: approved.value };
}`;

function CodeBlockSpecimen({ c }) {
  const [wrap, setWrap] = React.useState(false);
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      kinToast.success(c.code.copied);
    } catch {
      kinToast.error(c.copyFailed);
    }
  };

  return (
    <SpecimenFrame
      title={c.code.title}
      body={c.code.body}
      status="candidate"
      footer={<><span>TypeScript</span><span>{c.code.lineCount}</span></>}
    >
      <div className="code-specimen-stage">
        <div className="code-shell">
          <div className="code-toolbar">
            <code><FileCode2 aria-hidden="true" /> {c.code.filename}</code>
            <div className="inline-actions">
              <button
                className="kin-button kin-button--ghost"
                type="button"
                aria-pressed={wrap}
                onClick={() => setWrap((value) => !value)}
              >
                <SlidersHorizontal aria-hidden="true" />{wrap ? c.code.unwrap : c.code.wrap}
              </button>
              <button className="kin-button" type="button" onClick={copyCode}>
                <Clipboard aria-hidden="true" />{c.code.copy}
              </button>
            </div>
          </div>
          <div className="code-scroll" tabIndex={0} aria-label={`${c.code.filename}, TypeScript`}>
            <pre className="code-lines" data-wrap={wrap}><code>
                <span className="code-line"><span className="code-line__source"><span className="token-keyword">export function</span> resolvePrice(record, evidence) {"{"}</span></span>
                <span className="code-line"><span className="code-line__source">  <span className="token-keyword">const</span> approved = evidence.find((item) =&gt; item.status === <span className="token-string">"verified"</span>);</span></span>
                <span className="code-line"><span className="code-line__source"> </span></span>
                <span className="code-line"><span className="code-line__source">  <span className="token-keyword">if</span> (!approved) {"{"}</span></span>
                <span className="code-line"><span className="code-line__source">    <span className="token-keyword">return</span> {"{"} state: <span className="token-string">"needs-review"</span>, value: record.price {"}"};</span></span>
                <span className="code-line"><span className="code-line__source">  {"}"}</span></span>
                <span className="code-line"><span className="code-line__source"> </span></span>
                <span className="code-line"><span className="code-line__source">  <span className="token-keyword">return</span> {"{"} state: <span className="token-string">"ready"</span>, value: approved.value {"}"};</span></span>
                <span className="code-line"><span className="code-line__source">{"}"}</span></span>
              </code></pre>
          </div>
        </div>
      </div>
    </SpecimenFrame>
  );
}

function StoryTimelineSpecimen({ c }) {
  const items = [
    { label: "09:30", title: c.timeline.introduced, body: c.timeline.introducedBody },
    { label: "09:34", title: c.timeline.evidence, body: c.timeline.evidenceBody },
    { label: "09:38", title: c.timeline.mobile, body: c.timeline.mobileBody },
    { label: "09:41", title: c.timeline.agents, body: c.timeline.agentsBody },
    { label: "09:45", title: c.timeline.current, body: c.timeline.currentBody },
  ];
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const timelineRef = React.useRef(null);
  const markerRefs = React.useRef([]);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    const node = timelineRef.current;
    if (!node) return undefined;
    const onWheel = (event) => {
      if (matchMedia("(max-width: 720px)").matches) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return;
      const maxScroll = node.scrollWidth - node.clientWidth;
      const canMove = delta > 0 ? node.scrollLeft < maxScroll - 1 : node.scrollLeft > 1;
      if (!canMove) return;
      event.preventDefault();
      node.scrollLeft += delta;
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const select = (index, moveFocus = false) => {
    const next = Math.min(items.length - 1, Math.max(0, index));
    setActiveIndex(next);
    if (moveFocus) {
      requestAnimationFrame(() => {
        markerRefs.current[next]?.focus({ preventScroll: true });
        const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
        markerRefs.current[next]?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      });
    }
  };

  const onKeyDown = (event) => {
    const vertical = matchMedia("(max-width: 720px)").matches;
    const previousKey = vertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = vertical ? "ArrowDown" : "ArrowRight";
    if (![previousKey, nextKey, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") select(0, true);
    else if (event.key === "End") select(items.length - 1, true);
    else if (event.key === previousKey) select(activeIndex - 1, true);
    else select(activeIndex + 1, true);
  };

  const active = items[activeIndex];
  return (
    <SpecimenFrame
      title={c.timeline.title}
      body={c.timeline.body}
      status="candidate"
      footer={<><span>{c.localFixture}</span><span>{c.timeline.sourceValue}</span></>}
      flush
    >
      <div className="timeline-shell">
        <div className="timeline-heading">
          <span className="specimen-meta">{c.timeline.fixtureNotice}</span>
          <span className="timeline-cue"><ArrowRight aria-hidden="true" />{c.timeline.cue}</span>
        </div>
        <div
          ref={timelineRef}
          className="story-timeline"
          data-ready={ready}
          role="group"
          aria-label={c.timeline.title}
          onKeyDown={onKeyDown}
        >
          <ol className="story-timeline__track">
            <li className="story-timeline__progress" aria-hidden="true" role="presentation" />
            {items.map((item, index) => (
              <li className="story-milestone" data-active={activeIndex === index} key={item.label}>
                <time>{item.label}</time>
                <button
                  ref={(node) => { markerRefs.current[index] = node; }}
                  className="story-marker"
                  type="button"
                  aria-label={`${item.label}: ${item.title}`}
                  aria-pressed={activeIndex === index}
                  tabIndex={activeIndex === index ? 0 : -1}
                  onClick={() => select(index)}
                />
                <div className="story-milestone__body">
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="timeline-detail" aria-live="polite">
          <span>{c.timeline.detail}<strong>{active.label}</strong></span>
          <span><strong>{active.title}</strong>{active.body}</span>
          <span>{c.timeline.source}<strong>{c.timeline.sourceValue}</strong></span>
        </div>
      </div>
    </SpecimenFrame>
  );
}

const specimenComponents = {
  button: ButtonSpecimen,
  "command-menu": CommandMenuSpecimen,
  "evidence-list": EvidenceSpecimen,
  "suggested-change-review": SuggestedChangeSpecimen,
  "execution-preview": ExecutionPreviewSpecimen,
  "background-task-queue": BackgroundTaskSpecimen,
  "data-table": DataTableSpecimen,
  "authentication-dialog": AuthenticationDialogSpecimen,
  "app-shell": AppShellSpecimen,
  "agent-activity-trace": AgentActivityTraceSpecimen,
  "code-block": CodeBlockSpecimen,
  "story-timeline": StoryTimelineSpecimen,
};

function App() {
  const params = new URLSearchParams(location.search);
  const locale = params.get("lang") === "zh-CN" ? "zh" : "en";
  const requested = params.get("specimen") ?? "button";
  const specimen = specimenIds.has(requested) ? requested : "button";
  const theme = useResolvedTheme();
  const c = copy[locale];
  const Component = specimenComponents[specimen];

  React.useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = `${specimen} · KIN`;
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.textContent = locale === "zh" ? "跳到组件" : "Skip to component";
      const moveFocus = (event) => {
        event.preventDefault();
        const target = document.getElementById("specimen-root");
        target?.focus({ preventScroll: false });
        history.replaceState(null, "", `${location.pathname}${location.search}#specimen-root`);
      };
      skipLink.addEventListener("click", moveFocus);
      return () => skipLink.removeEventListener("click", moveFocus);
    }
    return undefined;
  }, [locale, specimen]);

  return (
    <>
      <Component c={c} />
      <KinToaster
        theme={theme}
        locale={locale === "zh" ? "zh-CN" : "en"}
        position="bottom-right"
        labels={{
          notifications: locale === "zh" ? "通知" : "Notifications",
          closeNotification: locale === "zh" ? "关闭通知" : "Close notification",
        }}
      />
    </>
  );
}

createRoot(document.getElementById("showcase-specimen-app")).render(<App />);
