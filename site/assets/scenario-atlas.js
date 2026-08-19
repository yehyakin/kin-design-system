const locale = new URLSearchParams(window.location.search).get("lang") === "zh-CN" ? "zh-CN" : "en";
const featureFrame = document.querySelector("[data-atlas-feature-frame]");

if (featureFrame) {
  featureFrame.src = locale === "zh-CN"
    ? featureFrame.dataset.referenceZhCn
    : featureFrame.dataset.referenceEn;
}

if (locale === "zh-CN") {
  document.documentElement.lang = "zh-CN";

  const STATIC_COPY = Object.freeze({
    "Skip to content": "跳到正文",
    "KIN Design System home": "KIN 设计系统首页",
    "Design System": "设计系统",
    "Scenario Atlas": "场景目录",
    "Primary": "主导航",
    "Showcase": "总览",
    "Components": "组件",
    "Patterns": "布局",
    "Scenarios": "场景",
    "Lab": "场景预览",
    "Search Atlas sections and scenarios": "搜索场景目录的章节与场景",
    "Open navigation": "打开导航",
    "Open Scenario Atlas sections": "打开场景目录",
    "Close Scenario Atlas sections": "关闭场景目录",
    "Scenario Atlas sections": "场景目录",
    "Choose documentation language": "选择语言",
    "English Atlas": "English",
    "Chinese documentation": "中文场景目录",
    "Switch to light mode": "切换为日间模式",
    "Increase contrast": "增强对比度",
    "KIN on GitHub": "在 GitHub 查看 KIN",
    "Start here": "开始",
    "Documentation": "文档",
    "Atlas overview": "场景概览",
    "Coverage model": "场景状态",
    "Product families": "产品类型",
    "Intelligence": "情报",
    "Information": "信息",
    "Ecommerce": "电商",
    "Engineering": "工程",
    "Shared and conditional": "通用与按需",
    "Source files": "规范文件",
    "Catalog JSON": "目录 JSON",
    "Catalog Schema": "目录结构",
    "Non-normative discovery layer": "浏览与预览",
    "Phase 3 · English and Chinese": "第三阶段 · 支持中英双语",
    "SCENARIO ATLAS / PHASE 3": "场景目录 / 第三阶段",
    "Inspect KIN across product tasks.": "在真实任务中体验 KIN。",
    "Thirty-one task-led scenarios connect KIN product patterns and page contracts to the work people need to complete. Eighteen are now inspectable: six P0 pilots, six stable shared workflows, and six product-family P1 scenarios. Each exposes only implemented local states across wide and narrow viewports and four theme modes; 13 entries remain visibly planned.": "31 个场景展示 KIN 如何支持具体任务。当前有 18 个场景可以直接预览，覆盖宽屏、窄屏和四种外观；其余 13 个仍在规划中。",
    "Inspect 18 showcased scenarios": "打开 18 个可预览场景",
    "Start with evidence review": "从证据复核开始",
    "Browse all scenarios": "浏览全部场景",
    "FEATURED SCENARIO / INT-02": "代表场景 / INT-02",
    "Investigation and Evidence Review": "调查与证据复核",
    "Compare chronology, sources, conflicts, and uncertainty before recording a finding.": "记录结论前，对照时间线、来源、冲突与不确定性。",
    "Inspect this scenario": "打开预览",
    "Interactive preview of Investigation and Evidence Review": "调查与证据复核交互预览",
    "Inspect the machine catalog": "查看场景数据",
    "Read RFC 002": "阅读 RFC 002",
    "Coverage map": "场景覆盖",
    "31 scenarios": "31 个场景",
    "Inspectable today": "当前可预览",
    "18 showcased scenarios": "18 个可预览场景",
    "13 planned entries": "13 个计划项",
    "English and Chinese in Phase 3.": "第三阶段支持中英双语。",
    "FAMILY 01 / 5 SCENARIOS": "类别 01 / 5 个场景",
    "FAMILY 02 / 4 SCENARIOS": "类别 02 / 4 个场景",
    "FAMILY 03 / 5 SCENARIOS": "类别 03 / 5 个场景",
    "FAMILY 04 / 5 SCENARIOS": "类别 04 / 5 个场景",
    "FAMILY 05 / 11 SCENARIOS": "类别 05 / 11 个场景",
    "Atlas backlog": "场景待办",
    "13 planned": "13 个计划项",
    "Families": "产品类型",
    "5 composition groups": "5 类产品场景",
    "Discovery is not adoption evidence.": "能在这里看到，不等于已经接入产品。",
    "The Atlas joins existing sources; it does not promote page maturity, certify production behavior, or replace a product-owned implementation brief.": "场景目录把现有规范与预览集中到一起，但不会因此提高成熟度，也不能替代产品自己的实现与验证。",
    "Review the adoption boundary": "了解接入要求",
    "Three statuses, one honest map": "看清每个场景做到哪一步",
    "Source maturity describes the underlying KIN contract. Presentation status describes what this Atlas currently exposes. They are deliberately independent.": "规范成熟度说明设计要求是否稳定；场景状态说明这里是否已经提供可用预览。两者分别记录。",
    "Scenario status definitions": "场景状态定义",
    "Showcased": "可预览",
    "A checked inspection route exposes only states implemented by its local reference, plus wide and narrow viewports and four theme modes.": "已经提供可重复验证的交互预览，并覆盖宽屏、窄屏与四种外观。",
    "Linked": "已有示例",
    "A scenario may point to a runnable reference without claiming the checked controls required for showcased status.": "已经关联可运行示例，但尚未补齐完整的预览和检查控制。",
    "Planned": "计划中",
    "The scenario is catalogued, but its dedicated Atlas presentation, states, or responsive review has not been completed.": "场景已进入目录，但交互预览、状态或响应式检查尚未完成。",
    "Stable source": "稳定",
    "The governing page or product-pattern source is stable. This label does not make the Atlas presentation complete.": "对应的页面或应用布局规范已经稳定，但场景预览仍需单独完成。",
    "Candidate source": "待完善",
    "The source still has recorded gaps. Candidate and draft sources remain visible without being promoted.": "对应规范仍有已知问题。候选与草稿内容会继续显示，但不会被标为稳定。",
    "Intelligence workspaces": "情报工作台",
    "Identity, chronology, evidence, uncertainty, saved views, and reversible decisions remain visible together.": "记录信息、事件顺序、证据、不确定性、保存视图和可撤销操作始终同时可见。",
    "Information sites": "信息网站",
    "Reading order, provenance, stable URLs, correction history, and useful records lead the composition.": "阅读顺序、来源、固定链接、更正记录和相关内容共同组织页面。",
    "Ecommerce operations": "电商运营",
    "Sellable state, money, inventory, channels, approvals, and automation stay semantically distinct.": "可售状态、金额、库存、渠道、审批和自动化分别呈现，不混为一个状态。",
    "Engineering canvases": "工程画布",
    "Geometry, selection, structure, units, revisions, and generated changes support precision without competing with the canvas.": "几何、选择、结构、单位、版本与生成变更支撑精确操作，但不与画布争夺注意力。",
    "Shared and conditional workflows": "通用与按需流程",
    "Cross-product flows stay task-specific. Conditional capabilities remain absent unless a consuming product actually needs them.": "跨产品流程仍围绕具体任务设计；只有产品确实需要时，按需能力才会出现。",
    "Scenario metadata": "场景信息",
    "1 checked state": "1 个可预览状态",
    "4 checked states": "4 个可预览状态",
    "5 checked states": "5 个可预览状态",
    "6 checked states": "6 个可预览状态",
    "7 checked states": "7 个可预览状态",
    "9 checked states": "9 个可预览状态",
    "11 checked states": "11 个可预览状态",
    "Wide + narrow": "宽屏 + 窄屏",
    "4 themes": "4 种主题",
    "Phase 3": "第三阶段",
    "Phase 4": "第四阶段",
    "Draft source": "草稿",
    "Conditional": "按需采用",
    "Inspect scenario": "打开预览",
    "What comes next": "下一步",
    "Phase 3 now adds six stable shared workflows and six product-family P1 scenarios beside the six P0 pilots. Monitor recovery, order and campaign operations, scoped batch changes, generated-change review, conflict handling, and background operations remain planned until complete references exist.": "第三阶段已在六个 P0 试点基础上，加入六个稳定的通用流程和六个产品类 P1 场景。监测恢复、订单与营销活动、批量变更、生成内容审核、冲突处理和后台操作仍在规划中，待完整示例完成后再开放预览。",
    "Continue stable coverage": "继续完善稳定场景",
    "Join the next P1 product-family tasks to complete references without multiplying near-duplicate routes.": "补齐下一批 P1 产品任务，同时避免增加近似重复的页面。",
    "Add missing evidence": "补齐缺失证据",
    "Implement real state routes before adding controls for undo, recovery, empty, or failure behavior.": "在增加撤销、恢复、空状态或失败控件前，先让这些状态可以通过链接直接打开。",
    "ALWAYS": "始终",
    "Keep gaps visible": "明确标出尚未完成的内容",
    "Expose candidate, draft, and conditional work with current ownership and no maturity inflation.": "展示候选、草稿与按需能力，标明当前负责人，不夸大成熟度。",
    "KIN Design System · Scenario Atlas": "KIN 设计系统 · 场景目录",
    "Coverage is visible; authority stays with the governing contracts.": "这里展示当前覆盖范围；最终要求以对应规范为准。",
    "On this page": "本页目录",
    "Overview": "概览",
    "Next phases": "下一阶段",
    "18 showcased scenarios\n13 planned entries\n\nEnglish and Chinese in Phase 3.": "18 个可预览场景\n13 个计划项\n\n第三阶段支持中英双语。",
    "Search Scenario Atlas": "搜索场景目录",
    "Search sections and showcased scenarios": "搜索章节与已展示场景",
    "Search commands": "搜索命令",
    "Atlas sections": "场景目录章节",
    "Section": "章节",
    "5 scenarios": "5 个场景",
    "4 scenarios": "4 个场景",
    "11 scenarios": "11 个场景",
    "Showcased scenarios": "可预览场景",
    "Sources": "来源",
    "Scenario catalog": "场景目录",
    "KIN documentation": "KIN 文档",
    "Home": "首页",
    "Use system theme": "跟随系统主题",
    "Appearance": "外观",
    "No matching scenario or section.": "没有匹配的场景或章节。"
  });

  function replaceNodeText(node, replacement) {
    const leading = node.nodeValue.match(/^\s*/u)?.[0] ?? "";
    const trailing = node.nodeValue.match(/\s*$/u)?.[0] ?? "";
    node.nodeValue = `${leading}${replacement}${trailing}`;
  }

  function translateText(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const value = node.nodeValue.trim();
      if (STATIC_COPY[value]) replaceNodeText(node, STATIC_COPY[value]);
      node = walker.nextNode();
    }
    for (const element of root.querySelectorAll("[aria-label], [alt], [title], [placeholder]")) {
      for (const attribute of ["aria-label", "alt", "title", "placeholder"]) {
        if (!element.hasAttribute(attribute)) continue;
        const value = element.getAttribute(attribute);
        if (STATIC_COPY[value]) element.setAttribute(attribute, STATIC_COPY[value]);
      }
    }
  }

  function setPrimaryText(element, value) {
    const textNode = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode) replaceNodeText(textNode, value);
  }

  function preserveChineseLocale(href) {
    const url = new URL(href, window.location.href);
    url.searchParams.set("lang", "zh-CN");
    return url.pathname + url.search + url.hash;
  }

  async function initializeChineseAtlas() {
    const response = await fetch("locale.zh-CN.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`locale catalog returned ${response.status}`);
    const catalog = await response.json();

    translateText();
    const localNavigationTrigger = document.querySelector("[data-local-nav-toggle]");
    if (localNavigationTrigger) {
      localNavigationTrigger.dataset.openLabel = STATIC_COPY["Open Scenario Atlas sections"];
      localNavigationTrigger.dataset.closeLabel = STATIC_COPY["Close Scenario Atlas sections"];
    }
    document.title = "场景目录 · KIN 设计系统";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = "浏览 KIN 在情报、信息、电商、工程与通用流程中的 31 个任务场景。";

    const languageLinks = document.querySelectorAll("[data-language-menu] a");
    const englishLink = [...languageLinks].find((link) => link.lang === "en");
    const chineseLink = [...languageLinks].find((link) => link.lang === "zh-CN");
    if (englishLink) {
      englishLink.href = "./";
      englishLink.removeAttribute("aria-current");
    }
    if (chineseLink) {
      chineseLink.href = "./?lang=zh-CN";
      chineseLink.setAttribute("aria-current", "page");
      chineseLink.removeAttribute("hreflang");
    }

    const localizedGlobalHrefs = Object.freeze({
      showcase: "../zh/",
      components: "../zh/components/",
      patterns: "../zh/patterns/",
      scenarios: "./?lang=zh-CN",
      lab: "./lab.html?lang=zh-CN",
      docs: "../zh/docs/",
    });
    for (const link of document.querySelectorAll("[data-global-nav-key]")) {
      const href = localizedGlobalHrefs[link.dataset.globalNavKey];
      if (href) link.href = href;
    }

    for (const link of document.querySelectorAll('a[href*="lab.html"]')) {
      link.href = preserveChineseLocale(link.getAttribute("href"));
    }

    for (const row of document.querySelectorAll("[data-scenario-id]")) {
      const translation = catalog.scenarios[row.dataset.scenarioId];
      if (!translation) continue;
      const title = row.querySelector(".scenario-copy h3");
      const summary = row.querySelector(".scenario-copy > p");
      if (title) {
        const link = title.querySelector("a");
        if (link) setPrimaryText(link, translation.name);
        else title.textContent = translation.name;
      }
      if (summary) summary.textContent = translation.job;
    }

    for (const link of document.querySelectorAll('.command-item[href*="scenario="]')) {
      const id = new URL(link.href).searchParams.get("scenario");
      const translation = catalog.scenarios[id];
      if (translation) setPrimaryText(link, translation.name);
    }
  }

  initializeChineseAtlas().catch((error) => {
    console.error("KIN Scenario Atlas localization failed.", error);
    const fallbackUrl = new URL(window.location.href);
    fallbackUrl.searchParams.delete("lang");
    window.location.replace(fallbackUrl);
  });
}
