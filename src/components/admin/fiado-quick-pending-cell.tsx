"use client";

import { useState, useTransition } from "react";
import { adjustFiadoPendingAction } from "@/app/admin/fiado/actions";
import { adminInput } from "@/components/admin/ui-styles";
import { formatBRL } from "@/lib/format";

export function FiadoQuickPendingCell({ customerId, pending }: { customerId: string; pending: number }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(() => pending.toFixed(2));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`font-semibold tabular-nums ${pending > 0 ? "text-destructive" : "text-ink/52"}`}>{formatBRL(Math.max(pending, 0))}</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setAmount(pending.toFixed(2));
            setEditing(true);
          }}
          aria-label="Editar valor pendente"
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-ink/35 transition-colors hover:bg-wine-tint hover:text-wine"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
    );
  }

  function submit() {
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) {
      setError("Valor inválido.");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.set("customerId", customerId);
    formData.set("newPending", String(value));

    startTransition(async () => {
      const result = await adjustFiadoPendingAction(undefined, formData);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      setEditing(false);
    });
  }

  return (
    <div className="flex flex-col gap-1" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          step="0.01"
          autoFocus
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
            if (event.key === "Escape") {
              setEditing(false);
              setError(null);
            }
          }}
          className={`${adminInput} h-8 w-[90px] px-2 py-1 text-sm`}
        />
        <button type="button" disabled={isPending} onClick={submit} aria-label="Confirmar novo pendente" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ok text-white disabled:opacity-50">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} className="h-3.5 w-3.5 stroke-current">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
          aria-label="Cancelar"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink/45 hover:bg-destructive/10 hover:text-destructive"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {error ? <span className="text-[11px] text-destructive">{error}</span> : null}
    </div>
  );
}
