import {
  Archive,
  Blocks,
  Check,
  ChevronDown,
  CirclePlay,
  Copy,
  createIcons,
  Download,
  Ellipsis,
  Info,
  GripHorizontal,
  Keyboard,
  LoaderCircle,
  Moon,
  MousePointer2,
  MoveVertical,
  PanelLeft,
  PanelRightOpen,
  Pause,
  Pencil,
  Repeat2,
  Save,
  Search,
  Sun,
  Timer,
  X,
} from "lucide";

const icons = {
  Archive,
  Blocks,
  Check,
  ChevronDown,
  CirclePlay,
  Copy,
  Download,
  Ellipsis,
  GripHorizontal,
  Info,
  Keyboard,
  LoaderCircle,
  Moon,
  MousePointer2,
  MoveVertical,
  PanelLeft,
  PanelRightOpen,
  Pause,
  Pencil,
  Repeat2,
  Save,
  Search,
  Sun,
  Timer,
  X,
};
const colorScheme = matchMedia("(prefers-color-scheme: dark)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const root = document.documentElement;
const themeControl = document.querySelector("[data-lab-theme-control]");
const themeSwitch = document.querySelector("[data-lab-theme]");
const themeMenuTrigger = document.querySelector("[data-lab-theme-menu-trigger]");
const themeMenu = document.querySelector("[data-lab-theme-menu]");
const themeOptions = [...document.querySelectorAll("[data-lab-theme-preference]")];
let sonnerModulePromise;

function renderIcons() {
  createIcons({ icons, attrs: { "aria-hidden": "true", "stroke-width": 1.5 } });
}

function resolvedTheme(preference) {
  return preference === "system" ? (colorScheme.matches ? "dark" : "light") : preference;
}

function applyTheme(preference, persist = true) {
  const theme = resolvedTheme(preference);
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#08090a" : "#f6f7f8";
  themeSwitch.dataset.preference = preference;
  themeSwitch.setAttribute("aria-checked", String(theme === "dark"));
  themeSwitch.setAttribute("aria-label", `${preference === "system" ? "当前跟随系统。" : ""}${theme === "dark" ? "切换到日间模式" : "切换到夜间模式"}`);
  for (const option of themeOptions) {
    const selected = option.dataset.labThemePreference === preference;
    option.setAttribute("aria-checked", String(selected));
    option.setAttribute("aria-current", selected ? "true" : "false");
  }
  if (persist) localStorage.setItem("kin-reference-theme", preference);
  if (sonnerModulePromise) sonnerModulePromise.then((module) => module.updateToasterTheme(theme, "zh"));
}

function updateMotionPreference() {
  document.querySelector("[data-motion-preference]").textContent = reducedMotion.matches ? "减少动态效果" : "普通动效";
  document.querySelector("[data-motion-travel]").textContent = reducedMotion.matches ? "短淡入淡出" : "方向一致、可反向";
}

const speedButton = document.querySelector("[data-lab-speed]");
const speedStatus = document.querySelector("[data-motion-review-speed]");
function setReviewSpeed(slow) {
  const enabled = slow && !reducedMotion.matches;
  document.body.dataset.reviewSpeed = enabled ? "slow" : "normal";
  speedButton.setAttribute("aria-pressed", String(enabled));
  speedButton.querySelector("span").textContent = enabled ? "恢复正常" : "4× 慢速";
  speedStatus.textContent = reducedMotion.matches ? "减少动态优先" : enabled ? "4× 慢速" : "1× 正常";
}

speedButton.addEventListener("click", () => {
  setReviewSpeed(speedButton.getAttribute("aria-pressed") !== "true");
});

const transientCleanups = new WeakMap();
function setTransientSurface(surface, open, { trigger, focusTarget, restoreFocus = false } = {}) {
  transientCleanups.get(surface)?.();

  if (open) {
    surface.hidden = false;
    surface.inert = false;
    surface.dataset.state = "opening";
    trigger?.setAttribute("aria-expanded", "true");
    focusTarget?.focus();
    requestAnimationFrame(() => {
      if (surface.dataset.state !== "opening") return;
      surface.dataset.state = "open";
    });
    return;
  }

  trigger?.setAttribute("aria-expanded", "false");
  surface.inert = true;
  surface.dataset.state = "closing";
  if (restoreFocus) trigger?.focus();

  let timer;
  const detach = () => {
    window.clearTimeout(timer);
    surface.removeEventListener("transitionend", onTransitionEnd);
    transientCleanups.delete(surface);
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
  timer = window.setTimeout(finish, reducedMotion.matches ? 90 : document.body.dataset.reviewSpeed === "slow" ? 760 : 190);
  transientCleanups.set(surface, detach);
}

function themeMenuIsOpen() {
  return themeMenu.dataset.state === "opening" || themeMenu.dataset.state === "open";
}

function setThemeMenu(open, restoreFocus = false) {
  const selected = themeOptions.find((option) => option.getAttribute("aria-checked") === "true") ?? themeOptions[0];
  setTransientSurface(themeMenu, open, {
    trigger: themeMenuTrigger,
    focusTarget: open ? selected : null,
    restoreFocus,
  });
}

themeSwitch.addEventListener("click", () => {
  if (themeMenuIsOpen()) setThemeMenu(false);
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
themeMenuTrigger.addEventListener("click", () => setThemeMenu(!themeMenuIsOpen()));
for (const option of themeOptions) {
  option.addEventListener("click", () => {
    applyTheme(option.dataset.labThemePreference);
    setThemeMenu(false, true);
  });
}
themeMenu.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    setThemeMenu(false, true);
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const index = themeOptions.indexOf(document.activeElement);
  event.preventDefault();
  const next = event.key === "Home"
    ? 0
    : event.key === "End"
      ? themeOptions.length - 1
      : (index + (event.key === "ArrowDown" ? 1 : -1) + themeOptions.length) % themeOptions.length;
  themeOptions[next]?.focus();
});
document.addEventListener("pointerdown", (event) => {
  if (themeMenuIsOpen() && !themeControl.contains(event.target)) setThemeMenu(false);
});
colorScheme.addEventListener("change", () => {
  if (root.dataset.themePreference === "system") applyTheme("system", false);
});
addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
});
reducedMotion.addEventListener("change", () => {
  updateMotionPreference();
  setReviewSpeed(false);
});

const frequencySurface = document.querySelector("[data-frequency-surface]");
const frequencySearch = document.querySelector("[data-frequency-search]");
const frequencyClose = document.querySelector("[data-frequency-close]");
const frequencyKeyboard = document.querySelector("[data-frequency-keyboard]");
const frequencyPointer = document.querySelector("[data-frequency-pointer]");
const frequencyStatus = document.querySelector("[data-frequency-status]");
let frequencyTrigger = frequencyKeyboard;

function isEditableTarget(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

function openFrequencySurface(invocation, trigger) {
  frequencyTrigger = trigger;
  frequencyKeyboard.setAttribute("aria-expanded", String(trigger === frequencyKeyboard));
  frequencyPointer.setAttribute("aria-expanded", String(trigger === frequencyPointer));
  frequencySurface.hidden = false;
  frequencySurface.inert = false;
  frequencySurface.dataset.invocation = invocation;
  frequencySurface.dataset.state = invocation === "keyboard" || reducedMotion.matches ? "open" : "opening";
  frequencySearch.focus();
  frequencyStatus.textContent = invocation === "keyboard"
    ? "键盘路径：输入框已在同一交互任务中聚焦，没有等待入场动效。"
    : "指针路径：保留 100ms 透明度反馈，焦点与结果不延迟。";
  if (frequencySurface.dataset.state === "opening") {
    requestAnimationFrame(() => {
      if (frequencySurface.dataset.state === "opening") frequencySurface.dataset.state = "open";
    });
  }
}

function closeFrequencySurface(restoreFocus = true) {
  frequencyKeyboard.setAttribute("aria-expanded", "false");
  frequencyPointer.setAttribute("aria-expanded", "false");
  frequencySurface.dataset.state = "closed";
  frequencySurface.hidden = true;
  frequencySurface.inert = true;
  if (restoreFocus) frequencyTrigger?.focus();
  frequencyStatus.textContent = "已关闭；再次调用不会等待旧计时器。";
}

frequencyKeyboard.addEventListener("click", () => openFrequencySurface("keyboard", frequencyKeyboard));
frequencyPointer.addEventListener("click", () => openFrequencySurface("pointer", frequencyPointer));
frequencyClose.addEventListener("click", () => closeFrequencySurface());
frequencySurface.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeFrequencySurface();
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !isEditableTarget(event.target)) {
    event.preventDefault();
    openFrequencySurface("keyboard", frequencyKeyboard);
  }
});

const paired = document.querySelector("[data-lab-toggle]");
paired.addEventListener("click", () => {
  const active = paired.getAttribute("aria-pressed") !== "true";
  paired.setAttribute("aria-pressed", String(active));
  paired.dataset.controlState = active ? "active" : "default";
  paired.querySelector("[data-action-label]").textContent = active ? "暂停同步" : "开始同步";
});

const asyncButton = document.querySelector("[data-lab-async]");
asyncButton.addEventListener("click", () => {
  if (asyncButton.disabled) return;
  const label = asyncButton.querySelector("[data-action-label]");
  asyncButton.disabled = true;
  asyncButton.classList.add("is-pending");
  asyncButton.dataset.controlState = "pending";
  label.textContent = "正在保存";
  window.setTimeout(async () => {
    asyncButton.classList.remove("is-pending");
    asyncButton.classList.add("is-complete");
    asyncButton.dataset.controlState = "success";
    label.textContent = "已保存";
    const sonner = await getSonner();
    sonner.showKinToast({ title: "布局已保存", description: "当前视图的密度和列顺序已经更新。", theme: document.documentElement.dataset.theme, locale: "zh", tone: "success" });
    window.setTimeout(() => {
      asyncButton.classList.remove("is-complete");
      asyncButton.disabled = false;
      asyncButton.dataset.controlState = "default";
      label.textContent = "保存布局";
    }, 1100);
  }, 650);
});

async function getSonner() {
  sonnerModulePromise ??= import("../../site/assets/sonner-island.js");
  return sonnerModulePromise;
}
document.querySelector("[data-lab-task]").addEventListener("click", async () => {
  const sonner = await getSonner();
  sonner.showKinTaskToast({ loadingTitle: "正在创建导出任务", successTitle: "导出任务已创建", description: "任务完成后可在下载中心查看。", theme: document.documentElement.dataset.theme, locale: "zh", duration: 850 });
});

const menuTrigger = document.querySelector("[data-lab-menu-trigger]");
const menu = document.querySelector(".lab-menu");
const menuItems = [...menu.querySelectorAll('[role="menuitem"]')];
function setMenu(open, restoreFocus = false) {
  setTransientSurface(menu, open, { trigger: menuTrigger, focusTarget: menuItems[0], restoreFocus });
}
menuTrigger.addEventListener("click", () => setMenu(menu.hidden || menu.dataset.state === "closing"));
menu.addEventListener("keydown", (event) => {
  const current = menuItems.indexOf(document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    menuItems[(current + (event.key === "ArrowDown" ? 1 : -1) + menuItems.length) % menuItems.length].focus();
  }
  if (event.key === "Escape") setMenu(false, true);
});
for (const item of menuItems) item.addEventListener("click", () => setMenu(false, true));

const popoverTrigger = document.querySelector("[data-lab-popover-trigger]");
const popover = document.querySelector(".lab-popover");
const popoverClose = document.querySelector("[data-lab-popover-close]");
function setPopover(open, restoreFocus = false) {
  setTransientSurface(popover, open, { trigger: popoverTrigger, focusTarget: popoverClose, restoreFocus });
}
popoverTrigger.addEventListener("click", () => setPopover(popover.hidden || popover.dataset.state === "closing"));
popoverClose.addEventListener("click", () => setPopover(false, true));
popover.addEventListener("keydown", (event) => { if (event.key === "Escape") setPopover(false, true); });

const tooltipGroup = document.querySelector("[data-tooltip-group]");
const tooltipTriggers = [...tooltipGroup.querySelectorAll("[data-lab-tooltip-trigger]")];
const tooltipStatus = document.querySelector("[data-tooltip-status]");
const tooltipDelay = 500;
const tooltipSequenceWindow = 600;
let activeTooltip;
let tooltipTimer;
let tooltipSequenceUntil = 0;

function tooltipFor(trigger) {
  return document.getElementById(trigger.getAttribute("aria-describedby"));
}

function hideLabTooltip(trigger, preserveSequence = true) {
  window.clearTimeout(tooltipTimer);
  const wasActive = Boolean(activeTooltip && (!trigger || activeTooltip === trigger));
  const tooltip = trigger ? tooltipFor(trigger) : activeTooltip ? tooltipFor(activeTooltip) : null;
  if (tooltip) {
    tooltip.dataset.state = "closed";
    tooltip.hidden = true;
  }
  if (preserveSequence && wasActive) tooltipSequenceUntil = performance.now() + tooltipSequenceWindow;
  if (!trigger || activeTooltip === trigger) activeTooltip = undefined;
}

function showLabTooltip(trigger, input) {
  window.clearTimeout(tooltipTimer);
  if (trigger.dataset.tooltipDismissed === "true") return;
  const instant = input === "keyboard" || Boolean(activeTooltip) || performance.now() < tooltipSequenceUntil;
  const open = () => {
    if (activeTooltip && activeTooltip !== trigger) hideLabTooltip(activeTooltip, false);
    const tooltip = tooltipFor(trigger);
    activeTooltip = trigger;
    tooltip.hidden = false;
    tooltip.dataset.instant = String(instant || reducedMotion.matches);
    tooltip.dataset.input = input;
    tooltip.dataset.state = instant || reducedMotion.matches ? "open" : "opening";
    tooltipStatus.textContent = input === "keyboard"
      ? "键盘焦点：Tooltip 即时可见。"
      : instant
        ? "连续指针：同组 Tooltip 即时切换。"
        : "首次指针：等待 500ms 后，以 125ms 反馈出现。";
    if (tooltip.dataset.state === "opening") {
      requestAnimationFrame(() => {
        if (tooltip.dataset.state === "opening") tooltip.dataset.state = "open";
      });
    }
  };
  if (instant) open();
  else tooltipTimer = window.setTimeout(open, tooltipDelay);
}

for (const trigger of tooltipTriggers) {
  trigger.addEventListener("pointerenter", () => showLabTooltip(trigger, "pointer"));
  trigger.addEventListener("pointerleave", () => {
    if (document.activeElement === trigger) return;
    trigger.dataset.tooltipDismissed = "false";
    hideLabTooltip(trigger);
  });
  trigger.addEventListener("focus", () => showLabTooltip(trigger, "keyboard"));
  trigger.addEventListener("blur", () => {
    if (trigger.matches(":hover")) return;
    trigger.dataset.tooltipDismissed = "false";
    hideLabTooltip(trigger);
  });
  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    trigger.dataset.tooltipDismissed = "true";
    hideLabTooltip(trigger, false);
    tooltipStatus.textContent = "Tooltip 已关闭；焦点离开后恢复正常序列。";
  });
}

const disclosure = document.querySelector("[data-lab-disclosure]");
const details = document.querySelector("#lab-details");
details.inert = true;
disclosure.addEventListener("click", () => {
  const open = disclosure.getAttribute("aria-expanded") !== "true";
  disclosure.setAttribute("aria-expanded", String(open));
  details.dataset.state = open ? "open" : "closed";
  details.setAttribute("aria-hidden", String(!open));
  details.inert = !open;
  details.hidden = !open;
});

const gestureStage = document.querySelector("[data-gesture-stage]");
const gestureSheet = document.querySelector("[data-gesture-sheet]");
const gestureHandle = document.querySelector("[data-gesture-handle]");
const gestureToggle = document.querySelector("[data-gesture-toggle]");
const gestureStatus = document.querySelector("[data-gesture-status]");
const gestureIntentThreshold = 10;
const gestureFlickThreshold = 0.11;
const gestureDeceleration = 0.998;
const gestureRubberBand = 0.55;
let gestureOffset = 0;
let gestureMaximum = 120;
let gesturePointer;
let gestureStartY = 0;
let gestureStartOffset = 0;
let gestureCommitted = false;
let gestureSuppressClick = false;
let gestureHistory = [];
let gestureFrame;

function updateGestureMaximum() {
  gestureMaximum = Math.max(72, Math.min(140, gestureSheet.offsetHeight - 52, gestureStage.clientHeight - 58));
  gestureOffset = Math.min(gestureOffset, gestureMaximum);
  gestureSheet.style.transform = `translateY(${gestureOffset}px)`;
}

function rubberBand(distance, dimension) {
  return (distance * dimension * gestureRubberBand) / (dimension + gestureRubberBand * distance);
}

function constrainedGestureOffset(rawOffset) {
  if (rawOffset < 0) return -rubberBand(-rawOffset, gestureMaximum);
  if (rawOffset > gestureMaximum) return gestureMaximum + rubberBand(rawOffset - gestureMaximum, gestureMaximum);
  return rawOffset;
}

function renderGestureSheet(offset) {
  gestureOffset = offset;
  gestureSheet.style.transform = `translateY(${offset}px)`;
}

function finishGestureSheet(target) {
  const collapsed = target > 0;
  renderGestureSheet(target);
  gestureSheet.dataset.state = collapsed ? "collapsed" : "expanded";
  gestureHandle.setAttribute("aria-expanded", String(!collapsed));
  gestureToggle.setAttribute("aria-expanded", String(!collapsed));
  gestureToggle.querySelector("span").textContent = collapsed ? "展开 Sheet" : "收起 Sheet";
  gestureStatus.textContent = collapsed ? "Sheet 已收起；按钮或反向拖动可重新展开。" : "Sheet 已展开；等待拖动。";
}

function settleGestureSheet(target, initialVelocity = 0, fromGesture = false) {
  cancelAnimationFrame(gestureFrame);
  const boundedTarget = target > gestureMaximum / 2 ? gestureMaximum : 0;
  if (reducedMotion.matches) {
    finishGestureSheet(boundedTarget);
    return;
  }

  let position = gestureOffset;
  let velocity = Math.max(-1.6, Math.min(1.6, initialVelocity)) * 1000;
  let previousTime = performance.now();
  const stiffness = 360;
  const damping = fromGesture ? 34 : 38;
  gestureSheet.dataset.state = "settling";

  const tick = (time) => {
    const reviewScale = document.body.dataset.reviewSpeed === "slow" ? 0.25 : 1;
    const delta = Math.min((time - previousTime) / 1000, 0.032) * reviewScale;
    previousTime = time;
    const acceleration = -stiffness * (position - boundedTarget) - damping * velocity;
    velocity += acceleration * delta;
    position += velocity * delta;
    renderGestureSheet(position);
    if (Math.abs(position - boundedTarget) < 0.35 && Math.abs(velocity) < 6) {
      finishGestureSheet(boundedTarget);
      return;
    }
    gestureFrame = requestAnimationFrame(tick);
  };
  gestureFrame = requestAnimationFrame(tick);
}

function gestureVelocity() {
  const latest = gestureHistory.at(-1);
  const earliest = gestureHistory.find((sample) => latest.time - sample.time <= 100) ?? gestureHistory[0];
  const elapsed = Math.max(1, latest.time - earliest.time);
  return (latest.y - earliest.y) / elapsed;
}

gestureHandle.addEventListener("pointerdown", (event) => {
  if (gesturePointer !== undefined || event.button !== 0 || !event.isPrimary) return;
  cancelAnimationFrame(gestureFrame);
  gesturePointer = event.pointerId;
  gestureStartY = event.clientY;
  gestureStartOffset = Math.max(0, Math.min(gestureMaximum, gestureOffset));
  gestureCommitted = false;
  gestureSuppressClick = false;
  gestureHistory = [{ y: event.clientY, time: event.timeStamp }];
  gestureStatus.textContent = "等待约 10px 操作意图；尚未接管手势。";
});

gestureHandle.addEventListener("pointermove", (event) => {
  if (event.pointerId !== gesturePointer) return;
  const delta = event.clientY - gestureStartY;
  if (!gestureCommitted && Math.abs(delta) < gestureIntentThreshold) return;
  if (!gestureCommitted) {
    gestureCommitted = true;
    gestureHandle.setPointerCapture(event.pointerId);
    gestureHandle.dataset.captured = "true";
    gestureSheet.dataset.state = "dragging";
    gestureStatus.textContent = "手势已接管；Sheet 与指针 1:1 跟随，越界后逐渐增加阻力。";
  }
  gestureHistory.push({ y: event.clientY, time: event.timeStamp });
  gestureHistory = gestureHistory.filter((sample) => event.timeStamp - sample.time <= 120).slice(-8);
  renderGestureSheet(constrainedGestureOffset(gestureStartOffset + delta));
});

function releaseGesture(event, cancelled = false) {
  if (event.pointerId !== gesturePointer) return;
  if (!gestureCommitted) {
    gesturePointer = undefined;
    gestureStatus.textContent = "未达到操作阈值；Sheet 状态保持不变。";
    return;
  }

  gestureHistory.push({ y: event.clientY, time: event.timeStamp });
  const velocity = cancelled ? 0 : gestureVelocity();
  const projected = gestureOffset + velocity * (gestureDeceleration / (1 - gestureDeceleration));
  const target = cancelled
    ? (gestureOffset > gestureMaximum / 2 ? gestureMaximum : 0)
    : (velocity > gestureFlickThreshold || projected > gestureMaximum / 2 ? gestureMaximum : 0);
  gesturePointer = undefined;
  if (gestureHandle.hasPointerCapture(event.pointerId)) gestureHandle.releasePointerCapture(event.pointerId);
  gestureHandle.dataset.captured = "false";
  gestureSuppressClick = !cancelled;
  gestureStatus.textContent = cancelled
    ? "指针被系统取消；回到最近稳定落点。"
    : `松手速度 ${velocity.toFixed(2)} px/ms；投影选择${target ? "收起" : "展开"}落点。`;
  settleGestureSheet(target, velocity, !cancelled);
}

gestureHandle.addEventListener("pointerup", (event) => releaseGesture(event));
gestureHandle.addEventListener("pointercancel", (event) => releaseGesture(event, true));
gestureHandle.addEventListener("lostpointercapture", (event) => {
  if (event.pointerId !== gesturePointer) return;
  gesturePointer = undefined;
  gestureHandle.dataset.captured = "false";
  gestureSuppressClick = false;
  gestureStatus.textContent = "指针捕获意外结束；回到最近稳定落点。";
  settleGestureSheet(gestureOffset > gestureMaximum / 2 ? gestureMaximum : 0);
});
gestureHandle.addEventListener("click", (event) => {
  if (gestureSuppressClick) {
    gestureSuppressClick = false;
    event.preventDefault();
    return;
  }
  settleGestureSheet(gestureOffset > gestureMaximum / 2 ? 0 : gestureMaximum);
});
gestureToggle.addEventListener("click", () => {
  settleGestureSheet(gestureOffset > gestureMaximum / 2 ? 0 : gestureMaximum);
});
window.addEventListener("resize", updateGestureMaximum);

const drawerLayer = document.querySelector("[data-lab-drawer-layer]");
const drawer = drawerLayer.querySelector(".motion-drawer");
const drawerOpen = document.querySelector("[data-lab-drawer-open]");
const drawerClose = document.querySelector("[data-lab-drawer-close]");
const drawerScrim = document.querySelector("[data-lab-drawer-scrim]");
const drawerReverse = document.querySelector("[data-lab-drawer-reverse]");
const drawerStatus = document.querySelector("[data-lab-drawer-status]");
const header = document.querySelector(".reference-header");
const main = document.querySelector("#motion-lab");
let drawerPhaseTimer;
let reversalTimer;

function setDrawer(open, restoreFocus = true) {
  window.clearTimeout(drawerPhaseTimer);
  drawerLayer.dataset.state = open ? "open" : "closed";
  drawerLayer.dataset.phase = open ? "opening" : "closing";
  drawerLayer.setAttribute("aria-hidden", String(!open));
  drawerLayer.inert = !open;
  header.inert = open;
  main.inert = open;
  document.body.classList.toggle("drawer-modal-open", open);
  drawerOpen.setAttribute("aria-expanded", String(open));
  if (open) drawerClose.focus();
  else if (restoreFocus) drawerOpen.focus();
  drawerPhaseTimer = window.setTimeout(() => {
    if (drawerLayer.dataset.state === (open ? "open" : "closed")) drawerLayer.dataset.phase = open ? "open" : "closed";
  }, reducedMotion.matches ? 90 : document.body.dataset.reviewSpeed === "slow" ? 940 : 240);
}

drawerLayer.inert = true;
drawerOpen.addEventListener("click", () => setDrawer(true));
drawerClose.addEventListener("click", () => setDrawer(false));
drawerScrim.addEventListener("click", () => setDrawer(false));
drawerReverse.addEventListener("click", () => {
  window.clearTimeout(reversalTimer);
  drawerStatus.textContent = "正在关闭并从当前位置反向打开…";
  setDrawer(false, false);
  reversalTimer = window.setTimeout(() => {
    setDrawer(true, false);
    drawerStatus.textContent = "最后请求为打开；没有旧的关闭计时器覆盖当前状态。";
  }, reducedMotion.matches ? 20 : document.body.dataset.reviewSpeed === "slow" ? 320 : 80);
});
drawer.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { event.preventDefault(); setDrawer(false); }
  if (event.key !== "Tab") return;
  const focusable = [...drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

applyTheme(document.documentElement.dataset.themePreference || "system", false);
updateMotionPreference();
setReviewSpeed(false);
updateGestureMaximum();
finishGestureSheet(0);
renderIcons();
