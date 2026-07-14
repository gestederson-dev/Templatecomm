const R = 46;
const CIRCUMFERENCE = 2 * Math.PI * R;

const SEGMENTS: { status: string; label: string; color: string }[] = [
  { status: "paid", label: "Pago", color: "#1a7a4f" },
  { status: "processing", label: "Processando", color: "#f39a00" },
  { status: "shipped", label: "Enviado", color: "#2563a8" },
  { status: "delivered", label: "Entregue", color: "#860531" },
  { status: "canceled", label: "Cancelado", color: "#b3261e" },
];

export function StatusDonut({ data }: { data: { status: string; count: number }[] }) {
  const countByStatus = new Map(data.map((d) => [d.status, d.count]));
  const segments = SEGMENTS.map((s) => ({ ...s, count: countByStatus.get(s.status) ?? 0 }));
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) {
    return <div className="flex h-[190px] items-center justify-center text-sm text-ink/52">Sem pedidos no período.</div>;
  }

  let cumulative = 0;
  const arcs = segments.map((s) => {
    const length = (s.count / total) * CIRCUMFERENCE;
    const arc = { ...s, length, offset: -cumulative };
    cumulative += length;
    return arc;
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="#f0f1f0" strokeWidth="16" />
        {arcs.map((arc) => (
          <circle
            key={arc.status}
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth="16"
            strokeDasharray={`${arc.length.toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`}
            strokeDashoffset={arc.offset.toFixed(2)}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2.5 text-[13px]">
        {segments.map((s) => (
          <div key={s.status} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
            <span className="text-ink/78">{s.label}</span>
            <b className="ml-auto font-[family-name:var(--font-display)] font-semibold">{s.count}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
