"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS, CHART_GRID, SEQUENTIAL_WINE } from "@/lib/admin/chart-colors";
import { formatBRL } from "@/lib/format";

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-ink/52">Sem faturamento no período.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
          stroke={CHART_AXIS}
          tick={{ fontSize: 12, fill: CHART_AXIS }}
          tickLine={false}
          axisLine={{ stroke: CHART_AXIS }}
        />
        <YAxis
          tickFormatter={(value: number) => formatBRL(value)}
          stroke={CHART_AXIS}
          tick={{ fontSize: 12, fill: CHART_AXIS }}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          formatter={(value) => formatBRL(Number(value))}
          labelFormatter={(value) => new Date(String(value)).toLocaleDateString("pt-BR")}
          contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--line)", boxShadow: "var(--shadow-panel)" }}
        />
        <Line type="monotone" dataKey="revenue" stroke={SEQUENTIAL_WINE[2]} strokeWidth={2} dot={{ r: 3, fill: SEQUENTIAL_WINE[2] }} name="Faturamento" />
      </LineChart>
    </ResponsiveContainer>
  );
}
