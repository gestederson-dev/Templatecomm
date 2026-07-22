import { createClient } from "@/lib/supabase/server";

export type DashboardMetrics = {
  revenue: number;
  previousRevenue: number;
  siteRevenue: number;
  manualRevenue: number;
  orderCount: number;
  averageTicket: number;
  pendingQuotes: number;
  conversionRate: number;
  newCustomers: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; quantity: number }[];
  funnel: { stage: string; count: number }[];
  recentOrders: { id: string; orderNumber: string; customerName: string; origin: string; total: number; status: string; createdAt: string }[];
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

  const [{ data: orders }, { data: previousOrders }, { count: pendingQuotes }, { data: allQuotes }, { count: newCustomersCount }, { data: orderItems }, { data: recentOrdersRaw }] =
    await Promise.all([
      supabase.from("orders").select("id, total, status, origin, created_at").eq("status", "paid").gte("created_at", fromISO).lt("created_at", toISO),
      supabase.from("orders").select("total").eq("status", "paid").gte("created_at", previousFrom.toISOString()).lt("created_at", previousTo.toISOString()),
      supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "requested"),
      supabase.from("quotes").select("status, created_at").gte("created_at", fromISO).lt("created_at", toISO),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer").gte("created_at", fromISO).lt("created_at", toISO),
      supabase
        .from("order_items")
        .select("product_name, quantity, orders!inner(status, created_at)")
        .eq("orders.status", "paid")
        .gte("orders.created_at", fromISO)
        .lt("orders.created_at", toISO),
      supabase
        .from("orders")
        .select("id, order_number, total, status, origin, created_at, customer_name, profile:profiles(full_name, company_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const revenue = (orders ?? []).reduce((sum, o) => sum + o.total, 0);
  const previousRevenue = (previousOrders ?? []).reduce((sum, o) => sum + o.total, 0);
  const manualRevenue = (orders ?? []).filter((o) => o.origin === "manual").reduce((sum, o) => sum + o.total, 0);
  const siteRevenue = revenue - manualRevenue;
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

  type OrderItemRow = { product_name: string; quantity: number };
  const productQuantity = new Map<string, number>();
  for (const item of (orderItems ?? []) as unknown as OrderItemRow[]) {
    productQuantity.set(item.product_name, (productQuantity.get(item.product_name) ?? 0) + item.quantity);
  }
  const topProducts = Array.from(productQuantity.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  type RecentOrderRow = {
    id: string;
    order_number: string | null;
    total: number;
    status: string;
    origin: string;
    created_at: string;
    customer_name: string | null;
    profile: { full_name: string | null; company_name: string | null } | null;
  };
  const recentOrders = ((recentOrdersRaw ?? []) as unknown as RecentOrderRow[]).map((o) => ({
    id: o.id,
    orderNumber: o.order_number ?? "—",
    customerName: o.profile?.company_name || o.profile?.full_name || o.customer_name || "—",
    origin: o.origin,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
  }));

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
    siteRevenue,
    manualRevenue,
    orderCount,
    averageTicket,
    pendingQuotes: pendingQuotes ?? 0,
    conversionRate,
    newCustomers: newCustomersCount ?? 0,
    revenueByDay,
    ordersByStatus,
    topProducts,
    funnel,
    recentOrders,
  };
}

export function periodFromDays(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}

export { toISODate };
