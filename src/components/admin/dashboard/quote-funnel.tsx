import { ChartEmptyState } from "@/components/admin/dashboard/chart-empty-state";

const STAGE_STYLE: { bg: string; color: string }[] = [
  { bg: "#860531", color: "#fff" }, // Solicitados — wine
  { bg: "#a8214a", color: "#fff" }, // Cotados — wine-lite
  { bg: "#c9526f", color: "#fff" }, // Aprovados
  { bg: "#f39a00", color: "#0a0a0a" }, // Convertidos — amber
];

const MIN_BAR_WIDTH_PX = 80;
const ASSUMED_PANEL_WIDTH_PX = 460; // conservative estimate of the panel's inner content width

function labelFitsInside(text: string, pct: number): boolean {
  const estimatedTextWidthPx = text.length * 7.4 + 28; // char width + horizontal padding
  const barWidthPx = Math.max((pct / 100) * ASSUMED_PANEL_WIDTH_PX, MIN_BAR_WIDTH_PX);
  return barWidthPx >= estimatedTextWidthPx;
}

export function QuoteFunnel({ data }: { data: { stage: string; count: number }[] }) {
  const total = data[0]?.count ?? 0;

  if (total === 0) {
    return <ChartEmptyState message="Sem orçamentos no período." />;
  }

  return (
    <div className="flex flex-col gap-[11px]">
      {data.map((stage, i) => {
        const pct = i === 0 ? 100 : Math.round((stage.count / total) * 100);
        const style = STAGE_STYLE[i] ?? STAGE_STYLE[STAGE_STYLE.length - 1];
        const fits = labelFitsInside(stage.stage, pct);
        return (
          <div key={stage.stage} className="flex items-center gap-3">
            <div
              className="flex h-[38px] items-center rounded-lg px-3.5 text-[13.5px] font-semibold"
              style={{ width: `${pct}%`, minWidth: MIN_BAR_WIDTH_PX, background: style.bg, color: style.color }}
            >
              {fits ? stage.stage : ""}
            </div>
            {!fits ? <span className="shrink-0 whitespace-nowrap text-[13.5px] font-semibold text-ink">{stage.stage}</span> : null}
            <div className="ml-auto shrink-0 whitespace-nowrap pr-0.5 text-[12.5px] text-ink/52">
              <b className="font-[family-name:var(--font-display)] text-[15px] text-ink">{stage.count}</b>
              {i > 0 ? ` · ${pct}%` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
