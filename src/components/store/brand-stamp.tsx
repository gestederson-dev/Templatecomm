/** Selo losango facetado "SUA MARCA" — motivo de gema, marca a personalização (design system §7). */
export function BrandStamp() {
  return (
    <div className="absolute bottom-3.5 right-3.5 z-[2] grid h-12 w-12 place-items-center" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full stroke-amber" fill="none" strokeWidth={1.3}>
        <path d="M24 3 45 24 24 45 3 24Z" />
      </svg>
      <span className="z-[1] text-center text-[7.5px] font-bold leading-[1.05] tracking-[0.04em] text-wine">
        SUA
        <br />
        MARCA
      </span>
    </div>
  );
}
