export function LoadingHeart({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24" role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" className="salmar-pulse h-12 w-12 fill-wine" aria-hidden="true">
        <path d="M12 21.3 3.5 13c-2-2-2-5.2 0-7.1 2-2 5.1-2 7 0l1.5 1.5L13.5 5.9c2-2 5.1-2 7 0 2 2 2 5.2 0 7.1z" />
      </svg>
      {label ? <p className="text-sm text-ink/45">{label}</p> : null}
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
