export const investigationCopy = {
  zh: {
    investigationEvidence: "证据", investigationViews: "调查证据范围", investigationScopeAll: "全部证据", investigationScopeConflicting: "冲突与缺口", investigationScopeUnverified: "待核验",
    investigationTitle: "Alpha Network 证书变更调查", investigationDescription: "按发生时间比较事件、来源和核验状态，再记录可归因的人工判断。", investigationRefresh: "刷新本地证据", investigationFixtureNote: "确定性本地参考，基准时间为 2026-07-20 09:18 +08:00；未连接实时来源、权限服务或持久化存储。",
    investigationContextLabel: "调查范围摘要", investigationRangeLabel: "时间范围", investigationRangeValue: "过去 30 天 · Asia/Shanghai", investigationSourceSetLabel: "来源集合", investigationSourceSetValue: "4 个已归因来源", investigationFindingLabel: "当前调查结论", investigationFindingOpen: "尚未记录", investigationFindingRecording: "记录中", investigationFindingRecorded: "FND-028-01 · 已记录",
    investigationLoadingTitle: "正在刷新本地证据", investigationLoadingBody: "当前证据时间线、筛选和选择保持可见，等待固定样例完成。", investigationPartialTitle: "来源集合不完整", investigationPartialBody: "变更日志暂不可用；已捕获事件与其他来源不会被移除。", investigationConflictTitle: "来源结论存在冲突", investigationConflictBody: "维护通知支持预期轮换，但变更日志缺少对应记录；需要人工结论。", investigationStaleTitle: "证据快照已过核验窗口", investigationStaleBody: "最后一次独立核验距基准时间 2 小时；不会自动改写当前结论。",
    investigationPendingTitle: "正在记录调查结论", investigationPendingBody: "固定样例暂时锁定表单，同时保留选择、来源映射和理由草稿。", investigationCommittedTitle: "调查结论已记录", investigationCommittedBody: "人工判断与支持证据保持可追溯，并可在当前样例中撤销。", investigationUndoTitle: "调查结论已撤销", investigationUndoBody: "调查回到未记录状态；理由与证据选择仍保留为本地草稿。", investigationPermissionTitle: "仅可查看调查", investigationPermissionBody: "当前样例模拟缺少记录权限；证据时间线与来源详情仍可读取。", investigationErrorTitle: "调查结论记录失败", investigationErrorBody: "理由、证据选择和当前事件均已保留，可以重试。",
    investigationChronologyTitle: "证据时间线", investigationChronologyDescription: "发生时间、观察时间、来源可用性与核验状态分别显示。", investigationCountTemplate: "{count} 条本地事件", investigationCountOne: "1 条本地事件", investigationCountEmpty: "0 条本地事件", investigationEmptyTitle: "当前范围没有证据事件", investigationEmptyBody: "可以切换范围；本地样例不会扩大时间窗口或补造来源。", investigationDayTitle: "2026 年 7 月 20 日",
    investigationObserved0916: "观察于 09:16", investigationObserved0908: "观察于 09:08", investigationObserved0904: "观察于 09:04", investigationObserved0841: "观察于 08:41", investigationEvent320Title: "变更日志来源不可用", investigationEvent320Body: "归档入口返回不可用状态，未能核对轮换记录。", investigationEvent311Title: "公开入口基线未变化", investigationEvent311Body: "主机、路由与可访问性和上一次独立检查一致。", investigationEvent318Title: "证书签发者发生变化", investigationEvent318Body: "签发者从 North CA 4 变更为 North CA 5。", investigationEvent314Title: "发布证书轮换维护通知", investigationEvent314Body: "公告窗口为 09:00–09:30，并注明公开入口不中断。",
    investigationSourceChangeLog: "变更日志", investigationSourceEndpoint: "入口扫描", investigationSourceCertificate: "证书观察器", investigationSourceNotice: "公开维护通知", investigationSourceAvailable: "来源可用", investigationSourceUnavailable: "来源不可用", investigationAvailabilityAvailable: "可用", investigationAvailabilityUnavailable: "不可用", investigationVerificationPending: "待核验", investigationVerificationConfirmed: "已确认", investigationVerificationConflicting: "冲突",
    investigationSelectedEvidence: "选中证据", investigationReviewEvidence: "查看选中证据", investigationEventContext: "事件上下文", investigationOccurredLabel: "发生时间", investigationObservedLabel: "观察时间", investigationSourceLabel: "来源", investigationAvailabilityLabel: "来源可用性", investigationVerificationLabel: "核验状态", investigationCapturedEvidence: "已捕获证据", investigationCaptureId: "捕获 ID", investigationSourceTime: "来源时间",
    investigationExcerpt320: "归档入口在 09:16 返回不可用状态；先前捕获的来源身份与时间仍被保留。", investigationExcerpt311: "独立入口扫描确认主机、路由和可访问性未偏离已记录基线。", investigationExcerpt318: "签发者从 North CA 4 变更为 North CA 5；证书主体与公开入口保持一致。", investigationExcerpt314: "维护通知声明 09:00–09:30 执行证书轮换，公开入口预计不中断。",
    investigationRecordFinding: "记录调查结论", investigationDecisionLabel: "人工判断", investigationDecisionExpected: "符合已公告轮换", investigationDecisionEscalate: "需要升级核验", investigationDecisionInconclusive: "证据不足", investigationSupportingEvidence: "支持证据", investigationEvidenceError: "至少选择一条支持证据。", investigationReasonLabel: "判断理由", investigationReasonPlaceholder: "说明来源如何支持或限制该判断", investigationReasonError: "请记录来源如何支持或限制该判断。", investigationSubmit: "记录调查结论", investigationSubmitting: "正在记录", investigationRecordedFinding: "已记录的调查结论", investigationDraftReason: "维护通知与观察到的签发者变更时间一致；入口基线未变化。",
  },
  en: {
    investigationEvidence: "Evidence", investigationViews: "Investigation evidence scopes", investigationScopeAll: "All evidence", investigationScopeConflicting: "Conflicts and gaps", investigationScopeUnverified: "Unverified",
    investigationTitle: "Alpha Network certificate change investigation", investigationDescription: "Compare events, sources, and verification state by occurrence time before recording an attributable human finding.", investigationRefresh: "Refresh local evidence", investigationFixtureNote: "Deterministic local reference as of 2026-07-20 09:18 +08:00; no live sources, permission service, or persistent storage are connected.",
    investigationContextLabel: "Investigation scope summary", investigationRangeLabel: "Time range", investigationRangeValue: "Last 30 days · Asia/Shanghai", investigationSourceSetLabel: "Source set", investigationSourceSetValue: "4 attributable sources", investigationFindingLabel: "Current finding", investigationFindingOpen: "Not recorded", investigationFindingRecording: "Recording", investigationFindingRecorded: "FND-028-01 · Recorded",
    investigationLoadingTitle: "Refreshing local evidence", investigationLoadingBody: "The current chronology, scope, and selection remain visible while the fixed fixture completes.", investigationPartialTitle: "Source set is incomplete", investigationPartialBody: "The change log is unavailable; captured events and other sources remain visible.", investigationConflictTitle: "Source conclusions conflict", investigationConflictBody: "The maintenance notice supports an expected rotation, but the change log has no matching record; a human finding is required.", investigationStaleTitle: "Evidence snapshot is outside its verification window", investigationStaleBody: "The last independent verification is two hours old at the fixture time; the current finding will not be changed automatically.",
    investigationPendingTitle: "Recording finding", investigationPendingBody: "The local fixture temporarily locks the form while preserving selection, source mapping, and the reason draft.", investigationCommittedTitle: "Finding recorded", investigationCommittedBody: "The human judgment and supporting evidence remain attributable and can be undone in this fixture.", investigationUndoTitle: "Finding undone", investigationUndoBody: "The investigation is unrecorded again; the reason and evidence selection remain in the local draft.", investigationPermissionTitle: "Investigation is view only", investigationPermissionBody: "This fixture simulates missing record permission; the chronology and source detail remain readable.", investigationErrorTitle: "Finding record failed", investigationErrorBody: "The reason, evidence selection, and current event are preserved and can be retried.",
    investigationChronologyTitle: "Evidence chronology", investigationChronologyDescription: "Occurrence, observation, source availability, and verification state remain separate.", investigationCountTemplate: "{count} local events", investigationCountOne: "1 local event", investigationCountEmpty: "0 local events", investigationEmptyTitle: "No evidence events in this scope", investigationEmptyBody: "Choose another scope; the local fixture will not widen the time range or invent sources.", investigationDayTitle: "July 20, 2026",
    investigationObserved0916: "Observed 09:16", investigationObserved0908: "Observed 09:08", investigationObserved0904: "Observed 09:04", investigationObserved0841: "Observed 08:41", investigationEvent320Title: "Change log source unavailable", investigationEvent320Body: "The archive endpoint was unavailable, so the rotation record could not be checked.", investigationEvent311Title: "Public endpoint baseline unchanged", investigationEvent311Body: "Host, route, and availability match the last independent check.", investigationEvent318Title: "Certificate issuer changed", investigationEvent318Body: "The issuer changed from North CA 4 to North CA 5.", investigationEvent314Title: "Certificate rotation maintenance announced", investigationEvent314Body: "The notice names a 09:00–09:30 window with no expected public endpoint interruption.",
    investigationSourceChangeLog: "Change log", investigationSourceEndpoint: "Endpoint scan", investigationSourceCertificate: "Certificate observer", investigationSourceNotice: "Public maintenance notice", investigationSourceAvailable: "Source available", investigationSourceUnavailable: "Source unavailable", investigationAvailabilityAvailable: "Available", investigationAvailabilityUnavailable: "Unavailable", investigationVerificationPending: "Pending verification", investigationVerificationConfirmed: "Confirmed", investigationVerificationConflicting: "Conflicting",
    investigationSelectedEvidence: "Selected evidence", investigationReviewEvidence: "Review selected evidence", investigationEventContext: "Event context", investigationOccurredLabel: "Occurred", investigationObservedLabel: "Observed", investigationSourceLabel: "Source", investigationAvailabilityLabel: "Source availability", investigationVerificationLabel: "Verification state", investigationCapturedEvidence: "Captured evidence", investigationCaptureId: "Capture ID", investigationSourceTime: "Source time",
    investigationExcerpt320: "The archive endpoint returned unavailable at 09:16; the previously captured source identity and time remain preserved.", investigationExcerpt311: "An independent endpoint scan confirms that the host, route, and availability have not diverged from the recorded baseline.", investigationExcerpt318: "The issuer changed from North CA 4 to North CA 5 while the certificate subject and public endpoint stayed consistent.", investigationExcerpt314: "The maintenance notice says a certificate rotation will run from 09:00 to 09:30 with no expected public endpoint interruption.",
    investigationRecordFinding: "Record finding", investigationDecisionLabel: "Human judgment", investigationDecisionExpected: "Matches announced rotation", investigationDecisionEscalate: "Escalate verification", investigationDecisionInconclusive: "Evidence is insufficient", investigationSupportingEvidence: "Supporting evidence", investigationEvidenceError: "Select at least one supporting event.", investigationReasonLabel: "Reason", investigationReasonPlaceholder: "Explain how the sources support or limit this finding", investigationReasonError: "Record how the sources support or limit this finding.", investigationSubmit: "Record finding", investigationSubmitting: "Recording", investigationRecordedFinding: "Recorded finding", investigationDraftReason: "The maintenance notice aligns with the observed issuer-change time; the endpoint baseline is unchanged.",
  },
};

export function createInvestigationController({
  root,
  copy,
  currentLocale,
  overlayLayout,
  appShell,
  inspectorOpen,
  inspectorIsOpen,
  setInspector,
}) {
  const investigation = document.querySelector("[data-investigation]");
  const chronology = document.querySelector("[data-investigation-chronology]");
  const count = document.querySelector("[data-investigation-count]");
  const rows = [...document.querySelectorAll("[data-investigation-event-row]")];
  const eventButtons = [...document.querySelectorAll("[data-investigation-event]")];
  const scopeLinks = [...document.querySelectorAll("[data-investigation-scope]")];
  const inspectorTitle = document.querySelector("[data-investigation-inspector-title]");
  const detailOccurred = document.querySelector("[data-investigation-detail-occurred]");
  const detailObserved = document.querySelector("[data-investigation-detail-observed]");
  const detailSource = document.querySelector("[data-investigation-detail-source]");
  const detailAvailability = document.querySelector("[data-investigation-detail-availability]");
  const detailVerification = document.querySelector("[data-investigation-detail-verification]");
  const detailExcerpt = document.querySelector("[data-investigation-detail-excerpt]");
  const detailCapture = document.querySelector("[data-investigation-detail-capture]");
  const detailSourceTime = document.querySelector("[data-investigation-detail-source-time]");
  const findingStatus = document.querySelector("[data-investigation-finding-status]");
  const findingForm = document.querySelector("[data-investigation-finding-form]");
  const fields = document.querySelector("[data-investigation-fields]");
  const reason = document.querySelector("[data-investigation-reason]");
  const reasonError = document.querySelector("[data-investigation-reason-error]");
  const evidenceError = document.querySelector("[data-investigation-evidence-error]");
  const evidenceGroup = document.querySelector(".investigation-support-group");
  const submit = document.querySelector("[data-investigation-submit]");
  const commitRecord = document.querySelector("[data-investigation-commit-record]");
  const commitDecision = document.querySelector("[data-investigation-commit-decision]");
  const commitEvidence = document.querySelector("[data-investigation-commit-evidence]");
  const commitReason = document.querySelector("[data-investigation-commit-reason]");
  const undoAction = document.querySelector("[data-investigation-undo-action]");
  const retry = document.querySelector("[data-investigation-retry]");
  const refresh = document.querySelector("[data-investigation-refresh]");
  const statePanels = [...document.querySelectorAll("[data-investigation-state-panel]")];

  const events = {
    "EVT-320": { titleKey: "investigationEvent320Title", sourceKey: "investigationSourceChangeLog", availabilityKey: "investigationAvailabilityUnavailable", verificationKey: "investigationVerificationPending", excerptKey: "investigationExcerpt320", occurred: "2026-07-20 09:11", observed: "2026-07-20 09:16", capture: "CAP-7824", sourceTime: "2026-07-20 09:11 +08:00" },
    "EVT-311": { titleKey: "investigationEvent311Title", sourceKey: "investigationSourceEndpoint", availabilityKey: "investigationAvailabilityAvailable", verificationKey: "investigationVerificationConfirmed", excerptKey: "investigationExcerpt311", occurred: "2026-07-20 09:07", observed: "2026-07-20 09:08", capture: "CAP-7822", sourceTime: "2026-07-20 09:07 +08:00" },
    "EVT-318": { titleKey: "investigationEvent318Title", sourceKey: "investigationSourceCertificate", availabilityKey: "investigationAvailabilityAvailable", verificationKey: "investigationVerificationConflicting", excerptKey: "investigationExcerpt318", occurred: "2026-07-20 09:02", observed: "2026-07-20 09:04", capture: "CAP-7821", sourceTime: "2026-07-20 09:02 +08:00" },
    "EVT-314": { titleKey: "investigationEvent314Title", sourceKey: "investigationSourceNotice", availabilityKey: "investigationAvailabilityAvailable", verificationKey: "investigationVerificationConfirmed", excerptKey: "investigationExcerpt314", occurred: "2026-07-20 08:40", observed: "2026-07-20 08:41", capture: "CAP-7819", sourceTime: "2026-07-20 08:40 +08:00" },
  };
  const scopeEvents = { all: ["EVT-320", "EVT-311", "EVT-318", "EVT-314"], conflicting: ["EVT-320", "EVT-318"], unverified: ["EVT-320"] };
  const allowedScopes = new Set(Object.keys(scopeEvents));
  const allowedStates = new Set(["normal", "loading", "partial", "conflict", "stale", "empty", "pending", "committed", "undo", "permission", "error"]);
  const initialParams = new URLSearchParams(window.location.search);
  const initialPanelRequested = initialParams.get("panel") === "evidence";
  let currentScope = allowedScopes.has(initialParams.get("scope")) ? initialParams.get("scope") : "all";
  let selectedId = events[initialParams.get("event")] ? initialParams.get("event") : "EVT-318";
  if (!scopeEvents[currentScope].includes(selectedId)) selectedId = scopeEvents[currentScope][0];
  let currentState = allowedStates.has(initialParams.get("state")) ? initialParams.get("state") : "normal";
  let draft = { decision: "expected", evidence: ["EVT-318", "EVT-314"], reason: "" };
  let commit;
  let submissionFailed = currentState === "error";
  let pendingSubmission = null;
  let stateTimer;

  const evidenceInputs = () => [...findingForm.querySelectorAll('input[name="finding-evidence"]')];

  function saveDraft() {
    draft = {
      decision: findingForm.querySelector('input[name="finding-decision"]:checked')?.value || "expected",
      evidence: evidenceInputs().filter((input) => input.checked).map((input) => input.value),
      reason: reason.value,
    };
  }

  function applyDraft() {
    const decision = findingForm.querySelector(`input[name="finding-decision"][value="${draft.decision}"]`);
    if (decision) decision.checked = true;
    for (const input of evidenceInputs()) input.checked = draft.evidence.includes(input.value);
    reason.value = draft.reason;
  }

  function ensureDraft() {
    if (!draft.reason) draft.reason = copy[currentLocale()].investigationDraftReason;
    if (draft.evidence.length === 0) draft.evidence = ["EVT-318", "EVT-314"];
    applyDraft();
  }

  function writeUrl({ mode = "replace", panel = overlayLayout.matches && appShell.classList.contains("inspector-open") } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "investigation");
    url.searchParams.set("scope", currentScope);
    url.searchParams.set("state", currentState);
    url.searchParams.set("event", selectedId);
    if (panel) url.searchParams.set("panel", "evidence");
    else url.searchParams.delete("panel");
    const panelPushed = Boolean(panel && (mode === "push" || history.state?.kinInvestigationPanelPushed));
    history[mode + "State"]({ ...(history.state || {}), kinInvestigationEntry: true, kinInvestigationPanel: Boolean(panel), kinInvestigationPanelPushed: panelPushed }, "", url.pathname + url.search + url.hash);
  }

  function renderScope() {
    const messages = copy[currentLocale()];
    const visibleIds = scopeEvents[currentScope];
    if (!visibleIds.includes(selectedId)) selectedId = visibleIds[0];
    for (const row of rows) row.hidden = !visibleIds.includes(row.dataset.investigationEventRow);
    for (const link of scopeLinks) {
      if (link.dataset.investigationScope === currentScope) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    count.textContent = visibleIds.length === 1 ? messages.investigationCountOne : messages.investigationCountTemplate.replace("{count}", String(visibleIds.length));
  }

  function renderEvent() {
    const messages = copy[currentLocale()];
    const event = events[selectedId] || events["EVT-318"];
    for (const row of rows) {
      const selected = row.dataset.investigationEventRow === selectedId;
      row.dataset.selected = String(selected);
      const button = row.querySelector("[data-investigation-event]");
      if (selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
    inspectorTitle.textContent = selectedId + " · " + messages[event.titleKey];
    detailOccurred.textContent = event.occurred;
    detailObserved.textContent = event.observed;
    detailSource.textContent = messages[event.sourceKey];
    detailAvailability.textContent = messages[event.availabilityKey];
    detailVerification.textContent = messages[event.verificationKey];
    detailExcerpt.textContent = messages[event.excerptKey];
    detailCapture.textContent = event.capture;
    detailSourceTime.textContent = event.sourceTime;
  }

  function ensureCommit() {
    if (commit) return;
    ensureDraft();
    commit = { draft: structuredClone(draft) };
  }

  function renderState() {
    const messages = copy[currentLocale()];
    const isEmpty = currentState === "empty";
    const isCommitted = currentState === "committed";
    const locked = ["loading", "pending", "permission"].includes(currentState);
    if (["pending", "committed", "undo", "error"].includes(currentState)) ensureDraft();
    if (isCommitted) ensureCommit();
    investigation.dataset.investigationState = currentState;
    investigation.setAttribute("aria-busy", String(currentState === "loading" || currentState === "pending"));
    for (const panel of statePanels) panel.hidden = panel.dataset.investigationStatePanel !== currentState;
    chronology.hidden = isEmpty;
    count.textContent = isEmpty ? messages.investigationCountEmpty : scopeEvents[currentScope].length === 1 ? messages.investigationCountOne : messages.investigationCountTemplate.replace("{count}", String(scopeEvents[currentScope].length));
    findingForm.hidden = isCommitted || isEmpty;
    commitRecord.hidden = !isCommitted;
    fields.disabled = locked;
    for (const button of eventButtons) button.disabled = currentState === "pending";
    for (const link of scopeLinks) currentState === "pending" ? link.setAttribute("aria-disabled", "true") : link.removeAttribute("aria-disabled");
    submit.textContent = messages[currentState === "pending" ? "investigationSubmitting" : "investigationSubmit"];
    inspectorOpen.disabled = isEmpty;
    const statusKey = currentState === "pending" ? "investigationFindingRecording" : isCommitted ? "investigationFindingRecorded" : "investigationFindingOpen";
    findingStatus.dataset.i18n = statusKey;
    findingStatus.textContent = messages[statusKey];
    if (isCommitted) {
      commitDecision.textContent = messages[{ expected: "investigationDecisionExpected", escalate: "investigationDecisionEscalate", inconclusive: "investigationDecisionInconclusive" }[commit.draft.decision]];
      commitEvidence.textContent = commit.draft.evidence.join(", ");
      commitReason.textContent = commit.draft.reason;
    }
  }

  function setState(state, { write = true, historyMode = "replace" } = {}) {
    if (!allowedStates.has(state)) return;
    const previous = currentState;
    currentState = state;
    renderState();
    if (write) writeUrl({ mode: historyMode });
    if (state === "empty" && inspectorIsOpen()) setInspector(false, false);
    if (previous === "empty" && state !== "empty" && !overlayLayout.matches) setInspector(true, false);
  }

  function completeFinding({ retrying = false } = {}) {
    window.clearTimeout(stateTimer);
    saveDraft();
    const submission = { draft: structuredClone(draft) };
    pendingSubmission = submission;
    setState("pending");
    const shouldFail = !retrying && new URLSearchParams(window.location.search).get("outcome") === "error" && !submissionFailed;
    stateTimer = window.setTimeout(() => {
      if (pendingSubmission !== submission) return;
      if (shouldFail) {
        submissionFailed = true;
        pendingSubmission = null;
        setState("error");
        retry.focus({ preventScroll: true });
        return;
      }
      commit = { draft: structuredClone(submission.draft) };
      pendingSubmission = null;
      setState("committed");
      undoAction.focus({ preventScroll: true });
    }, 240);
  }

  function setReasonValidity(invalid) {
    reason.setAttribute("aria-invalid", String(invalid));
    reasonError.hidden = !invalid;
  }

  function setEvidenceValidity(invalid) {
    evidenceGroup.setAttribute("aria-invalid", String(invalid));
    evidenceError.hidden = !invalid;
  }

  function clearFormErrors() {
    setReasonValidity(false);
    setEvidenceValidity(false);
  }

  function validateFinding() {
    const evidenceInvalid = !evidenceInputs().some((input) => input.checked);
    const reasonInvalid = !reason.value.trim();
    setEvidenceValidity(evidenceInvalid);
    setReasonValidity(reasonInvalid);
    if (evidenceInvalid) evidenceInputs()[0].focus({ preventScroll: true });
    else if (reasonInvalid) reason.focus({ preventScroll: true });
    return !evidenceInvalid && !reasonInvalid;
  }

  for (const link of scopeLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (currentState === "pending") return;
      saveDraft();
      currentScope = link.dataset.investigationScope;
      if (!scopeEvents[currentScope].includes(selectedId)) selectedId = scopeEvents[currentScope][0];
      if (currentState !== "permission") currentState = "normal";
      clearFormErrors();
      renderScope();
      renderEvent();
      renderState();
      writeUrl({ mode: "push", panel: false });
      if (overlayLayout.matches) setInspector(false, false);
    });
  }

  for (const button of eventButtons) {
    button.addEventListener("click", () => {
      if (currentState === "pending") return;
      const changed = selectedId !== button.dataset.investigationEvent;
      selectedId = button.dataset.investigationEvent;
      if (changed && currentState !== "permission") currentState = "normal";
      clearFormErrors();
      renderEvent();
      renderState();
      if (overlayLayout.matches) {
        if (changed) writeUrl({ mode: "push", panel: false });
        writeUrl({ mode: "push", panel: true });
        setInspector(true, true, button);
      } else {
        writeUrl({ mode: "push", panel: false });
      }
    });
  }

  findingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateFinding()) completeFinding();
  });
  reason.addEventListener("input", () => {
    if (reason.value.trim()) setReasonValidity(false);
    saveDraft();
  });
  for (const input of findingForm.querySelectorAll('input[name="finding-decision"], input[name="finding-evidence"]')) {
    input.addEventListener("change", () => {
      if (input.name === "finding-evidence" && evidenceInputs().some((evidence) => evidence.checked)) setEvidenceValidity(false);
      saveDraft();
    });
  }
  undoAction.addEventListener("click", () => {
    saveDraft();
    commit = undefined;
    setState("undo");
    submit.focus();
  });
  retry.addEventListener("click", () => completeFinding({ retrying: true }));
  refresh.addEventListener("click", () => {
    window.clearTimeout(stateTimer);
    pendingSubmission = null;
    setState("loading");
    stateTimer = window.setTimeout(() => setState("normal"), 320);
  });

  return {
    initialize() {
      renderScope();
      renderEvent();
      applyDraft();
    },
    translate(messages) {
      inspectorOpen.dataset.i18nAria = "investigationReviewEvidence";
      inspectorOpen.setAttribute("aria-label", messages.investigationReviewEvidence);
      renderScope();
      renderEvent();
      renderState();
    },
    writeUrl,
    shouldGoBackOnClose() {
      return overlayLayout.matches && history.state?.kinInvestigationPanelPushed;
    },
    openFromToolbar() {
      if (overlayLayout.matches) writeUrl({ mode: "push", panel: true });
    },
    handleOverlayChange(isNarrow) {
      setInspector(!isNarrow && currentState !== "empty", false);
      writeUrl({ panel: false });
    },
    handlePopState() {
      window.clearTimeout(stateTimer);
      pendingSubmission = null;
      saveDraft();
      const params = new URLSearchParams(window.location.search);
      const nextScope = allowedScopes.has(params.get("scope")) ? params.get("scope") : "all";
      const requestedEvent = events[params.get("event")] ? params.get("event") : "EVT-318";
      currentScope = nextScope;
      selectedId = scopeEvents[nextScope].includes(requestedEvent) ? requestedEvent : scopeEvents[nextScope][0];
      currentState = allowedStates.has(params.get("state")) ? params.get("state") : "normal";
      submissionFailed = currentState === "error";
      clearFormErrors();
      renderScope();
      renderEvent();
      renderState();
      const shouldOpen = !overlayLayout.matches ? currentState !== "empty" : params.get("panel") === "evidence" && currentState !== "empty";
      const wasOpen = inspectorIsOpen();
      const selectedButton = document.querySelector(`[data-investigation-event="${selectedId}"]`);
      setInspector(shouldOpen, shouldOpen !== wasOpen, selectedButton || inspectorOpen);
    },
    initialPanelOpen() {
      return overlayLayout.matches && initialPanelRequested && currentState !== "empty";
    },
    initialInspectorOpen() {
      return currentState !== "empty" && (!overlayLayout.matches || initialPanelRequested);
    },
    initialReturnTarget() {
      return document.querySelector(`[data-investigation-event="${selectedId}"]`) || inspectorOpen;
    },
  };
}
