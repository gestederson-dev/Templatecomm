const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export const btnWine = `inline-flex items-center justify-center gap-2 rounded-full bg-wine px-6 py-3 text-[15.5px] font-semibold text-white shadow-[var(--shadow-brand)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-brand-lift)] ${focusRing}`;

export const btnAmber = `inline-flex items-center justify-center gap-2 rounded-full bg-amber px-6 py-3 text-[15.5px] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-8px_rgba(243,154,0,0.6)] ${focusRing}`;

export const btnOutline = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-wine ring-1 ring-inset ring-wine transition-all hover:-translate-y-0.5 hover:bg-wine hover:text-white ${focusRing}`;

export const btnGhost = `inline-flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-ink/85 transition-colors hover:text-wine ${focusRing}`;

export const btnAmberSm = `inline-flex items-center justify-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-8px_rgba(243,154,0,0.6)] ${focusRing}`;
