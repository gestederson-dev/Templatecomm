export function StatCard({ label, value, delta, highlight }: { label: string; value: string; delta?: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border p-4 ${highlight ? "border-[#fab219]/40 bg-[#fab219]/5" : ""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {delta ? <span className="text-xs text-muted-foreground">{delta}</span> : null}
    </div>
  );
}
