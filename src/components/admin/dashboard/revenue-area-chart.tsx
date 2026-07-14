"use client";

import { useId } from "react";

const VIEW_W = 640;
const VIEW_H = 190;
const TOP = 20;
const BOTTOM = 160;

export function RevenueAreaChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-[190px] items-center justify-center text-sm text-ink/52">Sem faturamento no período.</div>;
  }

  const gradientId = useId();
  const n = data.length;
  const values = data.map((d) => d.revenue);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const xStep = n > 1 ? VIEW_W / (n - 1) : 0;

  const points = data.map((d, i) => {
    const x = n > 1 ? i * xStep : VIEW_W;
    const y = max === min ? 90 : TOP + ((max - d.revenue) / (max - min)) * (BOTTOM - TOP);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[n - 1].x.toFixed(1)},${VIEW_H} L${points[0].x.toFixed(1)},${VIEW_H} Z`;
  const last = points[n - 1];

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#860531" stopOpacity=".22" />
          <stop offset="100%" stopColor="#860531" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="40" x2={VIEW_W} y2="40" stroke="rgba(10,10,10,.06)" />
      <line x1="0" y1="90" x2={VIEW_W} y2="90" stroke="rgba(10,10,10,.06)" />
      <line x1="0" y1="140" x2={VIEW_W} y2="140" stroke="rgba(10,10,10,.06)" />
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke="#860531" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="4.5" fill="#f39a00" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
