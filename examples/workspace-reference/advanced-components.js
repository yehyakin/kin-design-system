const contrastButton = document.querySelector("[data-contrast-toggle]");

function applyContrast(enabled, persist = true) {
  document.documentElement.dataset.contrast = enabled ? "more" : "normal";
  contrastButton.setAttribute("aria-pressed", String(enabled));
  if (persist) localStorage.setItem("kin-reference-contrast", enabled ? "more" : "normal");
}

contrastButton.addEventListener("click", () => applyContrast(document.documentElement.dataset.contrast !== "more"));
addEventListener("storage", (event) => {
  if (event.key === "kin-reference-contrast") applyContrast(event.newValue === "more", false);
});

const composer = document.querySelector("[data-composer]");
const composerStatus = document.querySelector("[data-composer-status]");
const composerSubmit = document.querySelector("[data-composer-submit]");
const composerStop = document.querySelector("[data-composer-stop]");
const composerRetry = document.querySelector("[data-composer-retry]");
const generatedResult = document.querySelector("[data-generated-result]");
const resultState = document.querySelector("[data-result-state]");
const resultBody = document.querySelector("[data-result-body]");
const uncertainty = document.querySelector("[data-uncertainty]");
let composerTimers = [];

function clearComposerTimers() {
  for (const timer of composerTimers) clearTimeout(timer);
  composerTimers = [];
}

function setComposerControls(state) {
  const streaming = state === "streaming";
  composerSubmit.disabled = streaming;
  composerSubmit.hidden = state === "stopped" || state === "failed";
  composerStop.hidden = !streaming;
  composerRetry.hidden = !(state === "stopped" || state === "failed");
}

function startFixtureGeneration() {
  clearComposerTimers();
  generatedResult.dataset.state = "streaming";
  resultState.textContent = "生成中 · 本地基准";
  composerStatus.textContent = "正在生成本地参考结果";
  resultBody.innerHTML = '<p>内部价格记录显示，Field Jacket 当前价格为 CNY 1,299.00 <a href="#evidence-1">[1]</a>。<span class="stream-caret" aria-hidden="true"></span></p>';
  uncertainty.hidden = true;
  setComposerControls("streaming");
  composerTimers.push(setTimeout(() => {
    resultBody.innerHTML = '<p>内部价格记录显示，Field Jacket 当前价格为 CNY 1,299.00 <a href="#evidence-1">[1]</a>。</p><p>外部渠道快照仍显示 CNY 1,399.00 <a href="#evidence-3">[3]</a>，两者存在冲突。<span class="stream-caret" aria-hidden="true"></span></p>';
  }, 280));
  composerTimers.push(setTimeout(() => {
    generatedResult.dataset.state = "complete";
    resultState.textContent = "已完成 · 本地基准";
    composerStatus.textContent = "参考结果已完成，尚未批准或执行";
    resultBody.innerHTML = '<p>内部价格记录显示，Field Jacket 当前价格为 CNY 1,299.00 <a href="#evidence-1">[1]</a>。</p><p>外部渠道快照仍显示 CNY 1,399.00 <a href="#evidence-3">[3]</a>。建议在发布前确认渠道活动状态 <a href="#evidence-2">[2]</a>。</p>';
    uncertainty.hidden = false;
    setComposerControls("complete");
  }, 760));
}

composer.addEventListener("submit", (event) => { event.preventDefault(); startFixtureGeneration(); });
composerStop.addEventListener("click", () => {
  clearComposerTimers();
  generatedResult.dataset.state = "stopped";
  resultState.textContent = "已停止 · 保留部分结果";
  composerStatus.textContent = "本地生成已停止，可使用相同输入重试";
  resultBody.querySelector(".stream-caret")?.remove();
  setComposerControls("stopped");
});
composerRetry.addEventListener("click", startFixtureGeneration);

const changeReview = document.querySelector("[data-change-review]");
const reviewState = document.querySelector("[data-review-state]");
const reviewMessage = document.querySelector("[data-review-message]");
const proposedValue = changeReview.querySelector(".proposed-value strong");

document.querySelector("[data-review-accept]").addEventListener("click", () => {
  changeReview.dataset.state = "accepted";
  reviewState.textContent = "已接受 · 尚未执行";
  reviewMessage.textContent = "建议已进入待执行状态；源数据尚未修改。";
});
document.querySelector("[data-review-reject]").addEventListener("click", () => {
  changeReview.dataset.state = "rejected";
  reviewState.textContent = "已拒绝";
  reviewMessage.textContent = "建议已拒绝；当前价格保持不变。";
});
document.querySelector("[data-review-edit]").addEventListener("click", () => {
  proposedValue.contentEditable = "true";
  proposedValue.setAttribute("role", "textbox");
  proposedValue.setAttribute("aria-label", "编辑建议值");
  proposedValue.focus();
  reviewMessage.textContent = "正在编辑建议值；保存前需要重新审核。";
});

const scopeConfirm = document.querySelector("[data-scope-confirm]");
const createTask = document.querySelector("[data-create-task]");
const executionStatus = document.querySelector("[data-execution-status]");
const createdTask = document.querySelector("[data-created-task]");
const taskSummary = document.querySelector("[data-task-summary]");

scopeConfirm.addEventListener("change", () => { createTask.disabled = !scopeConfirm.checked; });
createTask.addEventListener("click", () => {
  createdTask.hidden = false;
  executionStatus.textContent = "发布任务已在本地基准中创建，当前状态为排队中。";
  taskSummary.textContent = "4 个任务：1 个排队中，1 个运行中，1 个失败，1 个已完成。";
  document.querySelector("[data-created-cancel]").focus();
});

const mediaSelect = document.querySelector("[data-media-select]");
const mediaStatus = document.querySelector("[data-media-status]");
mediaSelect.addEventListener("click", () => {
  const selected = mediaSelect.getAttribute("aria-pressed") !== "true";
  mediaSelect.setAttribute("aria-pressed", String(selected));
  mediaSelect.textContent = selected ? "已选择" : "选择资产";
  mediaStatus.textContent = selected ? "资产已选择，仍需单独批准。" : "资产未选择，也未批准。";
});
document.querySelector("[data-media-reject]").addEventListener("click", () => { mediaStatus.textContent = "已要求修改裁切；资产未批准。"; });
document.querySelector("[data-media-approve]").addEventListener("click", () => { mediaStatus.textContent = "资产已批准用于官网；渠道 B 的裁切仍待处理。"; });

document.querySelector("[data-created-cancel]").addEventListener("click", () => {
  document.querySelector("[data-created-state]").textContent = "已取消";
  executionStatus.textContent = "排队任务已取消，没有执行外部写入。";
  taskSummary.textContent = "4 个任务：1 个已取消，1 个运行中，1 个失败，1 个已完成。";
});
document.querySelector("[data-task-cancel]").addEventListener("click", (event) => {
  event.currentTarget.closest(".task-row").querySelector("[role='cell']:nth-child(2)").textContent = "取消请求中";
  event.currentTarget.disabled = true;
  taskSummary.textContent = "已请求取消同步任务；等待本地基准确认。";
});
document.querySelector("[data-task-retry]").addEventListener("click", (event) => {
  const row = event.currentTarget.closest(".task-row");
  row.classList.remove("failed-task");
  row.querySelector("[role='cell']:nth-child(2)").textContent = "排队重试";
  event.currentTarget.textContent = "取消重试";
  taskSummary.textContent = "失败任务已创建本地重试，原始筛选保持不变。";
});

const chartVisual = document.querySelector("[data-chart-visual]");
const chartTable = document.querySelector("[data-chart-table]");
for (const button of document.querySelectorAll("[data-chart-view]")) {
  button.addEventListener("click", () => {
    const view = button.dataset.chartView;
    for (const candidate of document.querySelectorAll("[data-chart-view]")) candidate.setAttribute("aria-pressed", String(candidate === button));
    chartVisual.hidden = view === "table";
    chartTable.hidden = view === "chart";
    (view === "chart" ? chartVisual.querySelector("circle") : chartTable.querySelector("caption")).focus?.();
  });
}
chartTable.hidden = true;

applyContrast(document.documentElement.dataset.contrast === "more", false);
document.body.dataset.fixtureReady = "true";
