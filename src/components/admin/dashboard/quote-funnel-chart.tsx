"use client";

import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import { SEQUENTIAL_BLUE } from "@/lib/admin/chart-colors";

export function QuoteFunnelChart({ data }: { data: { stage: string; count: number }[] }) {
  if (data.every((d) => d.count === 0)) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Sem orçamentos no período.</div>;
  }

  const steps = [SEQUENTIAL_BLUE[0], SEQUENTIAL_BLUE[1], SEQUENTIAL_BLUE[3], SEQUENTIAL_BLUE[4]];

  return (
    <ResponsiveContainer width="100%" height={256}>
      <FunnelChart>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Funnel dataKey="count" data={data} nameKey="stage" isAnimationActive={false}>
          <LabelList position="right" dataKey="stage" fill="#52514e" stroke="none" fontSize={12} />
          <LabelList position="center" dataKey="count" fill="#ffffff" stroke="none" fontSize={13} fontWeight={600} />
          {data.map((entry, index) => (
            <Cell key={entry.stage} fill={steps[index] ?? steps[steps.length - 1]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
