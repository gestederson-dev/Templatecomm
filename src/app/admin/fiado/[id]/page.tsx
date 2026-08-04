import { notFound } from "next/navigation";
import { StatusPill, type PillTone } from "@/components/admin/status-pill";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";
import { FiadoCustomerInfoForm } from "@/components/admin/fiado-customer-info-form";
import { FiadoChargeForm } from "@/components/admin/fiado-charge-form";
import { FiadoPaymentForm } from "@/components/admin/fiado-payment-form";
import { DeleteFiadoCustomerButton } from "@/components/admin/delete-fiado-customer-button";
import { adminCard } from "@/components/admin/ui-styles";
import { getFiadoCustomerById } from "@/lib/admin/fiado";
import { formatBRL } from "@/lib/format";
import { deleteFiadoChargeAction, deleteFiadoPaymentAction, toggleChargeDeliveredAction } from "@/app/admin/fiado/actions";

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

export default async function FiadoCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getFiadoCustomerById(id);

  if (!customer) notFound();

  const tone: PillTone = customer.balance <= 0 ? "ok" : "critical";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">{customer.name}</h1>
          <StatusPill tone={tone}>{customer.balance <= 0 ? "Quitado" : "Em aberto"}</StatusPill>
        </div>
        <DeleteFiadoCustomerButton customerId={customer.id} customerName={customer.name} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={adminCard}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Total</p>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-ink">{formatBRL(customer.totalCharged)}</p>
        </div>
        <div className={adminCard}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Pago</p>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-ok">{formatBRL(customer.totalPaid)}</p>
        </div>
        <div className={adminCard}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Pendente</p>
          <p className={`mt-1.5 font-[family-name:var(--font-display)] text-xl font-bold tabular-nums ${customer.balance > 0 ? "text-destructive" : "text-ink/52"}`}>
            {formatBRL(Math.max(customer.balance, 0))}
          </p>
        </div>
      </div>

      <FiadoCustomerInfoForm customer={customer} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={`${adminCard} flex flex-col gap-3.5`}>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Cobranças</h2>
          {customer.charges.length === 0 ? (
            <p className="text-sm text-ink/45">Nenhuma cobrança lançada.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {customer.charges.map((charge) => (
                <div key={charge.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{charge.description}</p>
                    <p className="text-[12px] text-ink/52">
                      {formatDate(charge.occurred_at)}
                      {charge.notes ? ` · ${charge.notes}` : ""}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-wine">{formatBRL(charge.amount)}</span>
                  <div className="flex items-center gap-1.5">
                    <ToggleActiveButton id={charge.id} isActive={charge.delivered} action={toggleChargeDeliveredAction} label="Entregue" />
                  </div>
                  <form action={deleteFiadoChargeAction}>
                    <input type="hidden" name="id" value={charge.id} />
                    <input type="hidden" name="customerId" value={customer.id} />
                    <button type="submit" aria-label="Remover cobrança" className="grid h-8 w-8 place-items-center rounded-lg text-ink/45 hover:bg-destructive/10 hover:text-destructive">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <FiadoChargeForm customerId={customer.id} />
        </div>

        <div className={`${adminCard} flex flex-col gap-3.5`}>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Pagamentos</h2>
          {customer.payments.length === 0 ? (
            <p className="text-sm text-ink/45">Nenhum pagamento registrado.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {customer.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-ink/52">
                      {formatDate(payment.paid_at)}
                      {payment.notes ? ` · ${payment.notes}` : ""}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-ok">{formatBRL(payment.amount)}</span>
                  <form action={deleteFiadoPaymentAction}>
                    <input type="hidden" name="id" value={payment.id} />
                    <input type="hidden" name="customerId" value={customer.id} />
                    <button type="submit" aria-label="Remover pagamento" className="grid h-8 w-8 place-items-center rounded-lg text-ink/45 hover:bg-destructive/10 hover:text-destructive">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <FiadoPaymentForm customerId={customer.id} />
        </div>
      </div>
    </div>
  );
}
