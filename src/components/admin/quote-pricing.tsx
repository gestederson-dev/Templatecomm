"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminConvertToOrderAction, sendQuoteAction, updateQuoteItemPriceAction, type ActionState } from "@/app/admin/orcamentos/actions";
import { formatBRL } from "@/lib/format";
import type { QuoteItem, QuoteStatus } from "@/lib/types";

function ItemPriceRow({ item, quoteId }: { item: QuoteItem; quoteId: string }) {
  const [value, setValue] = useState(item.unit_price != null ? String(item.unit_price) : "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 p-4 text-sm">
      <div>
        <p>
          {item.product_name} <span className="text-muted-foreground">× {item.quantity}</span>
        </p>
        {item.customization ? (
          <p className="text-xs text-muted-foreground">
            {Object.entries(item.customization)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ")}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => {
            const price = Number(value);
            if (price > 0) startTransition(() => updateQuoteItemPriceAction(item.id, quoteId, price));
          }}
          className="w-28"
          placeholder="Preço unit."
        />
        {item.unit_price != null ? <span className="w-24 text-right tabular-nums text-muted-foreground">{formatBRL(item.unit_price * item.quantity)}</span> : null}
      </div>
    </div>
  );
}

export function QuotePricing({ quoteId, status, items, adminResponse, validUntil }: { quoteId: string; status: QuoteStatus; items: QuoteItem[]; adminResponse: string | null; validUntil: string | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(sendQuoteAction, undefined);
  const router = useRouter();
  const [converting, startConvert] = useTransition();
  const [convertError, setConvertError] = useState<string | null>(null);

  async function handleConvert() {
    setConvertError(null);
    startConvert(async () => {
      const result = await adminConvertToOrderAction(quoteId);
      if ("error" in result) setConvertError(result.error);
      else router.push(`/admin/pedidos`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y rounded-lg border">
        {items.map((item) => (
          <ItemPriceRow key={item.id} item={item} quoteId={quoteId} />
        ))}
      </div>

      {status === "requested" || status === "quoted" ? (
        <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
          <input type="hidden" name="quoteId" value={quoteId} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Resposta ao cliente</label>
            <Textarea name="adminResponse" defaultValue={adminResponse ?? ""} rows={3} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Válido até</label>
            <Input type="date" name="validUntil" defaultValue={validUntil ?? ""} className="w-40" />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Enviando..." : "Enviar cotação"}
          </Button>
        </form>
      ) : null}

      {status === "quoted" ? (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
          <p className="text-sm text-muted-foreground">
            O cliente já pode aprovar direto em &quot;Meus orçamentos&quot;. Use isto só se precisar converter em pedido manualmente.
          </p>
          <Button type="button" variant="outline" className="w-fit" onClick={handleConvert} disabled={converting}>
            {converting ? "Convertendo..." : "Converter em pedido"}
          </Button>
          {convertError ? <p className="text-sm text-destructive">{convertError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
