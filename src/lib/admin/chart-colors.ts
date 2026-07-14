/**
 * Paleta validada (CVD-safe) da skill de dataviz — ordem fixa, nunca ciclada.
 * ΔE adjacente mínimo 24.2 no modo claro. Ver references/palette.md da skill.
 */
export const CATEGORICAL = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"] as const;

/** Rampa sequencial vinho (magnitude/ordinal), degraus 250→650, ancorada nos tokens de marca. */
export const SEQUENTIAL_WINE = ["#e3aec0", "#c56888", "#860531", "#690527", "#450219"] as const;

export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const CHART_GRID = "rgba(10, 10, 10, 0.08)";
export const CHART_AXIS = "rgba(10, 10, 10, 0.35)";
export const CHART_MUTED = "rgba(10, 10, 10, 0.52)";
export const CHART_INK = "#0a0a0a";
