"use client";

import { useId, useRef, useState } from "react";
import { ChartEmptyState } from "@/components/admin/dashboard/chart-empty-state";
import { formatBRL } from "@/lib/format";

const VIEW_W = 640;
const VIEW_H = 196;
const PAD_X = 22;
const TOP = 30;
const BASELINE = 148;
const DATE_Y = 172;

// Com poucos dias no período, uma linha ligando 2-3 pontos exagera qualquer
// variação (parece "queda"/"alta" dramática). Abaixo desse total de pontos,
// cada dia vira uma barra isolada — leitura honesta de "valores discretos",
// não de uma trajetória contínua que os dados não sustentam.
const BAR_MODE_MAX_POINTS = 4;

const MESES_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function dayLabel(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${day} ${MESES_PT[(month || 1) - 1]}`;
}

/** Rect com cantos superiores arredondados e base reta (a barra "nasce" da linha de base). */
function topRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

/** Catmull-Rom -> Bézier cúbica: curva orgânica que ainda passa exatamente por cada valor real. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

type HoverPoint = { x: number; y: number; date: string; value: number };

export function RevenueAreaChart({ data }: { data: { date: string; revenue: number }[] }) {
  const areaGradientId = useId();
  const barGradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return <ChartEmptyState message="Sem faturamento no período." />;
  }

  const n = data.length;
  const values = data.map((d) => d.revenue);
  const rawMax = Math.max(...values);
  // Escala sempre ancorada em zero: sem isso, dois valores próximos entre si
  // (mas distantes de zero) ocupam a altura toda do gráfico e parecem uma
  // queda/alta brutal que não existe de fato.
  const yMax = rawMax > 0 ? rawMax * 1.2 : 1;
  const yOf = (v: number) => BASELINE - (v / yMax) * (BASELINE - TOP);

  const isBarMode = n <= BAR_MODE_MAX_POINTS;
  const plotW = VIEW_W - PAD_X * 2;
  const peakIndex = values.indexOf(rawMax);
  const lastIndex = n - 1;

  const linePoints = data.map((d, i) => ({
    x: n > 1 ? PAD_X + (i * plotW) / (n - 1) : PAD_X + plotW / 2,
    y: yOf(d.revenue),
    date: d.date,
    value: d.revenue,
  }));

  const slotW = plotW / n;
  const barGeoms = data.map((d, i) => {
    const height = Math.max(BASELINE - yOf(d.revenue), 2);
    return {
      x: PAD_X + slotW * (i + 0.5),
      y: BASELINE - height,
      height,
      date: d.date,
      value: d.revenue,
    };
  });
  const barWidth = Math.min(24, slotW * 0.46);

  function handlePointerMove(clientX: number) {
    const svg = svgRef.current;
    if (!svg || linePoints.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * VIEW_W;
    let nearest = 0;
    let minDist = Infinity;
    linePoints.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    setHover(nearest);
  }

  const hoverPoint: HoverPoint | null = hover === null ? null : isBarMode ? barGeoms[hover] : linePoints[hover];

  const curvePath = smoothPath(linePoints);
  const areaPath = n > 1 ? `${curvePath} L${linePoints[lastIndex].x.toFixed(2)},${BASELINE} L${linePoints[0].x.toFixed(2)},${BASELINE} Z` : "";

  function tooltipStyle(point: HoverPoint): React.CSSProperties {
    const fx = point.x / VIEW_W;
    const translateX = fx < 0.16 ? "0%" : fx > 0.84 ? "-100%" : "-50%";
    return {
      left: `${fx * 100}%`,
      top: `${(point.y / VIEW_H) * 100}%`,
      transform: `translate(${translateX}, calc(-100% - 10px))`,
    };
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: "100%", height: "auto" }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#860531" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#860531" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8214a" />
            <stop offset="100%" stopColor="#860531" />
          </linearGradient>
        </defs>

        <line x1={PAD_X - 6} y1={BASELINE} x2={VIEW_W - PAD_X + 6} y2={BASELINE} stroke="rgba(10,10,10,.1)" strokeWidth="1" />

        {isBarMode ? (
          <>
            {barGeoms.map((b, i) => {
              const isLast = i === lastIndex;
              const isLabeled = i === peakIndex || isLast;
              const isHovered = hover === i;
              return (
                <g key={b.date}>
                  <path
                    d={topRoundedRectPath(b.x - barWidth / 2, b.y, barWidth, b.height, 4)}
                    fill={`url(#${barGradientId})`}
                    opacity={isHovered ? 1 : 0.9}
                    tabIndex={0}
                    role="img"
                    aria-label={`${dayLabel(b.date)}: ${formatBRL(b.value)}`}
                    onPointerEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    style={{ cursor: "pointer", outline: "none" }}
                  />
                  {isLast && <circle cx={b.x} cy={b.y - 6} r="3" fill="#f39a00" stroke="#fff" strokeWidth="1.5" />}
                  {isLabeled && (
                    <text
                      x={b.x}
                      y={isLast ? b.y - 15 : b.y - 9}
                      textAnchor="middle"
                      fill="rgba(10,10,10,.65)"
                      style={{ fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatBRL(b.value)}
                    </text>
                  )}
                  <text x={b.x} y={DATE_Y} textAnchor="middle" fill="rgba(10,10,10,.4)" style={{ fontSize: 10.5 }}>
                    {dayLabel(b.date)}
                  </text>
                </g>
              );
            })}
          </>
        ) : (
          <>
            <path d={areaPath} fill={`url(#${areaGradientId})`} />
            <path d={curvePath} fill="none" stroke="#860531" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {peakIndex !== lastIndex && (
              <>
                <circle cx={linePoints[peakIndex].x} cy={linePoints[peakIndex].y} r="4" fill="#860531" stroke="#fff" strokeWidth="2" />
                <text
                  x={linePoints[peakIndex].x}
                  y={linePoints[peakIndex].y - 10}
                  textAnchor="middle"
                  fill="rgba(10,10,10,.55)"
                  style={{ fontSize: 10.5, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                >
                  {formatBRL(values[peakIndex])}
                </text>
              </>
            )}

            <circle cx={linePoints[lastIndex].x} cy={linePoints[lastIndex].y} r="5" fill="#f39a00" stroke="#fff" strokeWidth="2" />

            <text x={linePoints[0].x} y={DATE_Y} textAnchor="start" fill="rgba(10,10,10,.4)" style={{ fontSize: 10.5 }}>
              {dayLabel(linePoints[0].date)}
            </text>
            <text x={linePoints[lastIndex].x} y={DATE_Y} textAnchor="end" fill="rgba(10,10,10,.4)" style={{ fontSize: 10.5 }}>
              {dayLabel(linePoints[lastIndex].date)}
            </text>

            {hover !== null && (
              <>
                <line x1={linePoints[hover].x} y1={TOP} x2={linePoints[hover].x} y2={BASELINE} stroke="rgba(10,10,10,.14)" strokeWidth="1" />
                <circle cx={linePoints[hover].x} cy={linePoints[hover].y} r="7" fill="none" stroke="#860531" strokeWidth="1.5" opacity="0.45" />
              </>
            )}

            <rect
              x="0"
              y="0"
              width={VIEW_W}
              height={VIEW_H}
              fill="transparent"
              onPointerMove={(e) => handlePointerMove(e.clientX)}
              onPointerLeave={() => setHover(null)}
            />
          </>
        )}
      </svg>

      {hoverPoint && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] shadow-[var(--shadow-panel)]"
          style={tooltipStyle(hoverPoint)}
        >
          <div className="font-semibold tabular-nums text-wine">{formatBRL(hoverPoint.value)}</div>
          <div className="text-ink/50">{dayLabel(hoverPoint.date)}</div>
        </div>
      )}
    </div>
  );
}
