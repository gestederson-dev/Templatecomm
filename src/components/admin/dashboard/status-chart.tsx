"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CATEGORICAL, CHART_AXIS, CHART_GRID } from "@/lib/admin/chart-colors";

const STATUS_ORDER = ["pending", "paid", "processing", "shipped", "delivered", "canceled"];
const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando",
  paid: "Pago",
  processing: "Preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  canceled: "Cancelado",
};

export function StatusChart({ data }: { data: { status: string; count: number }[] }) {
  const byStatus = new Map(data.map((d) => [d.status, d.count]));
  const chartData = STATUS_ORDER.map((status, index) => ({
    status,
    label: STATUS_LABEL[status],
    count: byStatus.get(status) ?? 0,
    color: CATEGORICAL[index],
  }));

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-ink/52">Sem pedidos no período.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="label" stroke={CHART_AXIS} tick={{ fontSize: 12, fill: CHART_AXIS }} tickLine={false} axisLine={{ stroke: CHART_AXIS }} />
        <YAxis allowDecimals={false} stroke={CHART_AXIS} tick={{ fontSize: 12, fill: CHART_AXIS }} tickLine={false} axisLine={false} width={32} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--line)", boxShadow: "var(--shadow-panel)" }} />
        <Bar dataKey="count" name="Pedidos" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
