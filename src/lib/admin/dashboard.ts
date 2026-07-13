import { createClient } from "@/lib/supabase/server";

export type DashboardMetrics = {
  revenue: number;
  previousRevenue: number;
  orderCount: number;
  averageTicket: number;
  pendingQuotes: number;
  conversionRate: number;
  newCustomers: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; revenue: number }[];
  funnel: { stage: string; count: number }[];
};

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardMetrics(fromDate: Date, toDate: Date): Promise<DashboardMetrics> {
  const supabase = await createClient();

  const periodMs = toDate.getTime() - fromDate.getTime();
  const previousFrom = new Date(fromDate.getTime() - periodMs);
  const previousTo = new Date(fromDate.getTime());

  const fromISO = fromDate.toISOString();
  const toISO = toDate.toISOString();

  const [{ data: orders }, { data: previousOrders }, { count: pendingQuotes }, { data: allQuotes }, { count: newCustomersCount }, { data: orderItems }] = await Promise.all([
    supabase.from("orders").select("id, total, status, created_at").eq("status", "paid").gte("created_at", fromISO).lt("created_at", toISO),
    supabase.from("orders").select("total").eq("status", "paid").gte("created_at", previousFrom.toISOString()).lt("created_at", previousTo.toISOString()),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "requested"),
    supabase.from("quotes").select("status, created_at").gte("created_at", fromISO).lt("created_at", toISO),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer").gte("created_at", fromISO).lt("created_at", toISO),
    supabase
      .from("order_items")
      .select("product_name, total, orders!inner(status, created_at)")
      .eq("orders.status", "paid")
      .gte("orders.created_at", fromISO)
      .lt("orders.created_at", toISO),
  ]);

  const revenue = (orders ?? []).reduce((sum, o) => sum + o.total, 0);
  const previousRevenue = (previousOrders ?? []).reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders?.length ?? 0;
  const averageTicket = orderCount > 0 ? revenue / orderCount : 0;

  const quotesInPeriod = allQuotes ?? [];
  const convertedInPeriod = quotesInPeriod.filter((q) => q.status === "converted").length;
  const conversionRate = quotesInPeriod.length > 0 ? convertedInPeriod / quotesInPeriod.length : 0;

  const revenueByDayMap = new Map<string, number>();
  for (const order of orders ?? []) {
    const day = order.created_at.slice(0, 10);
    revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + order.total);
  }
  const revenueByDay = Array.from(revenueByDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));

  const { data: statusRows } = await supabase.from("orders").select("status").gte("created_at", fromISO).lt("created_at", toISO);
  const statusCounts = new Map<string, number>();
  for (const row of statusRows ?? []) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }
  const ordersByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));

  type OrderItemRow = { product_name: string; total: number };
  const productRevenue = new Map<string, number>();
  for (const item of (orderItems ?? []) as unknown as OrderItemRow[]) {
    productRevenue.set(item.product_name, (productRevenue.get(item.product_name) ?? 0) + item.total);
  }
  const topProducts = Array.from(productRevenue.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const reachedQuoted = quotesInPeriod.filter((q) => q.status !== "requested").length;
  const reachedApproved = quotesInPeriod.filter((q) => q.status === "approved" || q.status === "converted").length;
  const funnel = [
    { stage: "Solicitados", count: quotesInPeriod.length },
    { stage: "Cotados", count: reachedQuoted },
    { stage: "Aprovados", count: reachedApproved },
    { stage: "Convertidos", count: convertedInPeriod },
  ];

  return {
    revenue,
    previousRevenue,
    orderCount,
    averageTicket,
    pendingQuotes: pendingQuotes ?? 0,
    conversionRate,
    newCustomers: newCustomersCount ?? 0,
    revenueByDay,
    ordersByStatus,
    topProducts,
    funnel,
  };
}

export function periodFromDays(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}

export { toISODate };
