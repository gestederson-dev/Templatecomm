import { createClient } from "@/lib/supabase/server";

export type DashboardMetrics = {
  revenue: number;
  previousRevenue: number;
  siteRevenue: number;
  manualRevenue: number;
  /** pagamentos de fiado recebidos no período (contam no dia em que foram pagos) */
  fiadoRevenue: number;
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

/** Pedido conta no faturamento a partir de pago: preparar, enviar e entregar não tiram ele da conta. */
export const REVENUE_STATUSES = ["paid", "processing", "shipped", "delivered"];

type FiadoPaymentRow = { amount: number; paid_at: string };

/** Soma pedidos e pagamentos de fiado por dia (fiado entra na data em que foi pago). */
export function mergeRevenueByDay(orders: { total: number; created_at: string }[], fiado: FiadoPaymentRow[]): { date: string; revenue: number }[] {
  const byDay = new Map<string, number>();
  for (const order of orders) byDay.set(order.created_at.slice(0, 10), (byDay.get(order.created_at.slice(0, 10)) ?? 0) + Number(order.total));
  for (const payment of fiado) byDay.set(payment.paid_at.slice(0, 10), (byDay.get(payment.paid_at.slice(0, 10)) ?? 0) + Number(payment.amount));
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));
}

export async function getDashboardMetrics(fromDate: Date, toDate: Date): Promise<DashboardMetrics> {
  const supabase = await createClient();

  const periodMs = toDate.getTime() - fromDate.getTime();
  const previousFrom = new Date(fromDate.getTime() - periodMs);
  const previousTo = new Date(fromDate.getTime());

  const fromISO = fromDate.toISOString();
  const toISO = toDate.toISOString();

  const [
    { data: orders },
    { data: previousOrders },
    { count: pendingQuotes },
    { data: allQuotes },
    { count: newCustomersCount },
    { data: orderItems },
    { data: recentOrdersRaw },
    { data: fiadoPayments },
    { data: previousFiadoPayments },
  ] = await Promise.all([
    supabase.from("orders").select("id, total, status, origin, created_at").in("status", REVENUE_STATUSES).gte("created_at", fromISO).lt("created_at", toISO),
    supabase
      .from("orders")
      .select("total")
      .in("status", REVENUE_STATUSES)
      .gte("created_at", previousFrom.toISOString())
      .lt("created_at", previousTo.toISOString()),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "requested"),
    supabase.from("quotes").select("status, created_at").gte("created_at", fromISO).lt("created_at", toISO),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer").gte("created_at", fromISO).lt("created_at", toISO),
    supabase
      .from("order_items")
      .select("product_name, quantity, orders!inner(status, created_at)")
      .in("orders.status", REVENUE_STATUSES)
      .gte("orders.created_at", fromISO)
      .lt("orders.created_at", toISO),
    supabase
      .from("orders")
      .select("id, order_number, total, status, origin, created_at, customer_name, profile:profiles(full_name, company_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("fiado_payments").select("amount, paid_at").gte("paid_at", toISODate(fromDate)).lte("paid_at", toISODate(toDate)),
    supabase.from("fiado_payments").select("amount, paid_at").gte("paid_at", toISODate(previousFrom)).lt("paid_at", toISODate(previousTo)),
  ]);

  const sum = (rows: { total?: number; amount?: number }[] | null) => (rows ?? []).reduce((acc, row) => acc + Number(row.total ?? row.amount ?? 0), 0);
  const ordersRevenue = sum(orders);
  const fiadoRevenue = sum(fiadoPayments);
  const revenue = ordersRevenue + fiadoRevenue;
  const previousRevenue = sum(previousOrders) + sum(previousFiadoPayments);
  const manualRevenue = sum((orders ?? []).filter((o) => o.origin === "manual"));
  const siteRevenue = ordersRevenue - manualRevenue;
  const orderCount = orders?.length ?? 0;
  const averageTicket = orderCount > 0 ? ordersRevenue / orderCount : 0;

  const quotesInPeriod = allQuotes ?? [];
  const convertedInPeriod = quotesInPeriod.filter((q) => q.status === "converted").length;
  const conversionRate = quotesInPeriod.length > 0 ? convertedInPeriod / quotesInPeriod.length : 0;

  const revenueByDay = mergeRevenueByDay(orders ?? [], (fiadoPayments ?? []) as FiadoPaymentRow[]);

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
    fiadoRevenue,
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
