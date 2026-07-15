import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleAlert,
  ClipboardCheck,
  Clock,
  Copy,
  createIcons,
  Database,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Globe2,
  KeyRound,
  Languages,
  ListChecks,
  LayoutList,
  LockKeyhole,
  MessageSquarePlus,
  Megaphone,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  PanelRightOpen,
  Palette,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  TicketCheck,
  UserRound,
  Users,
  X,
} from "lucide";
import { lockModalScroll, unlockModalScroll } from "../shared/modal-scroll-lock.js";

const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeSwitch = document.querySelector("[data-theme-switch]");
const themeMenuTrigger = document.querySelector("[data-theme-menu-trigger]");
const themeMenu = document.querySelector("[data-theme-menu]");
const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
const languageTrigger = document.querySelector("[data-language-trigger]");
const languageMenu = document.querySelector("[data-language-menu]");
const languageOptions = [...document.querySelectorAll("[data-language-option]")];
const dictionaryElement = document.querySelector("[data-i18n-dictionary]");
const dictionary = dictionaryElement ? JSON.parse(dictionaryElement.textContent) : {};

function text(key, locale = root.lang || "zh-CN") {
  return dictionary[locale]?.[key] ?? dictionary["zh-CN"]?.[key] ?? key;
}

function applyTheme(preference, persist = true) {
  const resolved = preference === "system" ? (media.matches ? "dark" : "light") : preference;
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  themeColor?.setAttribute("content", resolved === "dark" ? "#08090a" : "#f6f7f8");
  themeSwitch?.setAttribute("aria-checked", String(resolved === "dark"));
  themeSwitch?.setAttribute("aria-label", text(resolved === "dark" ? "common.themeLight" : "common.themeDark"));
  for (const option of themeOptions) option.setAttribute("aria-checked", String(option.dataset.themeOption === preference));
  if (persist) localStorage.setItem("kin-reference-theme", preference);
  for (const input of document.querySelectorAll('[name="appearance-theme"]')) input.checked = input.value === preference;
}

function applyLocale(locale, persist = true) {
  locale = locale === "en" ? "en" : "zh-CN";
  root.lang = locale;
  root.dir = dictionary[locale]?.["common.direction"] === "rtl" ? "rtl" : "ltr";

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = text(element.dataset.i18n, locale);
  }
  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.setAttribute("placeholder", text(element.dataset.i18nPlaceholder, locale));
  }
  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", text(element.dataset.i18nAria, locale));
  }
  for (const option of languageOptions) option.setAttribute("aria-checked", String(option.dataset.languageOption === locale));
  languageTrigger?.setAttribute("aria-label", text("common.language", locale));
  applyTheme(root.dataset.themePreference || "system", false);
  document.title = text("meta.title", locale);
  if (persist) localStorage.setItem("kin-reference-locale", locale === "en" ? "en" : "zh");

  if (document.body.dataset.page === "system") renderSystemState(currentSystemState(), false);
  document.dispatchEvent(new CustomEvent("kin:localechange", { detail: { locale } }));
}

function createMenuController(menu, trigger, options) {
  if (!menu || !trigger) return null;
  let closeTimer = 0;
  let transitionListener = null;

  function cancelCloseCleanup() {
    clearTimeout(closeTimer);
    closeTimer = 0;
    if (transitionListener) menu.removeEventListener("transitionend", transitionListener);
    transitionListener = null;
  }

  function finishClose() {
    if (menu.dataset.state !== "closing") return;
    cancelCloseCleanup();
    menu.dataset.state = "closed";
    menu.hidden = true;
    menu.inert = false;
    menu.removeAttribute("aria-hidden");
  }

  function open() {
    const reversing = menu.dataset.state === "closing";
    cancelCloseCleanup();
    menu.hidden = false;
    menu.inert = false;
    menu.removeAttribute("aria-hidden");
    trigger.setAttribute("aria-expanded", "true");
    if (!reversing) {
      menu.dataset.state = "opening";
      menu.getBoundingClientRect();
    }
    menu.dataset.state = "open";
    const selected = options.find((option) => option.getAttribute("aria-checked") === "true");
    (selected ?? options[0])?.focus();
  }

  function close(restoreFocus = true) {
    if (menu.hidden || menu.dataset.state === "closed") return;
    cancelCloseCleanup();
    trigger.setAttribute("aria-expanded", "false");
    menu.dataset.state = "closing";
    menu.inert = true;
    menu.setAttribute("aria-hidden", "true");
    if (restoreFocus) trigger.focus();
    transitionListener = (event) => {
      if (event.target === menu && event.propertyName === "opacity") finishClose();
    };
    menu.addEventListener("transitionend", transitionListener);
    closeTimer = setTimeout(finishClose, 240);
  }

  return {
    close,
    isOpen: () => !menu.hidden && menu.dataset.state !== "closing" && menu.dataset.state !== "closed",
    open,
    toggle: () => (!menu.hidden && menu.dataset.state !== "closing" ? close() : open()),
  };
}

const languageMenuController = createMenuController(languageMenu, languageTrigger, languageOptions);
const themeMenuController = createMenuController(themeMenu, themeMenuTrigger, themeOptions);

function bindMenuKeyboard(menu, options, controller) {
  menu?.addEventListener("keydown", (event) => {
    const index = options.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home"
        ? 0
        : event.key === "End"
          ? options.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[next]?.focus();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      controller?.close();
    }
  });
}

themeSwitch?.addEventListener("click", () => {
  themeMenuController?.close(false);
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
themeMenuTrigger?.addEventListener("click", () => themeMenuController?.toggle());
for (const option of themeOptions) {
  option.addEventListener("click", () => {
    applyTheme(option.dataset.themeOption);
    themeMenuController?.close();
  });
}
languageTrigger?.addEventListener("click", () => languageMenuController?.toggle());
for (const option of languageOptions) {
  option.addEventListener("click", () => {
    const locale = option.dataset.languageOption;
    applyLocale(locale);
    const url = new URL(window.location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", locale);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
    languageMenuController?.close();
  });
}

bindMenuKeyboard(languageMenu, languageOptions, languageMenuController);
bindMenuKeyboard(themeMenu, themeOptions, themeMenuController);

document.addEventListener("click", (event) => {
  if (languageMenuController?.isOpen() && !event.target.closest(".language-control")) languageMenuController.close(false);
  if (themeMenuController?.isOpen() && !event.target.closest(".theme-control")) themeMenuController.close(false);
});

media.addEventListener("change", () => {
  if (root.dataset.themePreference === "system") applyTheme("system", false);
});

addEventListener("storage", (event) => {
  if (event.key === "kin-reference-theme") applyTheme(event.newValue || "system", false);
  if (event.key === "kin-reference-locale") applyLocale(event.newValue || "zh", false);
});

function setupPasswords() {
  for (const toggle of document.querySelectorAll("[data-password-toggle]")) {
    const input = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!input) continue;
    toggle.addEventListener("click", () => {
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      toggle.dataset.visible = String(!visible);
      toggle.setAttribute("aria-pressed", String(!visible));
      toggle.setAttribute("aria-label", text(visible ? "access.showPassword" : "access.hidePassword"));
      input.focus();
    });
  }
}

function setupAccessPage() {
  const signInView = document.querySelector("[data-sign-in-view]");
  const recoveryView = document.querySelector("[data-recovery-view]");
  const recoveryOpen = document.querySelector("[data-recovery-open]");
  const recoveryBack = document.querySelector("[data-recovery-back]");
  const signInForm = document.querySelector("[data-sign-in-form]");
  const signInStatus = document.querySelector("[data-sign-in-status]");
  const recoveryForm = document.querySelector("[data-recovery-form]");
  const recoveryStatus = document.querySelector("[data-recovery-status]");
  const authFixture = document.querySelector("[data-auth-fixture]");
  const authFixtureSelect = document.querySelector("[data-auth-fixture-select]");
  const authFixtureStatus = document.querySelector("[data-auth-fixture-status]");
  const reauthOpen = document.querySelector("[data-reauth-open]");
  const reauthDialog = document.querySelector("[data-reauth-dialog]");
  const reauthCancel = document.querySelector("[data-reauth-cancel]");
  const reauthForm = document.querySelector("[data-reauth-form]");
  const reauthStatus = document.querySelector("[data-reauth-status]");
  const validationContexts = [
    [signInForm, signInStatus],
    [recoveryForm, recoveryStatus],
    [reauthForm, reauthStatus],
  ].filter(([form, status]) => form && status);
  let reauthCloseTimer = 0;
  let reauthTransitionListener = null;

  function validationMessage(input) {
    if (input.validity.valueMissing) return text(input.type === "email" ? "access.emailRequired" : "access.passwordRequired");
    if (input.type === "email" && input.validity.typeMismatch) return text("access.emailInvalid");
    return text("access.formInvalid");
  }

  function fieldErrorFor(input) {
    return document.getElementById(`${input.id}-error`);
  }

  function setFieldError(input, message) {
    const error = fieldErrorFor(input);
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
    input.setAttribute("aria-invalid", "true");
    const describedBy = new Set((input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    describedBy.add(error.id);
    input.setAttribute("aria-describedby", [...describedBy].join(" "));
  }

  function clearFieldError(input) {
    const error = fieldErrorFor(input);
    if (!error) return;
    error.hidden = true;
    error.textContent = "";
    input.setAttribute("aria-invalid", "false");
    const describedBy = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter((id) => id && id !== error.id);
    if (describedBy.length) input.setAttribute("aria-describedby", describedBy.join(" "));
    else input.removeAttribute("aria-describedby");
  }

  function clearValidationSummary(form, summary) {
    if (!summary.dataset.validationSummary || form.querySelector('[aria-invalid="true"]')) return;
    delete summary.dataset.validationSummary;
    summary.className = "form-status";
    summary.removeAttribute("role");
    summary.textContent = "";
  }

  function validateAuthForm(form, summary, moveFocus = true) {
    const fields = [...form.querySelectorAll("input[required]")];
    let valid = true;
    for (const input of fields) {
      if (input.validity.valid) clearFieldError(input);
      else {
        valid = false;
        setFieldError(input, validationMessage(input));
      }
    }
    if (valid) {
      clearValidationSummary(form, summary);
      return true;
    }
    summary.dataset.validationSummary = "true";
    summary.className = "form-error";
    summary.setAttribute("role", "alert");
    summary.textContent = text("access.formInvalid");
    if (moveFocus) summary.focus({ preventScroll: true });
    return false;
  }

  for (const [form, summary] of validationContexts) {
    for (const input of form.querySelectorAll("input[required]")) {
      input.addEventListener("input", () => {
        if (input.validity.valid) clearFieldError(input);
        else if (input.getAttribute("aria-invalid") === "true") setFieldError(input, validationMessage(input));
        clearValidationSummary(form, summary);
      });
    }
  }

  function cancelReauthCloseCleanup() {
    clearTimeout(reauthCloseTimer);
    reauthCloseTimer = 0;
    if (reauthDialog && reauthTransitionListener) reauthDialog.removeEventListener("transitionend", reauthTransitionListener);
    reauthTransitionListener = null;
  }

  function finishReauthClose() {
    if (!reauthDialog || reauthDialog.dataset.state !== "closing") return;
    cancelReauthCloseCleanup();
    reauthDialog.dataset.state = "closed";
    reauthDialog.close();
    unlockModalScroll(reauthDialog);
    reauthDialog.inert = true;
    reauthDialog.setAttribute("aria-hidden", "true");
  }

  function openReauth() {
    if (!reauthDialog) return;
    const reversing = reauthDialog.dataset.state === "closing";
    cancelReauthCloseCleanup();
    reauthDialog.inert = false;
    reauthDialog.removeAttribute("aria-hidden");
    if (!reauthDialog.open) {
      reauthDialog.dataset.state = "opening";
      reauthDialog.showModal();
      lockModalScroll(reauthDialog);
      reauthDialog.getBoundingClientRect();
    } else if (!reversing) {
      return;
    }
    reauthDialog.dataset.state = "open";
    reauthDialog.querySelector("input")?.focus({ preventScroll: true });
  }

  function closeReauth() {
    if (!reauthDialog?.open || reauthDialog.dataset.state === "closing") return;
    cancelReauthCloseCleanup();
    reauthDialog.dataset.state = "closing";
    reauthDialog.inert = true;
    reauthDialog.setAttribute("aria-hidden", "true");
    reauthTransitionListener = (event) => {
      if (event.target === reauthDialog && event.propertyName === "opacity") finishReauthClose();
    };
    reauthDialog.addEventListener("transitionend", reauthTransitionListener);
    reauthCloseTimer = setTimeout(finishReauthClose, 260);
  }

  function showRecovery(open) {
    if (!signInView || !recoveryView) return;
    signInView.hidden = open;
    recoveryView.hidden = !open;
    history.replaceState(null, "", open ? "#recovery" : location.pathname);
    (open ? recoveryView : signInView).querySelector("h2")?.focus();
  }

  function renderAuthFixture() {
    if (!authFixture || !authFixtureSelect || !authFixtureStatus) return;
    const state = authFixtureSelect.value || "idle";
    const key = {
      expired: "access.fixtureExpired",
      idle: "access.fixtureIdle",
      locked: "access.fixtureLocked",
      offline: "access.fixtureOffline",
      "provider-unavailable": "access.fixtureProviderUnavailable",
      "session-expired": "access.fixtureSessionExpired",
      throttled: "access.fixtureThrottled",
      verified: "access.fixtureVerified",
    }[state] ?? "access.fixtureIdle";
    authFixture.dataset.fixtureState = state;
    authFixtureStatus.textContent = text(key);
  }

  recoveryOpen?.addEventListener("click", () => showRecovery(true));
  recoveryBack?.addEventListener("click", () => showRecovery(false));
  if (location.hash === "#recovery") showRecovery(true);
  authFixtureSelect?.addEventListener("change", renderAuthFixture);
  document.addEventListener("kin:localechange", renderAuthFixture);
  renderAuthFixture();

  signInForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateAuthForm(signInForm, signInStatus)) return;
    const submit = signInForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    signInStatus.className = "form-status";
    signInStatus.textContent = text("access.checking");
    setTimeout(() => {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      signInStatus.className = "form-error";
      signInStatus.textContent = text("access.referenceError");
      signInStatus.focus();
    }, 240);
  });

  recoveryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateAuthForm(recoveryForm, recoveryStatus)) return;
    recoveryStatus.className = "form-status success";
    recoveryStatus.textContent = text("access.recoveryResult");
    recoveryStatus.focus();
  });

  reauthOpen?.addEventListener("click", openReauth);
  reauthCancel?.addEventListener("click", closeReauth);
  reauthForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateAuthForm(reauthForm, reauthStatus)) return;
    reauthStatus.className = "form-error";
    reauthStatus.textContent = text("access.referenceError");
    reauthStatus.focus();
  });
  reauthDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReauth();
  });
  reauthDialog?.addEventListener("close", () => {
    // A native `close` event is queued after `dialog.close()`. If the dialog
    // has already been reopened, that event belongs to the previous close
    // cycle and must not overwrite the latest open intent.
    if (reauthDialog.open) return;
    cancelReauthCloseCleanup();
    unlockModalScroll(reauthDialog);
    reauthDialog.dataset.state = "closed";
    reauthDialog.inert = true;
    reauthDialog.setAttribute("aria-hidden", "true");
    reauthOpen?.focus();
  });
  document.addEventListener("kin:localechange", () => {
    for (const [form, summary] of validationContexts) {
      for (const input of form.querySelectorAll('input[aria-invalid="true"]')) setFieldError(input, validationMessage(input));
      if (summary.dataset.validationSummary) summary.textContent = text("access.formInvalid");
    }
  });
}

function setupOnboardingPage() {
  const steps = [...document.querySelectorAll("[data-onboarding-step]")];
  const indicators = [...document.querySelectorAll("[data-step-indicator]")];
  const storageKey = "kin-reference-onboarding-step-v1";
  const maxStep = steps.length;

  function renderStep(step, moveFocus = true, persist = true) {
    const next = Math.max(1, Math.min(maxStep, Number(step) || 1));
    for (const panel of steps) panel.hidden = Number(panel.dataset.onboardingStep) !== next;
    for (const indicator of indicators) {
      const value = Number(indicator.dataset.stepIndicator);
      indicator.toggleAttribute("aria-current", value === next);
      if (value === next) indicator.setAttribute("aria-current", "step");
      else indicator.removeAttribute("aria-current");
      indicator.dataset.complete = String(value < next || next === maxStep);
    }
    history.replaceState(null, "", `#step-${next}`);
    if (persist) localStorage.setItem(storageKey, String(next));
    if (moveFocus) steps.find((panel) => Number(panel.dataset.onboardingStep) === next)?.querySelector("h2")?.focus();
  }

  for (const next of document.querySelectorAll("[data-onboarding-next]")) {
    next.addEventListener("click", () => {
      const panel = next.closest("[data-onboarding-step]");
      const form = panel?.querySelector("form");
      if (form && !form.reportValidity()) return;
      renderStep(Number(panel.dataset.onboardingStep) + 1);
    });
  }
  for (const back of document.querySelectorAll("[data-onboarding-back]")) {
    back.addEventListener("click", () => renderStep(Number(back.closest("[data-onboarding-step]").dataset.onboardingStep) - 1));
  }

  const hashStep = Number(location.hash.match(/^#step-(\d+)$/)?.[1]);
  const stored = Number(localStorage.getItem(storageKey));
  renderStep(hashStep || stored || 1, false, false);
}

function setupSettingsPage() {
  const navItems = [...document.querySelectorAll("[data-settings-nav]")];
  const sections = [...document.querySelectorAll("[data-settings-section]")];
  const profileForm = document.querySelector("[data-settings-form]");
  const save = document.querySelector("[data-settings-save]");
  const cancel = document.querySelector("[data-settings-cancel]");
  const status = document.querySelector("[data-settings-status]");
  let baseline = profileForm ? new FormData(profileForm) : null;

  function showSettingsSection(id, moveFocus = true) {
    const target = sections.find((section) => section.dataset.settingsSection === id) ?? sections[0];
    for (const section of sections) section.hidden = section !== target;
    for (const item of navItems) {
      if (item.dataset.settingsNav === target.dataset.settingsSection) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
    history.replaceState(null, "", `#${target.dataset.settingsSection}`);
    if (moveFocus) target.querySelector("h2")?.focus();
  }

  for (const item of navItems) item.addEventListener("click", () => showSettingsSection(item.dataset.settingsNav));
  showSettingsSection(location.hash.slice(1), false);

  function setDirty(dirty) {
    if (save) save.disabled = !dirty;
    if (cancel) cancel.disabled = !dirty;
    if (status) {
      status.className = "form-status";
      status.textContent = dirty ? text("settings.unsaved") : text("settings.noChanges");
    }
  }

  profileForm?.addEventListener("input", () => setDirty(true));
  profileForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    baseline = new FormData(profileForm);
    setDirty(false);
    status.className = "form-status success";
    status.textContent = text("settings.savedReference");
    status.focus();
  });
  cancel?.addEventListener("click", () => {
    if (!profileForm || !baseline) return;
    for (const [name, value] of baseline.entries()) {
      const field = profileForm.elements.namedItem(name);
      if (field) field.value = value;
    }
    setDirty(false);
  });
  setDirty(false);

  for (const option of document.querySelectorAll('[name="appearance-theme"]')) {
    option.addEventListener("change", () => {
      applyTheme(option.value);
      const appearanceStatus = document.querySelector("[data-appearance-status]");
      appearanceStatus.textContent = text("settings.appearanceUpdated");
    });
  }

  const revokeDialog = document.querySelector("[data-revoke-dialog]");
  const revokeOpen = document.querySelector("[data-revoke-open]");
  const revokeCancel = document.querySelector("[data-revoke-cancel]");
  const revokeConfirm = document.querySelector("[data-revoke-confirm]");
  const sessionStatus = document.querySelector("[data-session-status]");
  revokeOpen?.addEventListener("click", () => revokeDialog?.showModal());
  revokeCancel?.addEventListener("click", () => revokeDialog?.close());
  revokeConfirm?.addEventListener("click", () => {
    revokeDialog?.close();
    sessionStatus.className = "form-status success";
    sessionStatus.textContent = text("settings.sessionReference");
    sessionStatus.focus();
  });
  revokeDialog?.addEventListener("close", () => revokeOpen?.focus());
}

const systemStates = ["session", "forbidden", "not-found", "conflict", "offline", "rate-limit", "server"];

function currentSystemState() {
  const hash = location.hash.slice(1);
  return systemStates.includes(hash) ? hash : "session";
}

function renderSystemState(state, moveFocus = true) {
  if (!document.querySelector("[data-system-title]")) return;
  if (!systemStates.includes(state)) state = "session";
  const prefix = `system.${state}`;
  document.querySelector("[data-system-title]").textContent = text(`${prefix}.title`);
  document.querySelector("[data-system-body]").textContent = text(`${prefix}.body`);
  document.querySelector("[data-system-preservation]").textContent = text(`${prefix}.preservation`);
  document.querySelector("[data-system-primary]").textContent = text(`${prefix}.primary`);
  document.querySelector("[data-system-secondary]").textContent = text(`${prefix}.secondary`);
  document.querySelector("[data-system-code]").textContent = text(`${prefix}.code`);
  for (const button of document.querySelectorAll("[data-system-state]")) {
    if (button.dataset.systemState === state) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
  history.replaceState(null, "", `#${state}`);
  if (moveFocus) document.querySelector("[data-system-title]").focus();
}

function setupSystemPage() {
  for (const button of document.querySelectorAll("[data-system-state]")) {
    button.addEventListener("click", () => renderSystemState(button.dataset.systemState));
  }
  const recoveryStatus = document.querySelector("[data-system-status]");
  document.querySelector("[data-system-primary]")?.addEventListener("click", () => {
    recoveryStatus.textContent = text("system.referenceAction");
    recoveryStatus.focus();
  });
  document.querySelector("[data-system-secondary]")?.addEventListener("click", () => {
    recoveryStatus.textContent = text("system.referenceSecondary");
    recoveryStatus.focus();
  });
  renderSystemState(currentSystemState(), false);
}

const searchScopes = ["all", "record", "document", "task"];
const searchAccessStates = ["all", "available", "restricted"];
const searchSorts = ["relevance", "updated", "name"];
const searchReferenceStates = ["results", "partial", "stale", "no-results", "error"];

function setupSearchPage() {
  const form = document.querySelector("[data-search-form]");
  const query = document.querySelector("[data-search-query]");
  const clear = document.querySelector("[data-search-clear]");
  const sort = document.querySelector("[data-search-sort]");
  const referenceState = document.querySelector("[data-search-state]");
  const filterForm = document.querySelector("[data-search-filter-form]");
  const filterPanel = document.querySelector("[data-search-filters]");
  const filterToggle = document.querySelector("[data-search-filter-toggle]");
  const filterClose = document.querySelector("[data-search-filter-close]");
  const filterReset = document.querySelector("[data-search-filter-reset]");
  const filterCount = document.querySelector("[data-search-active-filter-count]");
  const results = [...document.querySelectorAll("[data-search-result]")];
  const resultList = document.querySelector("[data-search-result-list]");
  const summary = document.querySelector("[data-search-summary]");
  const context = document.querySelector("[data-search-context]");
  const countKind = document.querySelector("[data-search-count-kind]");
  const range = document.querySelector("[data-search-range]");
  const footer = document.querySelector(".search-result-footer");
  const banner = document.querySelector("[data-search-state-banner]");
  const bannerTitle = document.querySelector("[data-search-state-title]");
  const bannerBody = document.querySelector("[data-search-state-body]");
  const empty = document.querySelector("[data-search-empty]");
  const error = document.querySelector("[data-search-error]");
  const editQuery = document.querySelector("[data-search-edit-query]");
  const resetAll = document.querySelector("[data-search-reset-all]");
  const retry = document.querySelector("[data-search-retry]");
  const selectionStatus = document.querySelector("[data-search-selection-status]");
  const detailEmpty = document.querySelector("[data-search-detail-empty]");
  const detailContent = document.querySelector("[data-search-detail-content]");
  const detailClose = document.querySelector("[data-search-detail-close]");
  const originalOrder = new Map(results.map((result, index) => [result.dataset.resultId, index]));

  if (!form || !query || !filterForm || !resultList) return;

  function allowed(value, values, fallback) {
    return values.includes(value) ? value : fallback;
  }

  function readState() {
    const params = new URLSearchParams(location.search);
    return {
      query: params.get("q") ?? "",
      scope: allowed(params.get("scope"), searchScopes, "all"),
      access: allowed(params.get("access"), searchAccessStates, "all"),
      sort: allowed(params.get("sort"), searchSorts, "relevance"),
      reference: allowed(params.get("state"), searchReferenceStates, "results"),
      selected: params.get("selected") ?? "",
    };
  }

  let state = readState();

  function setChecked(name, value) {
    const target = filterForm.querySelector(`[name="${name}"][value="${value}"]`);
    if (target) target.checked = true;
  }

  function syncControls() {
    query.value = state.query;
    clear.hidden = state.query === "";
    if (sort) sort.value = state.sort;
    if (referenceState) referenceState.value = state.reference;
    setChecked("scope", state.scope);
    setChecked("access", state.access);
  }

  function urlFor(selected = state.selected) {
    const params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    if (state.scope !== "all") params.set("scope", state.scope);
    if (state.access !== "all") params.set("access", state.access);
    if (state.sort !== "relevance") params.set("sort", state.sort);
    if (state.reference !== "results") params.set("state", state.reference);
    if (selected) params.set("selected", selected);
    const serialized = params.toString();
    return `${location.pathname}${serialized ? `?${serialized}` : ""}`;
  }

  function writeUrl(method = "push") {
    history[method === "replace" ? "replaceState" : "pushState"](null, "", urlFor());
  }

  function setFilterPanel(open, restoreFocus = true) {
    filterPanel.dataset.open = String(open);
    filterToggle?.setAttribute("aria-expanded", String(open));
    if (open) filterPanel.querySelector("input:checked")?.focus();
    else if (restoreFocus) filterToggle?.focus();
  }

  function scopeLabel() {
    return text({ all: "search.scopeAll", record: "search.scopeRecords", document: "search.scopeDocuments", task: "search.scopeTasks" }[state.scope]);
  }

  function accessLabel() {
    return text({ all: "search.accessAll", available: "search.accessAvailable", restricted: "search.accessRestricted" }[state.access]);
  }

  function renderDetail(selectedResult) {
    const hasSelection = Boolean(selectedResult);
    detailEmpty.hidden = hasSelection;
    detailContent.hidden = !hasSelection;
    if (!selectedResult) return;

    document.querySelector("[data-search-detail-type]").textContent = text(selectedResult.dataset.typeKey);
    document.querySelector("[data-search-detail-title]").textContent = text(selectedResult.dataset.titleKey);
    document.querySelector("[data-search-detail-id]").textContent = selectedResult.dataset.resultId;
    document.querySelector("[data-search-detail-description]").textContent = text(selectedResult.dataset.descriptionKey);
    document.querySelector("[data-search-detail-source]").textContent = text(selectedResult.dataset.sourceKey);
    document.querySelector("[data-search-detail-updated]").textContent = text(selectedResult.dataset.updatedKey);
    document.querySelector("[data-search-detail-access]").textContent = text(selectedResult.dataset.accessKey);
    document.querySelector("[data-search-detail-boundary]").textContent = text(selectedResult.dataset.access === "restricted" ? "search.restrictedBoundary" : "search.availableBoundary");
  }

  function render({ focusSummary = false } = {}) {
    selectionStatus.textContent = "";
    const normalizedQuery = state.query.trim().toLocaleLowerCase(root.lang || "zh-CN");
    const ordered = [...results].sort((a, b) => {
      if (state.sort === "updated") return Number(b.dataset.updated) - Number(a.dataset.updated);
      if (state.sort === "name") return a.dataset.name.localeCompare(b.dataset.name, root.lang || "zh-CN");
      return originalOrder.get(a.dataset.resultId) - originalOrder.get(b.dataset.resultId);
    });
    for (const result of ordered) resultList.append(result);

    const serviceError = state.reference === "error";
    const forcedEmpty = state.reference === "no-results";
    const partial = state.reference === "partial";
    const visible = [];

    for (const result of ordered) {
      const searchable = result.dataset.search.toLocaleLowerCase(root.lang || "zh-CN");
      const matchesQuery = normalizedQuery === "" || searchable.includes(normalizedQuery);
      const matchesScope = state.scope === "all" || result.dataset.scope === state.scope;
      const matchesAccess = state.access === "all" || result.dataset.access === state.access;
      const unavailableSource = partial && result.dataset.partialExcluded === "true";
      const shown = !serviceError && !forcedEmpty && !unavailableSource && matchesQuery && matchesScope && matchesAccess;
      result.hidden = !shown;
      if (shown) visible.push(result);

      const link = result.querySelector("[data-search-result-link]");
      link.href = urlFor(result.dataset.resultId);
      if (result.dataset.resultId === state.selected && shown) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }

    let selectedResult = visible.find((result) => result.dataset.resultId === state.selected);
    if (state.selected && !selectedResult) {
      state.selected = "";
      writeUrl("replace");
      selectionStatus.textContent = text("search.selectionCleared");
    }

    const activeFilters = Number(state.scope !== "all") + Number(state.access !== "all");
    filterCount.hidden = activeFilters === 0;
    filterCount.textContent = text("search.activeFilterCount").replace("{count}", String(activeFilters));
    clear.hidden = state.query === "";
    context.textContent = text("search.filterContext").replace("{scope}", scopeLabel()).replace("{access}", accessLabel());

    banner.hidden = !["partial", "stale"].includes(state.reference);
    if (state.reference === "partial") {
      bannerTitle.textContent = text("search.partialTitle");
      bannerBody.textContent = text("search.partialBody");
    } else if (state.reference === "stale") {
      bannerTitle.textContent = text("search.staleTitle");
      bannerBody.textContent = text("search.staleBody");
    }

    resultList.hidden = serviceError || visible.length === 0;
    error.hidden = !serviceError;
    empty.hidden = serviceError || visible.length !== 0;
    footer.hidden = serviceError || visible.length === 0;

    if (serviceError) {
      summary.textContent = text("search.errorCount");
      countKind.textContent = text("search.countUnknown");
    } else if (partial) {
      summary.textContent = text("search.partialCount").replace("{count}", String(visible.length));
      countKind.textContent = text("search.countPartial");
    } else {
      summary.textContent = text(visible.length === 0 ? "search.noResultCount" : "search.resultsCount").replace("{count}", String(visible.length));
      countKind.textContent = text("search.countExact");
    }

    range.textContent = partial ? `1–${visible.length} / ?` : `1–${visible.length} / ${visible.length}`;
    selectedResult = visible.find((result) => result.dataset.resultId === state.selected);
    renderDetail(selectedResult);
    if (focusSummary) summary.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = query.value.trim();
    writeUrl();
    render({ focusSummary: true });
  });

  query.addEventListener("input", () => {
    clear.hidden = query.value === "";
  });

  clear.addEventListener("click", () => {
    state.query = "";
    query.value = "";
    writeUrl();
    render();
    query.focus();
  });

  filterToggle?.addEventListener("click", () => setFilterPanel(filterPanel.dataset.open !== "true"));
  filterClose?.addEventListener("click", () => setFilterPanel(false));

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.scope = new FormData(filterForm).get("scope") || "all";
    state.access = new FormData(filterForm).get("access") || "all";
    writeUrl();
    setFilterPanel(false, false);
    render({ focusSummary: true });
  });

  filterReset?.addEventListener("click", () => {
    state.scope = "all";
    state.access = "all";
    syncControls();
    writeUrl();
    render({ focusSummary: true });
  });

  sort?.addEventListener("change", () => {
    state.sort = sort.value;
    writeUrl();
    render({ focusSummary: true });
  });

  referenceState?.addEventListener("change", () => {
    state.reference = referenceState.value;
    writeUrl();
    render({ focusSummary: true });
  });

  for (const result of results) {
    result.querySelector("[data-search-result-link]")?.addEventListener("click", (event) => {
      event.preventDefault();
      state.selected = result.dataset.resultId;
      writeUrl();
      render();
      document.querySelector("[data-search-detail-title]")?.focus();
    });
  }

  detailClose?.addEventListener("click", () => {
    const previous = state.selected;
    state.selected = "";
    writeUrl();
    render();
    results.find((result) => result.dataset.resultId === previous)?.querySelector("[data-search-result-link]")?.focus();
  });

  editQuery?.addEventListener("click", () => query.focus());
  resetAll?.addEventListener("click", () => {
    state.query = "";
    state.scope = "all";
    state.access = "all";
    state.reference = "results";
    state.selected = "";
    syncControls();
    writeUrl();
    render({ focusSummary: true });
  });
  retry?.addEventListener("click", () => {
    state.reference = "results";
    state.selected = "";
    syncControls();
    writeUrl();
    render({ focusSummary: true });
  });

  addEventListener("popstate", () => {
    state = readState();
    syncControls();
    render();
  });

  document.addEventListener("kin:localechange", () => render());
  document.addEventListener("keydown", (event) => {
    if (!['j', 'k'].includes(event.key.toLowerCase()) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest("input, textarea, select, button, [contenteditable], [role='menu'], dialog")) return;
    const links = results.filter((result) => !result.hidden).map((result) => result.querySelector("[data-search-result-link]"));
    if (links.length === 0) return;
    event.preventDefault();
    const current = links.indexOf(document.activeElement);
    const delta = event.key.toLowerCase() === "j" ? 1 : -1;
    const next = current === -1 ? (delta === 1 ? 0 : links.length - 1) : (current + delta + links.length) % links.length;
    links[next]?.focus();
  });

  syncControls();
  render();
}

const supportSections = ["help", "request", "tickets", "status"];

function setupSupportPage() {
  const navItems = [...document.querySelectorAll("[data-support-nav]")];
  const sections = [...document.querySelectorAll("[data-support-section]")];
  const articles = [...document.querySelectorAll("[data-help-article]")];
  const search = document.querySelector("[data-help-search]");
  const category = document.querySelector("[data-help-category]");
  const summary = document.querySelector("[data-help-summary]");
  const results = document.querySelector("[data-help-results]");
  const empty = document.querySelector("[data-help-empty]");

  function showSection(id, moveFocus = true) {
    const selected = supportSections.includes(id) ? id : "help";
    const target = sections.find((section) => section.dataset.supportSection === selected) ?? sections[0];
    for (const section of sections) section.hidden = section !== target;
    for (const item of navItems) {
      if (item.dataset.supportNav === selected) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
    history.replaceState(null, "", `#${selected}`);
    if (moveFocus) target?.querySelector("h2")?.focus();
  }

  for (const item of navItems) item.addEventListener("click", () => showSection(item.dataset.supportNav));
  showSection(location.hash.slice(1), false);

  function filterHelp() {
    const query = search?.value.trim().toLocaleLowerCase(root.lang) ?? "";
    const selectedCategory = category?.value ?? "all";
    let visible = 0;
    for (const article of articles) {
      const searchable = `${article.dataset.search ?? ""} ${article.textContent}`.toLocaleLowerCase(root.lang);
      const matchesQuery = query === "" || searchable.includes(query);
      const matchesCategory = selectedCategory === "all" || article.dataset.category === selectedCategory;
      const shown = matchesQuery && matchesCategory;
      article.hidden = !shown;
      if (shown) visible += 1;
      else {
        const button = article.querySelector("button");
        const answer = article.querySelector(".support-article-answer");
        button?.setAttribute("aria-expanded", "false");
        if (answer) answer.hidden = true;
      }
    }
    if (results) results.hidden = visible === 0;
    if (empty) empty.hidden = visible !== 0;
    if (summary) summary.textContent = text("support.resultsCount").replace("{count}", String(visible));
  }

  search?.addEventListener("input", filterHelp);
  category?.addEventListener("change", filterHelp);
  document.addEventListener("kin:localechange", filterHelp);
  filterHelp();

  for (const article of articles) {
    const button = article.querySelector("button");
    const answer = article.querySelector(".support-article-answer");
    button?.addEventListener("click", () => {
      const opening = button.getAttribute("aria-expanded") !== "true";
      for (const other of articles) {
        other.querySelector("button")?.setAttribute("aria-expanded", "false");
        const otherAnswer = other.querySelector(".support-article-answer");
        if (otherAnswer) otherAnswer.hidden = true;
      }
      button.setAttribute("aria-expanded", String(opening));
      if (answer) answer.hidden = !opening;
    });
  }

  const requestForm = document.querySelector("[data-support-request-form]");
  const requestStatus = document.querySelector("[data-support-request-status]");
  const requestResult = document.querySelector("[data-support-request-result]");
  requestForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requestForm.reportValidity()) return;
    if (requestResult) requestResult.hidden = false;
    requestStatus.className = "form-status success";
    requestStatus.textContent = text("support.requestStatus");
    requestStatus.focus();
  });

  const ticketButtons = [...document.querySelectorAll("[data-ticket-select]")];
  const ticketDetails = [...document.querySelectorAll("[data-ticket-detail]")];
  function selectTicket(id, moveFocus = true) {
    for (const button of ticketButtons) button.setAttribute("aria-current", String(button.dataset.ticketSelect === id));
    for (const detail of ticketDetails) detail.hidden = detail.dataset.ticketDetail !== id;
    if (moveFocus) ticketDetails.find((detail) => detail.dataset.ticketDetail === id)?.querySelector("h3")?.focus();
  }
  for (const button of ticketButtons) button.addEventListener("click", () => selectTicket(button.dataset.ticketSelect));
  if (ticketButtons[0]) selectTicket(ticketButtons[0].dataset.ticketSelect, false);

  const statusSource = document.querySelector("[data-support-status-source]");
  const statusFeedback = document.querySelector("[data-support-status-feedback]");
  statusSource?.addEventListener("click", () => {
    statusFeedback.textContent = text("support.statusSourceResult");
    statusFeedback.focus();
  });
}

function setupSchedulingPage() {
  const shell = document.querySelector("[data-schedule-shell]");
  if (!shell) return;

  const sidebar = document.querySelector("[data-schedule-sidebar]");
  const collapse = document.querySelector("[data-schedule-collapse]");
  const primary = document.querySelector("[data-schedule-primary]");
  const sidecar = document.querySelector("[data-schedule-sidecar]");
  const sidecarTrigger = document.querySelector("[data-sidecar-trigger]");
  const sidecarClose = document.querySelector("[data-sidecar-close]");
  const sidecarScrim = document.querySelector("[data-sidecar-scrim]");
  const sidecarTitle = document.querySelector("[data-sidecar-title]");
  const sidecarEmpty = document.querySelector("[data-sidecar-empty]");
  const sidecarContent = document.querySelector("[data-sidecar-content]");
  const status = document.querySelector("[data-schedule-status]");
  const scope = document.querySelector("[data-schedule-scope]");
  const week = document.querySelector("[data-schedule-week]");
  const agenda = document.querySelector("[data-schedule-agenda]");
  const agendaList = document.querySelector("[data-schedule-agenda-list]");
  const empty = document.querySelector("[data-schedule-empty]");
  const events = [...document.querySelectorAll("[data-schedule-event]")];
  const overlayMedia = matchMedia("(max-width: 1100px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const baseMonday = new Date("2026-07-13T12:00:00");
  const sidebarStorageKey = "kin-reference-sidebar-collapsed-v1";
  let lastSidecarTrigger = sidecarTrigger;
  let scrimCloseTimer = 0;
  let scrimTransitionListener = null;

  function cancelScrimClose() {
    clearTimeout(scrimCloseTimer);
    scrimCloseTimer = 0;
    if (scrimTransitionListener) sidecarScrim.removeEventListener("transitionend", scrimTransitionListener);
    scrimTransitionListener = null;
  }

  function finishScrimClose() {
    if (sidecarScrim.dataset.state !== "closing") return;
    cancelScrimClose();
    sidecarScrim.dataset.state = "closed";
    sidecarScrim.hidden = true;
  }

  function setSidecarScrim(open) {
    cancelScrimClose();
    if (open) {
      sidecarScrim.hidden = false;
      sidecarScrim.inert = false;
      sidecarScrim.removeAttribute("aria-hidden");
      sidecarScrim.dataset.state = "opening";
      requestAnimationFrame(() => {
        if (sidecarScrim.dataset.state === "opening") sidecarScrim.dataset.state = "open";
      });
      return;
    }
    if (sidecarScrim.hidden || sidecarScrim.dataset.state === "closed") {
      sidecarScrim.dataset.state = "closed";
      sidecarScrim.hidden = true;
      return;
    }
    sidecarScrim.dataset.state = "closing";
    sidecarScrim.inert = true;
    sidecarScrim.setAttribute("aria-hidden", "true");
    scrimTransitionListener = (event) => {
      if (event.target === sidecarScrim && event.propertyName === "opacity") finishScrimClose();
    };
    sidecarScrim.addEventListener("transitionend", scrimTransitionListener);
    scrimCloseTimer = window.setTimeout(finishScrimClose, reducedMotion.matches ? 90 : 220);
  }

  function template(key, values = {}) {
    return Object.entries(values).reduce((value, [name, replacement]) => value.replaceAll(`{${name}}`, replacement), text(key));
  }

  function validDate(candidate) {
    return candidate instanceof Date && !Number.isNaN(candidate.getTime());
  }

  function parseDate(value) {
    const parsed = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : null;
    return validDate(parsed) ? parsed : new Date(baseMonday);
  }

  function isoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function readState() {
    const params = new URLSearchParams(location.search);
    const selected = events.some((event) => event.dataset.eventId === params.get("selected")) ? params.get("selected") : null;
    const selectedScope = ["all", "campaign", "review", "automation"].includes(params.get("scope")) ? params.get("scope") : "all";
    return {
      monday: parseDate(params.get("week")),
      view: params.get("view") === "agenda" ? "agenda" : "week",
      scope: selectedScope,
      selected,
    };
  }

  let state = readState();

  function writeUrl(method = "push") {
    const params = new URLSearchParams();
    if (isoDate(state.monday) !== isoDate(baseMonday)) params.set("week", isoDate(state.monday));
    if (state.view !== "week") params.set("view", state.view);
    if (state.scope !== "all") params.set("scope", state.scope);
    if (state.selected) params.set("selected", state.selected);
    const target = `${location.pathname}${params.size ? `?${params}` : ""}`;
    history[method === "replace" ? "replaceState" : "pushState"]({}, "", target);
  }

  function localeDate(date, options) {
    return new Intl.DateTimeFormat(root.lang || "zh-CN", options).format(date);
  }

  function dateForEvent(event) {
    return addDays(state.monday, Number(event.dataset.eventDay));
  }

  function eventLabel(event) {
    return template("schedule.dateTimeLabel", {
      date: localeDate(dateForEvent(event), { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
      start: event.dataset.eventStart,
      end: event.dataset.eventEnd,
      title: text(event.dataset.titleKey),
      status: text(event.dataset.statusKey),
      conflict: text(event.dataset.conflictKey),
    });
  }

  function visibleEvents() {
    if (isoDate(state.monday) !== isoDate(baseMonday)) return [];
    return events.filter((event) => state.scope === "all" || event.dataset.eventType === state.scope);
  }

  function updateNavLabels() {
    const labels = ["schedule.navSchedule", "schedule.navSearch", "schedule.navSupport", "schedule.viewCampaigns", "schedule.viewReviews"];
    document.querySelectorAll("[data-nav-label]").forEach((item, index) => {
      if (labels[index]) item.dataset.navLabel = text(labels[index]);
    });
  }

  function renderSidebar() {
    const collapsed = localStorage.getItem(sidebarStorageKey) === "true";
    shell.dataset.sidebarCollapsed = String(collapsed);
    collapse?.setAttribute("aria-expanded", String(!collapsed));
    collapse?.setAttribute("aria-label", text(collapsed ? "schedule.expand" : "schedule.collapse"));
    if (collapse) {
      collapse.innerHTML = `<i data-lucide="${collapsed ? "panel-left-open" : "panel-left-close"}" aria-hidden="true"></i>`;
      createIcons({ root: collapse, icons: { PanelLeftClose, PanelLeftOpen } });
    }
  }

  function applySidecarMode() {
    const open = shell.dataset.sidecarOpen === "true";
    const modal = open && overlayMedia.matches;
    primary.inert = modal;
    sidebar.inert = modal;
    document.body.classList.toggle("schedule-modal-open", modal);
    setSidecarScrim(modal);
    if (modal) {
      sidecar.setAttribute("role", "dialog");
      sidecar.setAttribute("aria-modal", "true");
    } else {
      sidecar.setAttribute("role", "region");
      sidecar.removeAttribute("aria-modal");
    }
  }

  function setSidecar(open, { moveFocus = true, restoreFocus = true } = {}) {
    shell.dataset.sidecarOpen = String(open);
    sidecar.setAttribute("aria-hidden", String(!open));
    sidecar.inert = !open;
    sidecarTrigger?.setAttribute("aria-expanded", String(open));
    applySidecarMode();
    if (open && moveFocus) sidecarTitle?.focus();
    if (!open && restoreFocus) (lastSidecarTrigger?.isConnected ? lastSidecarTrigger : sidecarTrigger)?.focus();
  }

  function renderSidecar() {
    const event = events.find((candidate) => candidate.dataset.eventId === state.selected);
    sidecarEmpty.hidden = Boolean(event);
    sidecarContent.hidden = !event;
    sidecarTitle.textContent = event ? text(event.dataset.titleKey) : text("schedule.noSelection");
    if (!event) return;
    document.querySelector("[data-sidecar-status]").textContent = text(event.dataset.statusKey);
    document.querySelector("[data-sidecar-context]").textContent = text(event.dataset.contextKey);
    document.querySelector("[data-sidecar-id]").textContent = event.dataset.eventId;
    document.querySelector("[data-sidecar-date]").textContent = localeDate(dateForEvent(event), { year: "numeric", month: "short", day: "numeric", weekday: "short" });
    document.querySelector("[data-sidecar-time]").textContent = `${event.dataset.eventStart}–${event.dataset.eventEnd}`;
    document.querySelector("[data-sidecar-owner]").textContent = text(event.dataset.ownerKey);
    document.querySelector("[data-sidecar-conflict]").textContent = text(event.dataset.conflictKey);
  }

  function selectEvent(id, trigger, updateHistory = true) {
    state.selected = id;
    lastSidecarTrigger = trigger ?? events.find((event) => event.dataset.eventId === id) ?? sidecarTrigger;
    if (updateHistory) writeUrl("push");
    render();
    setSidecar(true);
    status.textContent = template("schedule.selectionChanged", { title: text(events.find((event) => event.dataset.eventId === id).dataset.titleKey) });
  }

  function closeSidecar(updateHistory = true, restoreFocus = true) {
    const closingId = state.selected;
    if (updateHistory && state.selected) {
      state.selected = null;
      writeUrl("push");
      render();
      const candidates = [
        ...document.querySelectorAll(`[data-agenda-event="${closingId}"]`),
        ...events.filter((event) => event.dataset.eventId === closingId),
      ];
      lastSidecarTrigger = candidates.find((candidate) => candidate.getClientRects().length > 0) ?? lastSidecarTrigger;
    }
    setSidecar(false, { restoreFocus });
    status.textContent = text("schedule.contextClosed");
  }

  function renderAgenda(items) {
    agendaList.replaceChildren();
    for (let day = 0; day < 5; day += 1) {
      const dayEvents = items.filter((event) => Number(event.dataset.eventDay) === day);
      if (dayEvents.length === 0) continue;
      const group = document.createElement("section");
      group.className = "schedule-agenda-group";
      const heading = document.createElement("h3");
      heading.textContent = localeDate(addDays(state.monday, day), { month: "short", day: "numeric", weekday: "short" });
      const list = document.createElement("div");
      list.className = "schedule-agenda-items";
      for (const event of dayEvents) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "schedule-agenda-item";
        button.dataset.agendaEvent = event.dataset.eventId;
        button.setAttribute("aria-pressed", String(state.selected === event.dataset.eventId));
        button.setAttribute("aria-label", eventLabel(event));
        const time = document.createElement("time");
        time.textContent = `${event.dataset.eventStart}–${event.dataset.eventEnd}`;
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = text(event.dataset.titleKey);
        const meta = document.createElement("small");
        meta.textContent = `${text(event.dataset.statusKey)} · ${text(event.dataset.ownerKey)}`;
        copy.append(title, meta);
        const stateMark = document.createElement("small");
        stateMark.textContent = event.classList.contains("has-conflict") ? "!" : "";
        stateMark.setAttribute("aria-hidden", "true");
        button.append(time, copy, stateMark);
        button.addEventListener("click", () => selectEvent(event.dataset.eventId, button));
        list.append(button);
      }
      group.append(heading, list);
      agendaList.append(group);
    }
  }

  function render() {
    shell.dataset.scheduleView = state.view;
    scope.value = state.scope;
    for (const button of document.querySelectorAll("[data-schedule-view-button]")) button.setAttribute("aria-pressed", String(button.dataset.scheduleViewButton === state.view));

    const periodEnd = addDays(state.monday, 4);
    const period = template("schedule.weekLabel", {
      start: localeDate(state.monday, { year: "numeric", month: "short", day: "numeric" }),
      end: localeDate(periodEnd, { month: "short", day: "numeric" }),
    });
    document.querySelector("[data-schedule-period]").textContent = period;
    document.querySelectorAll("[data-schedule-day]").forEach((day) => {
      day.querySelector("[data-day-date]").textContent = localeDate(addDays(state.monday, Number(day.dataset.scheduleDay)), { month: "numeric", day: "numeric" });
    });

    const items = visibleEvents();
    const visibleIds = new Set(items.map((event) => event.dataset.eventId));
    if (state.selected && !visibleIds.has(state.selected)) {
      state.selected = null;
      writeUrl("replace");
      setSidecar(false, { moveFocus: false, restoreFocus: false });
    }
    for (const event of events) {
      event.hidden = !visibleIds.has(event.dataset.eventId);
      event.setAttribute("aria-pressed", String(state.selected === event.dataset.eventId));
      event.setAttribute("aria-label", eventLabel(event));
    }
    const hasItems = items.length > 0;
    week.hidden = !hasItems;
    agenda.hidden = !hasItems;
    empty.hidden = hasItems;
    renderAgenda(items);
    renderSidecar();
    updateNavLabels();
  }

  collapse?.addEventListener("click", () => {
    const collapsed = shell.dataset.sidebarCollapsed !== "true";
    localStorage.setItem(sidebarStorageKey, String(collapsed));
    renderSidebar();
  });

  for (const event of events) event.addEventListener("click", () => selectEvent(event.dataset.eventId, event));

  for (const button of document.querySelectorAll("[data-schedule-view-button]")) {
    button.addEventListener("click", () => {
      state.view = button.dataset.scheduleViewButton;
      writeUrl("push");
      render();
    });
  }

  scope?.addEventListener("change", () => {
    state.scope = scope.value;
    writeUrl("push");
    render();
    status.textContent = template("schedule.scopeChanged", { scope: scope.selectedOptions[0].textContent });
  });

  for (const shortcut of document.querySelectorAll("[data-schedule-scope-shortcut]")) {
    shortcut.addEventListener("click", () => {
      state.scope = shortcut.dataset.scheduleScopeShortcut;
      writeUrl("push");
      render();
    });
  }

  document.querySelector("[data-schedule-reset]")?.addEventListener("click", () => {
    state.scope = "all";
    writeUrl("push");
    render();
  });

  function changeWeek(days) {
    state.monday = addDays(state.monday, days);
    writeUrl("push");
    render();
    status.textContent = template("schedule.periodChanged", { period: document.querySelector("[data-schedule-period]").textContent });
  }

  document.querySelector("[data-schedule-previous]")?.addEventListener("click", () => changeWeek(-7));
  document.querySelector("[data-schedule-next]")?.addEventListener("click", () => changeWeek(7));
  document.querySelector("[data-schedule-today]")?.addEventListener("click", () => {
    state.monday = new Date(baseMonday);
    writeUrl("push");
    render();
  });

  sidecarTrigger?.addEventListener("click", () => {
    lastSidecarTrigger = sidecarTrigger;
    if (shell.dataset.sidecarOpen === "true") closeSidecar();
    else setSidecar(true);
  });
  sidecarClose?.addEventListener("click", () => closeSidecar());
  sidecarScrim?.addEventListener("click", () => closeSidecar());

  document.querySelector("[data-schedule-copy-link]")?.addEventListener("click", async () => {
    const result = document.querySelector("[data-schedule-copy-status]");
    try {
      await navigator.clipboard.writeText(location.href);
      result.textContent = text("schedule.linkCopied");
    } catch {
      result.textContent = text("schedule.linkFailed");
    }
  });

  sidecar?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || sidecar.getAttribute("role") !== "dialog") return;
    const focusable = [...sidecar.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hidden);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === sidecarTitle)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  overlayMedia.addEventListener("change", applySidecarMode);
  addEventListener("popstate", () => {
    state = readState();
    render();
    if (state.selected) {
      lastSidecarTrigger = events.find((event) => event.dataset.eventId === state.selected) ?? sidecarTrigger;
      setSidecar(true, { moveFocus: false });
    } else {
      setSidecar(false, { restoreFocus: false });
    }
  });

  document.addEventListener("kin:localechange", () => {
    renderSidebar();
    render();
  });

  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && shell.dataset.sidecarOpen === "true") {
      event.preventDefault();
      closeSidecar();
    }
  });

  renderSidebar();
  render();
  if (state.selected) {
    lastSidecarTrigger = events.find((event) => event.dataset.eventId === state.selected) ?? sidecarTrigger;
    setSidecar(true, { moveFocus: false });
  } else {
    setSidecar(false, { moveFocus: false, restoreFocus: false });
  }
}

createIcons({
  icons: {
    Activity,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Bell,
    BookOpen,
    CalendarDays,
    CalendarRange,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    CircleHelp,
    ClipboardCheck,
    Clock,
    Copy,
    Database,
    Eye,
    EyeOff,
    ExternalLink,
    FileText,
    Globe2,
    KeyRound,
    Languages,
    LayoutList,
    ListChecks,
    LockKeyhole,
    MessageSquarePlus,
    Megaphone,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRight,
    PanelRightOpen,
    Palette,
    RefreshCw,
    Save,
    Search,
    Send,
    Settings,
    ShieldAlert,
    ShieldCheck,
    SlidersHorizontal,
    Sun,
    TicketCheck,
    UserRound,
    Users,
    X,
  },
});

const requestedLocale = new URLSearchParams(window.location.search).get("lang");
const initialLocale = ["en", "zh-CN"].includes(requestedLocale)
  ? requestedLocale
  : (localStorage.getItem("kin-reference-locale") || root.lang || "zh-CN");
applyLocale(initialLocale, false);
applyTheme(root.dataset.themePreference || "system", false);
setupPasswords();

if (document.body.dataset.page === "access") setupAccessPage();
if (document.body.dataset.page === "onboarding") setupOnboardingPage();
if (document.body.dataset.page === "settings") setupSettingsPage();
if (document.body.dataset.page === "system") setupSystemPage();
if (document.body.dataset.page === "search") setupSearchPage();
if (document.body.dataset.page === "support") setupSupportPage();
if (document.body.dataset.page === "scheduling") setupSchedulingPage();

addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (languageMenuController?.isOpen()) languageMenuController.close();
  if (themeMenuController?.isOpen()) themeMenuController.close();
});
