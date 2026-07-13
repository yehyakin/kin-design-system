import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
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
  LockKeyhole,
  MessageSquarePlus,
  Moon,
  PanelRight,
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

const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeSwitch = document.querySelector("[data-theme-switch]");
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

function setLanguageMenu(open, restoreFocus = true) {
  if (!languageMenu || !languageTrigger) return;
  languageMenu.hidden = !open;
  languageTrigger.setAttribute("aria-expanded", String(open));
  if (open) {
    const selected = languageOptions.find((option) => option.getAttribute("aria-checked") === "true");
    (selected ?? languageOptions[0])?.focus();
  } else if (restoreFocus) languageTrigger.focus();
}

themeSwitch?.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));
languageTrigger?.addEventListener("click", () => setLanguageMenu(languageMenu.hidden));
for (const option of languageOptions) {
  option.addEventListener("click", () => {
    applyLocale(option.dataset.languageOption);
    setLanguageMenu(false);
  });
}

languageMenu?.addEventListener("keydown", (event) => {
  const index = languageOptions.indexOf(document.activeElement);
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? languageOptions.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + languageOptions.length) % languageOptions.length;
    languageOptions[next]?.focus();
  }
  if (event.key === "Escape") setLanguageMenu(false);
});

document.addEventListener("click", (event) => {
  if (languageMenu && !languageMenu.hidden && !event.target.closest(".language-control")) setLanguageMenu(false, false);
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
  const reauthOpen = document.querySelector("[data-reauth-open]");
  const reauthDialog = document.querySelector("[data-reauth-dialog]");
  const reauthCancel = document.querySelector("[data-reauth-cancel]");
  const reauthForm = document.querySelector("[data-reauth-form]");
  const reauthStatus = document.querySelector("[data-reauth-status]");

  function showRecovery(open) {
    if (!signInView || !recoveryView) return;
    signInView.hidden = open;
    recoveryView.hidden = !open;
    history.replaceState(null, "", open ? "#recovery" : location.pathname);
    (open ? recoveryView : signInView).querySelector("h2")?.focus();
  }

  recoveryOpen?.addEventListener("click", () => showRecovery(true));
  recoveryBack?.addEventListener("click", () => showRecovery(false));
  if (location.hash === "#recovery") showRecovery(true);

  signInForm?.addEventListener("submit", (event) => {
    event.preventDefault();
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
    recoveryStatus.className = "form-status success";
    recoveryStatus.textContent = text("access.recoveryResult");
    recoveryStatus.focus();
  });

  reauthOpen?.addEventListener("click", () => reauthDialog?.showModal());
  reauthCancel?.addEventListener("click", () => reauthDialog?.close());
  reauthForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    reauthStatus.className = "form-error";
    reauthStatus.textContent = text("access.referenceError");
    reauthStatus.focus();
  });
  reauthDialog?.addEventListener("close", () => reauthOpen?.focus());
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

createIcons({
  icons: {
    Activity,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Bell,
    BookOpen,
    Check,
    ChevronDown,
    CircleHelp,
    Database,
    Eye,
    EyeOff,
    ExternalLink,
    FileText,
    Globe2,
    KeyRound,
    Languages,
    ListChecks,
    LockKeyhole,
    MessageSquarePlus,
    Moon,
    PanelRight,
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

applyLocale(localStorage.getItem("kin-reference-locale") || root.lang || "zh-CN", false);
applyTheme(root.dataset.themePreference || "system", false);
setupPasswords();

if (document.body.dataset.page === "access") setupAccessPage();
if (document.body.dataset.page === "onboarding") setupOnboardingPage();
if (document.body.dataset.page === "settings") setupSettingsPage();
if (document.body.dataset.page === "system") setupSystemPage();
if (document.body.dataset.page === "search") setupSearchPage();
if (document.body.dataset.page === "support") setupSupportPage();

addEventListener("keydown", (event) => {
  if (event.key === "Escape" && languageMenu && !languageMenu.hidden) setLanguageMenu(false);
});
