import Link from "next/link";
import { adminCard } from "@/components/admin/ui-styles";
import { formatBRL } from "@/lib/format";
import type { PricingAlert } from "@/lib/admin/pricing";

export function PricingAlertsCard({ alerts, missingCostCount }: { alerts: PricingAlert[]; missingCostCount: number }) {
  if (alerts.length === 0 && missingCostCount === 0) return null;

  return (
    <div className={adminCard}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Alertas de precificação</h2>
          <p className="mt-0.5 text-[12.5px] text-ink/52">Produtos vendendo abaixo do preço mínimo ou com margem apertada</p>
        </div>
        <Link href="/admin/precificacao" className="text-[13.5px] font-semibold text-wine hover:underline">
          Ver calculadora →
        </Link>
      </div>

      {missingCostCount > 0 ? (
        <p className="mb-3 rounded-lg bg-wine-tint px-3 py-2 text-[12.5px] text-wine">
          {missingCostCount} {missingCostCount === 1 ? "produto ativo ainda não tem" : "produtos ativos ainda não têm"} custo cadastrado — sem isso, não dá pra saber se estão dando lucro.
        </p>
      ) : null}

      {alerts.length > 0 ? (
        <div className="flex flex-col divide-y divide-line">
          {alerts.map((alert) => (
            <Link key={alert.productId} href={`/admin/produtos/${alert.productId}`} className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:bg-paper">
              <span className="font-medium text-ink">{alert.name}</span>
              <span className="flex items-center gap-3 text-[12.5px]">
                <span className="text-ink/52">
                  {formatBRL(alert.basePrice)} <span className="text-ink/30">vs. piso</span> {formatBRL(alert.floor)}
                </span>
                <span className={`rounded-md px-2 py-0.5 font-semibold ${alert.status === "loss" ? "bg-destructive/10 text-destructive" : "bg-warn/10 text-warn"}`}>
                  {alert.status === "loss" ? "Prejuízo" : `Margem ${alert.marginPct.toFixed(1)}%`}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
