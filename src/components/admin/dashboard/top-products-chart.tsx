import { ChartEmptyState } from "@/components/admin/dashboard/chart-empty-state";

export function TopProductsChart({ data }: { data: { name: string; quantity: number }[] }) {
  if (data.length === 0) {
    return <ChartEmptyState message="Sem vendas no período." />;
  }

  const max = Math.max(...data.map((d) => d.quantity));

  return (
    <div className="flex flex-col gap-3.5">
      {data.map((product) => (
        <div key={product.name} className="grid grid-cols-[140px_1fr_56px] items-center gap-3 text-[13px]">
          <span className="truncate text-ink/78" title={product.name}>
            {product.name}
          </span>
          <div className="h-[9px] overflow-hidden rounded-full bg-wine-tint">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#860531,#a8214a)]" style={{ width: `${max > 0 ? (product.quantity / max) * 100 : 0}%` }} />
          </div>
          <span className="text-right font-[family-name:var(--font-display)] font-semibold text-wine">{product.quantity.toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
}
