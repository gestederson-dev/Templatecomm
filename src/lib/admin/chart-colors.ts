/**
 * Paleta validada (CVD-safe) da skill de dataviz — ordem fixa, nunca ciclada.
 * ΔE adjacente mínimo 24.2 no modo claro. Ver references/palette.md da skill.
 */
export const CATEGORICAL = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"] as const;

/** Rampa sequencial azul (magnitude/ordinal), degraus 250→650. */
export const SEQUENTIAL_BLUE = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"] as const;

export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const CHART_GRID = "#e1e0d9";
export const CHART_AXIS = "#c3c2b7";
export const CHART_MUTED = "#898781";
export const CHART_INK = "#52514e";
