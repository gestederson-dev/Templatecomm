const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export const adminBtnAmber = `inline-flex items-center justify-center gap-2 rounded-[10px] bg-amber px-[18px] py-2.5 text-sm font-semibold text-ink transition-all hover:-translate-y-px hover:shadow-[0_8px_18px_-8px_rgba(243,154,0,0.6)] disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const adminBtnWine = `inline-flex items-center justify-center gap-2 rounded-[10px] bg-wine px-[18px] py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const adminBtnSoft = `inline-flex items-center justify-center gap-2 rounded-[10px] border border-line bg-white px-[18px] py-2.5 text-sm font-semibold text-ink transition-colors hover:border-wine hover:text-wine disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const adminIconBtn = `grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-ink/52 transition-colors hover:border-wine hover:text-wine ${focusRing}`;

export const adminPanel = "overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-panel)]";

export const adminCard = "rounded-2xl border border-line bg-white p-[22px] shadow-[var(--shadow-panel)]";

export const adminInput =
  "w-full rounded-[9px] border border-line bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:border-wine focus:ring-[3px] focus:ring-wine-tint";

export const adminLabel = "mb-1.5 block text-[12.5px] font-semibold text-ink";
