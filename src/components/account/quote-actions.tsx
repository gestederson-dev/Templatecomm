"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
      <div className="flex gap-2">
        <Button onClick={handleApprove} disabled={pending != null}>
          {pending === "approve" ? "Aprovando..." : "Aprovar orçamento"}
        </Button>
        <Button onClick={handleReject} variant="outline" disabled={pending != null}>
          {pending === "reject" ? "Rejeitando..." : "Rejeitar"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
