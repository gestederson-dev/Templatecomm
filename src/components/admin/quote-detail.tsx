"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminBtnAmber, adminBtnSoft, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { adminConvertToOrderAction, adminRejectQuoteAction, sendQuoteAction, updateQuoteItemPriceAction, type ActionState } from "@/app/admin/orcamentos/actions";
import { formatBRL } from "@/lib/format";
import { CategoryIcon } from "@/components/store/category-icon";
import type { QuoteItem, QuoteStatus } from "@/lib/types";

function ItemPriceRow({ item, quoteId }: { item: QuoteItem; quoteId: string }) {
  const [value, setValue] = useState(item.unit_price != null ? String(item.unit_price) : "");
  const [, startTransition] = useTransition();
  const subtotal = item.unit_price != null ? item.unit_price * item.quantity : null;

  return (
    <div className="mb-3 rounded-xl border border-line p-3.5">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px]" style={{ background: "linear-gradient(150deg,#fff2dc,#ffe1b0)" }}>
          <CategoryIcon slug="" className="h-[26px] w-[26px] stroke-wine" />
        </div>
        <div className="flex-1">
          <span className="text-[13.5px] font-semibold">{item.product_name}</span>
          <small className="block text-xs text-ink/52">{item.quantity} unidades</small>
          {item.customization ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {Object.entries(item.customization).map(([key, val]) => (
                <span key={key} className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/60">
                  {key}: {val}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-[90px_1fr_130px] items-center gap-3 border-t border-line pt-3">
        <div className="text-[13px]">
          {item.quantity} un
          <small className="block text-ink/52">quantidade</small>
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => {
            const price = Number(value);
            if (price > 0) startTransition(() => updateQuoteItemPriceAction(item.id, quoteId, price));
          }}
          placeholder="Preço unitário — R$"
          className={adminInput}
        />
        <div className="text-right font-[family-name:var(--font-display)] text-[15px] font-semibold text-wine">{subtotal != null ? formatBRL(subtotal) : "R$ —"}</div>
      </div>
    </div>
  );
}

const TIMELINE_STAGES = ["Solicitado", "Cotação enviada", "Aprovação do cliente", "Convertido em pedido"] as const;

function timelineState(status: QuoteStatus, index: number): "done" | "now" | "wait" {
  const order: Record<QuoteStatus, number> = { requested: 0, quoted: 1, approved: 2, rejected: 2, expired: 2, converted: 3 };
  const current = order[status];
  if (index < current) return "done";
  if (index === current) return status === "rejected" || status === "expired" ? "wait" : "now";
  return "wait";
}

export function QuoteDetail({
  quoteId,
  status,
  items,
  adminResponse,
  validUntil,
  createdAt,
  clientInfo,
}: {
  quoteId: string;
  status: QuoteStatus;
  items: QuoteItem[];
  adminResponse: string | null;
  validUntil: string | null;
  createdAt: string;
  clientInfo?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(sendQuoteAction, undefined);
  const router = useRouter();
  const [converting, startConvert] = useTransition();
  const [rejecting, startReject] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.unit_price != null ? item.unit_price * item.quantity : 0), 0);
  const canRespond = status === "requested" || status === "quoted";

  async function handleConvert() {
    setActionError(null);
    startConvert(async () => {
      const result = await adminConvertToOrderAction(quoteId);
      if ("error" in result) setActionError(result.error);
      else router.push("/admin/pedidos");
    });
  }

  async function handleReject() {
    setActionError(null);
    startReject(async () => {
      const result = await adminRejectQuoteAction(quoteId);
      if ("error" in result) setActionError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="grid items-start gap-[18px] lg:grid-cols-[1fr_320px]">
      <div>
        {canRespond ? (
          <div className="mb-[18px] flex justify-end gap-3">
            <button type="button" onClick={handleReject} disabled={rejecting} className={adminBtnSoft}>
              {rejecting ? "Recusando..." : "Recusar"}
            </button>
          </div>
        ) : null}

        <div className={`${adminCard} mb-[18px]`}>
          <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Itens para cotar</h3>
          {items.map((item) => (
            <ItemPriceRow key={item.id} item={item} quoteId={quoteId} />
          ))}

          <div className="flex items-center justify-between px-1 pt-3 text-sm">
            <span className="text-ink/52">Subtotal</span>
            <span className="font-[family-name:var(--font-display)] font-semibold">{formatBRL(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between px-1 pt-2 text-sm">
            <span className="text-ink/52">Frete estimado</span>
            <span className="font-[family-name:var(--font-display)] font-semibold">A combinar</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t-2 border-ink px-1 pt-3.5">
            <span className="font-semibold">Total do orçamento</span>
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-wine">{formatBRL(subtotal)}</span>
          </div>
        </div>

        {canRespond ? (
          <form action={formAction} className={adminCard}>
            <input type="hidden" name="quoteId" value={quoteId} />
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Resposta ao cliente</h3>
            <div className="mb-3.5">
              <textarea
                name="adminResponse"
                defaultValue={adminResponse ?? ""}
                rows={3}
                placeholder="Condições, prazo de produção, forma de pagamento…"
                className={adminInput}
              />
            </div>
            <div className="max-w-[220px]">
              <label className={adminLabel}>Validade da proposta</label>
              <input type="date" name="validUntil" defaultValue={validUntil ?? ""} className={adminInput} />
            </div>
            {state?.error ? <p className="mt-3 text-sm text-destructive">{state.error}</p> : null}
            {actionError ? <p className="mt-3 text-sm text-destructive">{actionError}</p> : null}
            <button type="submit" disabled={pending} className={`${adminBtnAmber} mt-4`}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[17px] w-[17px] stroke-current">
                <path d="M4 4h16v12H8l-4 4z" />
              </svg>
              {pending ? "Enviando..." : "Enviar cotação"}
            </button>
          </form>
        ) : adminResponse ? (
          <div className={adminCard}>
            <h3 className="mb-2 font-[family-name:var(--font-display)] text-[15px] font-semibold">Resposta enviada</h3>
            <p className="text-sm text-ink/70">{adminResponse}</p>
          </div>
        ) : null}
      </div>

      <div>
        {clientInfo}

        <div className={`${adminCard} mb-[18px]`}>
          <h3 className="mb-3.5 font-[family-name:var(--font-display)] text-[15px] font-semibold">Andamento</h3>
          <div className="relative flex flex-col gap-4 pl-[22px]">
            <span className="absolute bottom-3.5 left-[3.5px] top-1 w-px bg-line" aria-hidden="true" />
            {TIMELINE_STAGES.map((label, index) => {
              const st = timelineState(status, index);
              return (
                <div key={label} className="relative text-[13px]">
                  <span
                    className={`absolute -left-[22px] top-0.5 h-[11px] w-[11px] rounded-full border-2 border-white ring-1 ring-line ${
                      st === "done" ? "bg-ok" : st === "now" ? "bg-amber" : "bg-white"
                    }`}
                    aria-hidden="true"
                  />
                  <b className="font-semibold">{label}</b>
                  <small className="block text-[11.5px] text-ink/52">{index === 0 ? new Date(createdAt).toLocaleString("pt-BR") : st === "wait" ? "—" : st === "now" ? "Pendente" : "Concluído"}</small>
                </div>
              );
            })}
          </div>
        </div>

        {status === "quoted" ? (
          <div className={`${adminCard} bg-wine-tint`} style={{ borderColor: "rgba(134,5,49,.14)" }}>
            <h3 className="mb-2 font-[family-name:var(--font-display)] text-[15px] font-semibold">Quando aprovado</h3>
            <p className="mb-3.5 text-[13px] text-ink/60">O cliente já pode aprovar direto em &quot;Meus orçamentos&quot;. Use este botão só se precisar converter manualmente.</p>
            <button type="button" onClick={handleConvert} disabled={converting} className={`${adminBtnAmber} w-full`}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[17px] w-[17px] stroke-current">
                <path d="M5 12l5 5L20 7" />
              </svg>
              {converting ? "Convertendo..." : "Converter em pedido"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
