import type { OrderStatus } from "@/lib/types";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Aguardando pagamento" },
  { key: "paid", label: "Pago" },
  { key: "processing", label: "Em preparação" },
  { key: "shipped", label: "Enviado" },
  { key: "delivered", label: "Entregue" },
];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "canceled") {
    return <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">Este pedido foi cancelado.</div>;
  }

  const currentIndex = Math.max(
    STEPS.findIndex((step) => step.key === status),
    0,
  );

  return (
    <ol>
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isDone ? "bg-wine text-white" : isCurrent ? "bg-wine text-white ring-4 ring-wine-tint" : "bg-ink/10 text-ink/40"
                }`}
              >
                {isDone ? "✓" : ""}
              </div>
              {!isLast ? <div className={`w-0.5 flex-1 ${isDone ? "bg-wine" : "bg-ink/10"}`} style={{ minHeight: 22 }} /> : null}
            </div>
            <div className={`pb-5 text-sm ${isCurrent ? "font-semibold text-ink" : isDone ? "text-ink/70" : "text-ink/40"}`}>{step.label}</div>
          </li>
        );
      })}
    </ol>
  );
}
