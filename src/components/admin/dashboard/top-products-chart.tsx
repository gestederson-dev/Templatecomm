"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS, CHART_GRID, SEQUENTIAL_BLUE } from "@/lib/admin/chart-colors";
import { formatBRL } from "@/lib/format";

export function TopProductsChart({ data }: { data: { name: string; revenue: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Sem vendas no período.</div>;
  }

  const chartData = [...data].sort((a, b) => a.revenue - b.revenue);

  return (
    <ResponsiveContainer width="100%" height={Math.max(256, chartData.length * 32)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
        <XAxis type="number" tickFormatter={(value: number) => formatBRL(value)} stroke={CHART_AXIS} tick={{ fontSize: 12, fill: CHART_AXIS }} tickLine={false} axisLine={{ stroke: CHART_AXIS }} />
        <YAxis type="category" dataKey="name" width={160} stroke={CHART_AXIS} tick={{ fontSize: 12, fill: CHART_AXIS }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => formatBRL(Number(value))} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="revenue" name="Faturamento" fill={SEQUENTIAL_BLUE[2]} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
