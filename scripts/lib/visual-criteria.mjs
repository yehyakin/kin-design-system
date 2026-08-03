export const baseVisualCriteria = Object.freeze([
  "task-first",
  "dominant-region",
  "continuous-structure",
  "density-without-repetition",
  "semantic-separation",
  "theme-integrity",
  "motion-continuity",
  "responsive-priority",
  "no-fabricated-data-or-behavior",
]);

export const kin3VisualCriteria = Object.freeze([
  "context-thread",
  "receding-chrome",
  "product-family-silhouette",
  "material-hierarchy",
]);

export function isKin3OrLater(version) {
  return Number.parseInt(String(version).split(".")[0], 10) >= 3;
}

export function requiredVisualCriteriaForVersion(version) {
  return isKin3OrLater(version)
    ? [...baseVisualCriteria, ...kin3VisualCriteria]
    : [...baseVisualCriteria];
}
