const lockOwners = new Set();
let lockedScrollY = 0;
let lockedScrollX = 0;
let previousBodyStyles;

function readBodyStyles() {
  return {
    left: document.body.style.left,
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
    position: document.body.style.position,
    right: document.body.style.right,
    top: document.body.style.top,
    width: document.body.style.width,
  };
}

function restoreBodyStyles(styles) {
  for (const [property, value] of Object.entries(styles)) {
    document.body.style[property] = value;
  }
}

export function lockModalScroll(owner) {
  if (!owner || lockOwners.has(owner)) return;
  lockOwners.add(owner);
  if (lockOwners.size > 1) return;

  lockedScrollY = window.scrollY;
  lockedScrollX = window.scrollX;
  previousBodyStyles = readBodyStyles();
  const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;

  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.right = "0";
  document.body.style.left = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  if (scrollbarGap > 0) document.body.style.paddingRight = `${currentPadding + scrollbarGap}px`;
}

export function unlockModalScroll(owner) {
  if (!owner || !lockOwners.delete(owner) || lockOwners.size > 0) return;
  const restoreY = lockedScrollY;
  const restoreX = lockedScrollX;
  restoreBodyStyles(previousBodyStyles ?? readBodyStyles());
  previousBodyStyles = undefined;
  lockedScrollY = 0;
  lockedScrollX = 0;
  window.scrollTo({ top: restoreY, left: restoreX, behavior: "instant" });
}
