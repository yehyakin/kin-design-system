export function createEntityParityController({
  root,
  reducedMotion,
  overlayLayout,
  showToast,
  copyCurrentLocation,
  locationOverflowTrigger,
}) {
  const contextThread = document.querySelector("[data-context-thread]");
  const contextToggles = [...document.querySelectorAll("[data-context-toggle]")];
  const contextLauncher = document.querySelector("[data-context-launcher]");
  const contextClose = document.querySelector("[data-context-close]");
  const contextMinimize = document.querySelector("[data-context-minimize]");
  const contextExpand = document.querySelector("[data-context-expand]");
  const contextForm = document.querySelector("[data-context-form]");
  const contextInput = document.querySelector("[data-context-input]");
  const contextFeed = document.querySelector("[data-context-feed]");
  const contextFollow = document.querySelector("[data-context-follow]");
  const contextMore = document.querySelector("[data-context-more]");
  const contextCopyButtons = [...document.querySelectorAll("[data-context-copy]")];
  const contextScanButtons = [...document.querySelectorAll("[data-context-scan]")];
  const contextAttach = document.querySelector("[data-context-attach]");
  const contextFile = document.querySelector("[data-context-file]");
  const contextSend = document.querySelector("[data-context-send]");
  const workspaceSearchButtons = [...document.querySelectorAll("[data-workspace-search]")];
  const workspaceCommand = document.querySelector("[data-workspace-command]");
  const workspaceCommandInput = document.querySelector("[data-workspace-command-input]");
  const workspaceCommandItems = [...document.querySelectorAll("[data-workspace-command-item]")];
  const workspaceCommandEmpty = document.querySelector("[data-workspace-command-empty]");

  const copy = {
    zh: {
      workspaceActions: "工作区操作", follow: "关注当前记录", copyLink: "复制当前记录链接", runScan: "运行检测",
      previousRecord: "上一条记录", nextRecord: "下一条记录", recordActivity: "记录动态", openThread: "打开复核助手",
      minimizeThread: "折叠复核助手", expandThread: "展开复核助手", closeThread: "关闭复核助手", attach: "添加附件",
      send: "发送", reviewMode: "复核", createdRecord: "根据公开来源创建了这条记录", twoMinutesAgo: "2 分钟前",
      monitoringAgent: "监测代理", addedLabels: "添加了“运行稳定”和“东亚”标签", commandSearchLabel: "搜索工作区",
      commandSearchPlaceholder: "搜索记录或前往…", recordsGroup: "记录", navigateGroup: "前往", databaseHint: "浏览记录",
      investigationHint: "核对证据", riskHint: "等待复核", monitoringHint: "查看最近动态", commandEmpty: "没有匹配的记录或操作。",
      connectedThread: "将 KIN 连接到 PRX-1027", examiningRecord: "正在核对最近的状态变化…", workedFor: "已检查 7 秒",
      threadResult: "已核对最近三条监测记录。官网和公开频道可访问；香港节点的延迟已恢复。",
      threadChangeOne: "确认 HK-02 已恢复到 89ms", threadChangeTwo: "保留“观察”状态，不提高风险等级",
      changedSources: "已核对 3 个来源", preview: "预览", draftUpdate: "状态摘要草稿已更新",
      askLabel: "询问当前记录", askPlaceholder: "询问下一步要核对什么…",
    },
    en: {
      workspaceActions: "Workspace actions", follow: "Follow current record", copyLink: "Copy current record link", runScan: "Run scan",
      previousRecord: "Previous record", nextRecord: "Next record", recordActivity: "Record activity", openThread: "Open context thread",
      minimizeThread: "Collapse context thread", expandThread: "Expand context thread", closeThread: "Close context thread", attach: "Attach file",
      send: "Send", reviewMode: "Review", createdRecord: "created this record from public sources", twoMinutesAgo: "2 min ago",
      monitoringAgent: "Monitoring agent", addedLabels: "added the Stable operations and East Asia labels", commandSearchLabel: "Search workspace",
      commandSearchPlaceholder: "Search records or go to…", recordsGroup: "Records", navigateGroup: "Go to", databaseHint: "Browse entities",
      investigationHint: "Review evidence", riskHint: "Awaiting review", monitoringHint: "Recent activity", commandEmpty: "No matching records or actions.",
      connectedThread: "connected KIN to PRX-1027", examiningRecord: "Reviewing the latest status changes…", workedFor: "Reviewed for 7s",
      threadResult: "Reviewed the three latest monitoring records. The website and public channel are reachable; latency on the Hong Kong node has recovered.",
      threadChangeOne: "confirmed HK-02 recovered to 89ms", threadChangeTwo: "kept the Watch state without raising the risk level",
      changedSources: "Reviewed 3 sources", preview: "Preview", draftUpdate: "Status summary draft updated",
      askLabel: "Ask about the current record", askPlaceholder: "Ask what should be checked next…",
    },
  };

  function currentLocale() {
    return root.dataset.locale === "en" ? "en" : "zh";
  }

  function translate(locale) {
    const messages = copy[locale];
    for (const element of document.querySelectorAll("[data-context-i18n]")) {
      const value = messages[element.dataset.contextI18n];
      if (value) element.textContent = value;
    }
    for (const element of document.querySelectorAll("[data-context-i18n-aria]")) {
      const value = messages[element.dataset.contextI18nAria];
      if (value) element.setAttribute("aria-label", value);
    }
    for (const element of document.querySelectorAll("[data-context-i18n-placeholder]")) {
      const value = messages[element.dataset.contextI18nPlaceholder];
      if (value) element.setAttribute("placeholder", value);
    }
  }

  let workspaceCommandReturnTarget = workspaceSearchButtons[0];
  let workspaceCommandCloseTimer;
  let activeWorkspaceCommandIndex = 0;

  function visibleWorkspaceCommandItems() {
    return workspaceCommandItems.filter((item) => !item.hidden);
  }

  function setActiveWorkspaceCommand(index) {
    const items = visibleWorkspaceCommandItems();
    if (!items.length) {
      activeWorkspaceCommandIndex = 0;
      return;
    }
    activeWorkspaceCommandIndex = (index + items.length) % items.length;
    for (const [itemIndex, item] of items.entries()) item.dataset.active = String(itemIndex === activeWorkspaceCommandIndex);
  }

  function filterWorkspaceCommands() {
    const locale = currentLocale() === "zh" ? "zh-CN" : "en";
    const query = workspaceCommandInput.value.trim().toLocaleLowerCase(locale);
    for (const item of workspaceCommandItems) {
      const haystack = `${item.dataset.searchTerms || ""} ${item.textContent}`.toLocaleLowerCase(locale);
      item.hidden = Boolean(query) && !haystack.includes(query);
    }
    workspaceCommandEmpty.hidden = visibleWorkspaceCommandItems().length > 0;
    setActiveWorkspaceCommand(0);
  }

  function finishWorkspaceCommandClose(restoreFocus = true) {
    window.clearTimeout(workspaceCommandCloseTimer);
    workspaceCommandCloseTimer = undefined;
    if (workspaceCommand.open) workspaceCommand.close();
    workspaceCommand.dataset.state = "closed";
    for (const trigger of workspaceSearchButtons) trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus && workspaceCommandReturnTarget?.getClientRects().length) workspaceCommandReturnTarget.focus({ preventScroll: true });
  }

  function setWorkspaceCommand(open, { trigger, restoreFocus = true } = {}) {
    window.clearTimeout(workspaceCommandCloseTimer);
    workspaceCommandCloseTimer = undefined;
    if (open) {
      if (trigger) workspaceCommandReturnTarget = trigger;
      if (!workspaceCommand.open) workspaceCommand.showModal();
      workspaceCommand.dataset.state = "opening";
      for (const button of workspaceSearchButtons) button.setAttribute("aria-expanded", "true");
      workspaceCommandInput.value = "";
      filterWorkspaceCommands();
      requestAnimationFrame(() => {
        if (!workspaceCommand.open) return;
        workspaceCommand.dataset.state = "open";
        workspaceCommandInput.focus({ preventScroll: true });
      });
      return;
    }
    if (!workspaceCommand.open) return;
    workspaceCommand.dataset.state = "closing";
    for (const button of workspaceSearchButtons) button.setAttribute("aria-expanded", "false");
    if (reducedMotion.matches) finishWorkspaceCommandClose(restoreFocus);
    else workspaceCommandCloseTimer = window.setTimeout(() => finishWorkspaceCommandClose(restoreFocus), 175);
  }

  for (const button of workspaceSearchButtons) {
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "workspace-command-input");
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => setWorkspaceCommand(true, { trigger: button }));
  }

  workspaceCommandInput.addEventListener("input", filterWorkspaceCommands);
  workspaceCommandInput.addEventListener("keydown", (event) => {
    const items = visibleWorkspaceCommandItems();
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveWorkspaceCommand(activeWorkspaceCommandIndex + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter" && items[activeWorkspaceCommandIndex]) {
      event.preventDefault();
      items[activeWorkspaceCommandIndex].click();
    }
  });

  for (const item of workspaceCommandItems) {
    item.addEventListener("pointerenter", () => setActiveWorkspaceCommand(visibleWorkspaceCommandItems().indexOf(item)));
    item.addEventListener("click", () => setWorkspaceCommand(false, { restoreFocus: false }));
  }

  workspaceCommand.addEventListener("cancel", (event) => {
    event.preventDefault();
    setWorkspaceCommand(false);
  });
  workspaceCommand.addEventListener("click", (event) => {
    if (event.target === workspaceCommand) setWorkspaceCommand(false);
  });

  let contextReturnTarget = contextToggles[0];

  function setContextCollapsed(collapsed) {
    contextThread.dataset.collapsed = String(collapsed);
    contextMinimize.setAttribute("aria-pressed", String(collapsed));
    contextFeed.inert = collapsed;
    contextForm.inert = collapsed;
    if (collapsed && contextThread.contains(document.activeElement)) contextMinimize.focus({ preventScroll: true });
  }

  function setContextExpanded(expanded) {
    contextThread.dataset.expanded = String(expanded);
    contextExpand.setAttribute("aria-pressed", String(expanded));
    if (expanded) setContextCollapsed(false);
  }

  function setContextThread(open, { trigger, restoreFocus = false, moveFocus = true } = {}) {
    if (open && trigger) contextReturnTarget = trigger;
    contextThread.dataset.state = open ? "open" : "closed";
    contextThread.inert = !open;
    contextLauncher.hidden = open;
    contextLauncher.inert = open;
    for (const toggle of contextToggles) toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      setContextCollapsed(false);
      if (moveFocus) contextInput.focus({ preventScroll: true });
    } else {
      setContextExpanded(false);
      if (restoreFocus && contextReturnTarget?.getClientRects().length) contextReturnTarget.focus({ preventScroll: true });
    }
  }

  for (const toggle of contextToggles) toggle.addEventListener("click", () => setContextThread(true, { trigger: toggle }));
  contextClose.addEventListener("click", () => setContextThread(false, { restoreFocus: true }));
  contextMinimize.addEventListener("click", () => setContextCollapsed(contextThread.dataset.collapsed !== "true"));
  contextExpand.addEventListener("click", () => setContextExpanded(contextThread.dataset.expanded !== "true"));
  contextFollow.addEventListener("click", () => {
    const active = contextFollow.getAttribute("aria-pressed") === "true";
    contextFollow.setAttribute("aria-pressed", String(!active));
    contextFollow.dataset.active = String(!active);
    showToast("follow");
  });
  contextMore.addEventListener("click", () => locationOverflowTrigger.click());
  for (const button of contextCopyButtons) button.addEventListener("click", copyCurrentLocation);
  for (const button of contextScanButtons) button.addEventListener("click", () => showToast("scan"));
  contextAttach.addEventListener("click", () => contextFile.click());
  contextFile.addEventListener("change", () => {
    const file = contextFile.files?.[0];
    if (!file) return;
    const note = document.createElement("p");
    note.className = "context-user-note";
    note.textContent = file.name;
    contextFeed.append(note);
    contextFeed.scrollTo({ top: contextFeed.scrollHeight, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });

  function syncContextSend() {
    contextSend.disabled = !contextInput.value.trim();
  }

  contextInput.addEventListener("input", syncContextSend);
  contextInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      contextForm.requestSubmit();
    }
  });
  contextForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = contextInput.value.trim();
    if (!message) return;
    const note = document.createElement("p");
    note.className = "context-user-note";
    note.textContent = message;
    contextFeed.append(note);
    contextInput.value = "";
    syncContextSend();
    contextFeed.scrollTo({ top: contextFeed.scrollHeight, behavior: reducedMotion.matches ? "auto" : "smooth" });
    contextInput.focus({ preventScroll: true });
  });

  function handleKeydown(event) {
    const target = event.target;
    const editable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") || (event.key === "/" && !editable)) {
      event.preventDefault();
      const visibleTrigger = workspaceSearchButtons.find((button) => button.getClientRects().length) || workspaceSearchButtons[0];
      setWorkspaceCommand(true, { trigger: visibleTrigger });
      return true;
    }
    if (event.key === "Escape" && workspaceCommand.open) {
      event.preventDefault();
      setWorkspaceCommand(false);
      return true;
    }
    if (event.key === "Escape" && contextThread.dataset.state !== "closed" && contextThread.contains(document.activeElement)) {
      setContextThread(false, { restoreFocus: true });
      return true;
    }
    return false;
  }

  syncContextSend();
  if (overlayLayout.matches) setContextThread(false, { moveFocus: false });

  return { handleKeydown, setOpen: setContextThread, translate };
}
