/**
 * Mapa de nomes de cor em pt-BR (como o admin digita em "Cor") pro hex usado
 * na bolinha de seleção. Nome não reconhecido não quebra nada — só não
 * mostra bolinha, cai no rótulo de texto puro.
 */
const COLOR_MAP: Record<string, string> = {
  azul: "#2563eb",
  "azul claro": "#60a5fa",
  "azul escuro": "#1e3a8a",
  "azul marinho": "#1e293b",
  "azul royal": "#1d4ed8",
  vermelho: "#dc2626",
  "vermelho escuro": "#991b1b",
  verde: "#16a34a",
  "verde claro": "#4ade80",
  "verde escuro": "#166534",
  "verde militar": "#4d5b31",
  "verde água": "#14b8a6",
  amarelo: "#eab308",
  "amarelo ouro": "#ca8a04",
  laranja: "#ea580c",
  roxo: "#7c3aed",
  lilás: "#a78bfa",
  lilas: "#a78bfa",
  rosa: "#ec4899",
  "rosa claro": "#f9a8d4",
  "rosa pink": "#db2777",
  pink: "#db2777",
  preto: "#111827",
  branco: "#ffffff",
  cinza: "#6b7280",
  "cinza claro": "#d1d5db",
  "cinza escuro": "#374151",
  grafite: "#374151",
  marrom: "#78350f",
  bege: "#e7d7c1",
  vinho: "#7f1d1d",
  bordô: "#7f1d1d",
  bordo: "#7f1d1d",
  dourado: "#b8860b",
  prateado: "#c0c0c0",
  prata: "#c0c0c0",
  turquesa: "#06b6d4",
  ciano: "#06b6d4",
  magenta: "#d946ef",
  transparente: "#f3f4f6",
  natural: "#e7d7c1",
  madeira: "#a16207",
};

function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const NORMALIZED_MAP: Record<string, string> = Object.fromEntries(Object.entries(COLOR_MAP).map(([name, hex]) => [normalize(name), hex]));

/** Retorna o hex conhecido pro nome de cor, ou null se não reconhecer. */
export function hexForColorName(name: string): string | null {
  return NORMALIZED_MAP[normalize(name)] ?? null;
}
