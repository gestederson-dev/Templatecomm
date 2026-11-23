import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const { mergeRevenueByDay, REVENUE_STATUSES } = await import("./dashboard");

describe("faturamento", () => {
  it("pedido enviado ou entregue continua contando", () => {
    expect(REVENUE_STATUSES).toEqual(expect.arrayContaining(["paid", "processing", "shipped", "delivered"]));
    expect(REVENUE_STATUSES).not.toContain("pending");
    expect(REVENUE_STATUSES).not.toContain("canceled");
  });

  it("pagamento de fiado entra no dia em que foi pago", () => {
    const byDay = mergeRevenueByDay(
      [
        { total: 100, created_at: "2026-11-02T15:00:00Z" },
        { total: 50.5, created_at: "2026-11-10T12:00:00Z" },
      ],
      [
        { amount: 30, paid_at: "2026-11-10" },
        { amount: 20, paid_at: "2026-11-15" },
      ],
    );
    expect(byDay).toEqual([
      { date: "2026-11-02", revenue: 100 },
      { date: "2026-11-10", revenue: 80.5 },
      { date: "2026-11-15", revenue: 20 },
    ]);
  });
});
