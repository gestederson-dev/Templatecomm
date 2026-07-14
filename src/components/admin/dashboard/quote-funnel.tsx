const STAGE_STYLE: { bg: string; color: string }[] = [
  { bg: "#860531", color: "#fff" }, // Solicitados — wine
  { bg: "#a8214a", color: "#fff" }, // Cotados — wine-lite
  { bg: "#c9526f", color: "#fff" }, // Aprovados
  { bg: "#f39a00", color: "#0a0a0a" }, // Convertidos — amber
];

export function QuoteFunnel({ data }: { data: { stage: string; count: number }[] }) {
  const total = data[0]?.count ?? 0;

  if (total === 0) {
    return <div className="flex h-[190px] items-center justify-center text-sm text-ink/52">Sem orçamentos no período.</div>;
  }

  return (
    <div className="flex flex-col gap-[11px]">
      {data.map((stage, i) => {
        const pct = i === 0 ? 100 : Math.round((stage.count / total) * 100);
        const width = stage.count > 0 ? Math.max(pct, 8) : 0;
        const style = STAGE_STYLE[i] ?? STAGE_STYLE[STAGE_STYLE.length - 1];
        return (
          <div key={stage.stage} className="flex items-center gap-3.5">
            <div
              className="flex h-[38px] min-w-[80px] items-center rounded-lg px-3.5 text-[13.5px] font-semibold"
              style={{ width: `${width}%`, background: style.bg, color: style.color }}
            >
              {stage.stage}
            </div>
            <div className="whitespace-nowrap text-[12.5px] text-ink/52">
              <b className="font-[family-name:var(--font-display)] text-[15px] text-ink">{stage.count}</b>
              {i > 0 ? ` · ${pct}%` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
