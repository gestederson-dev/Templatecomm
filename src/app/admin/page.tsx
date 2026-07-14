import Link from "next/link";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { PeriodFilter } from "@/components/admin/dashboard/period-filter";
import { RevenueAreaChart } from "@/components/admin/dashboard/revenue-area-chart";
import { StatusDonut } from "@/components/admin/dashboard/status-donut";
import { TopProductsChart } from "@/components/admin/dashboard/top-products-chart";
import { QuoteFunnel } from "@/components/admin/dashboard/quote-funnel";
import { RecentOrdersTable } from "@/components/admin/dashboard/recent-orders-table";
import { adminCard } from "@/components/admin/ui-styles";
import { getDashboardMetrics, periodFromDays, toISODate } from "@/lib/admin/dashboard";
import { formatBRL } from "@/lib/format";

type SearchParams = { period?: string; from?: string; to?: string };

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { period = "30", from: fromParam, to: toParam } = await searchParams;

  let from: Date;
  let to: Date;

  if (period === "custom" && fromParam && toParam) {
    from = new Date(`${fromParam}T00:00:00`);
    to = new Date(`${toParam}T23:59:59`);
  } else {
    const days = Number(period) || 30;
    ({ from, to } = periodFromDays(days));
  }

  const metrics = await getDashboardMetrics(from, to);
  const revenueDelta = metrics.previousRevenue > 0 ? ((metrics.revenue - metrics.previousRevenue) / metrics.previousRevenue) * 100 : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Dashboard</h1>
        <PeriodFilter period={period} from={fromParam ?? toISODate(from)} to={toParam ?? toISODate(to)} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Faturamento" value={formatBRL(metrics.revenue)} delta={revenueDelta != null ? `${revenueDelta >= 0 ? "+" : ""}${revenueDelta.toFixed(1)}% vs período anterior` : undefined} />
        <StatCard label="Pedidos" value={String(metrics.orderCount)} />
        <StatCard label="Ticket médio" value={formatBRL(metrics.averageTicket)} />
        <StatCard label="Orçamentos pendentes" value={String(metrics.pendingQuotes)} highlight={metrics.pendingQuotes > 0} />
        <StatCard label="Conversão orçamento→venda" value={`${(metrics.conversionRate * 100).toFixed(0)}%`} />
        <StatCard label="Novos clientes" value={String(metrics.newCustomers)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className={adminCard}>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Faturamento no período</h2>
              <p className="mt-0.5 text-[12.5px] text-ink/52">Receita diária</p>
            </div>
            <div className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.02em] text-wine">{formatBRL(metrics.revenue)}</div>
          </div>
          <RevenueAreaChart data={metrics.revenueByDay} />
        </div>
        <div className={adminCard}>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Pedidos por status</h2>
          <p className="mb-4 mt-0.5 text-[12.5px] text-ink/52">Distribuição atual</p>
          <StatusDonut data={metrics.ordersByStatus} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className={adminCard}>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Funil de orçamentos</h2>
          <p className="mb-4 mt-0.5 text-[12.5px] text-ink/52">Do pedido de cotação à venda</p>
          <QuoteFunnel data={metrics.funnel} />
        </div>
        <div className={adminCard}>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Produtos mais vendidos</h2>
          <p className="mb-4 mt-0.5 text-[12.5px] text-ink/52">Por unidades — no período</p>
          <TopProductsChart data={metrics.topProducts} />
        </div>
      </div>

      <div className={adminCard}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Últimos pedidos</h2>
            <p className="mt-0.5 text-[12.5px] text-ink/52">Atividade recente</p>
          </div>
          <Link href="/admin/pedidos" className="text-[13.5px] font-semibold text-wine hover:underline">
            Ver todos →
          </Link>
        </div>
        <RecentOrdersTable orders={metrics.recentOrders} />
      </div>
    </div>
  );
}
