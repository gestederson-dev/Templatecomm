"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnOutline, btnWine } from "@/components/store/button-styles";
import { approveQuoteAction, rejectQuoteAction } from "@/lib/quote-actions";

export function QuoteActions({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setPending("approve");
    setError(null);
    const result = await approveQuoteAction(quoteId);
    setPending(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/pedido/${result.orderNumber}`);
  }

  async function handleReject() {
    setPending("reject");
    setError(null);
    const result = await rejectQuoteAction(quoteId);
    setPending(null);
    if ("error" in result) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2.5">
        <button type="button" onClick={handleApprove} disabled={pending != null} className={`${btnWine} disabled:pointer-events-none disabled:opacity-50`}>
          {pending === "approve" ? "Aprovando..." : "Aprovar orçamento"}
        </button>
        <button type="button" onClick={handleReject} disabled={pending != null} className={`${btnOutline} disabled:pointer-events-none disabled:opacity-50`}>
          {pending === "reject" ? "Rejeitando..." : "Rejeitar"}
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
