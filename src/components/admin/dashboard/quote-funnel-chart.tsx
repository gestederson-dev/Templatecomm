"use client";

import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import { SEQUENTIAL_WINE } from "@/lib/admin/chart-colors";

export function QuoteFunnelChart({ data }: { data: { stage: string; count: number }[] }) {
  if (data.every((d) => d.count === 0)) {
    return <div className="flex h-64 items-center justify-center text-sm text-ink/52">Sem orçamentos no período.</div>;
  }

  const steps = [SEQUENTIAL_WINE[0], SEQUENTIAL_WINE[1], SEQUENTIAL_WINE[3], SEQUENTIAL_WINE[4]];

  return (
    <ResponsiveContainer width="100%" height={256}>
      <FunnelChart>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--line)", boxShadow: "var(--shadow-panel)" }} />
        <Funnel dataKey="count" data={data} nameKey="stage" isAnimationActive={false}>
          <LabelList position="right" dataKey="stage" fill="#0a0a0a" stroke="none" fontSize={12} />
          <LabelList position="center" dataKey="count" fill="#ffffff" stroke="none" fontSize={13} fontWeight={600} />
          {data.map((entry, index) => (
            <Cell key={entry.stage} fill={steps[index] ?? steps[steps.length - 1]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
