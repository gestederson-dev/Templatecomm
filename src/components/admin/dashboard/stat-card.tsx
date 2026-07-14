export function StatCard({ label, value, delta, highlight }: { label: string; value: string; delta?: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-2xl border p-4 shadow-[var(--shadow-panel)] ${highlight ? "border-amber/40 bg-amber-tint" : "border-line bg-white"}`}>
      <span className={`text-[11.5px] font-semibold uppercase tracking-[0.04em] ${highlight ? "text-warn" : "text-ink/52"}`}>{label}</span>
      <span className="font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums tracking-[-0.01em] text-ink">{value}</span>
      {delta ? <span className="text-xs text-ink/52">{delta}</span> : null}
    </div>
  );
}
