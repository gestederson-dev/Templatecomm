"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartEmptyState } from "@/components/admin/dashboard/chart-empty-state";
import { CHART_AXIS, CHART_GRID, SEQUENTIAL_WINE } from "@/lib/admin/chart-colors";
import { formatBRL } from "@/lib/format";

export function TopProductsChart({ data }: { data: { name: string; revenue: number }[] }) {
  if (data.length === 0) {
    return <ChartEmptyState message="Sem vendas no período." />;
  }

  const chartData = [...data].sort((a, b) => a.revenue - b.revenue);

  return (
    <ResponsiveContainer width="100%" height={Math.max(256, chartData.length * 32)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
        <XAxis type="number" tickFormatter={(value: number) => formatBRL(value)} stroke={CHART_AXIS} tick={{ fontSize: 12, fill: CHART_AXIS }} tickLine={false} axisLine={{ stroke: CHART_AXIS }} />
        <YAxis type="category" dataKey="name" width={160} stroke={CHART_AXIS} tick={{ fontSize: 12, fill: CHART_AXIS }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => formatBRL(Number(value))} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--line)", boxShadow: "var(--shadow-panel)" }} />
        <Bar dataKey="revenue" name="Faturamento" fill={SEQUENTIAL_WINE[2]} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
