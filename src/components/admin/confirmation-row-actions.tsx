"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { cancelConfirmationAction } from "@/app/admin/confirmacoes/actions";
import { adminBtnSoft, adminBtnWine, adminInput } from "@/components/admin/ui-styles";

export function ConfirmationLinkBox({ id, url }: { id: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [canceling, startCancel] = useTransition();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[12.5px] font-semibold text-ink">Link para enviar ao cliente</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input readOnly value={url} onFocus={(event) => event.target.select()} className={`${adminInput} font-mono text-[12.5px]`} />
        <button type="button" onClick={copy} className={`${adminBtnWine} shrink-0`}>
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={url} target="_blank" rel="noopener" className={`${adminBtnSoft} px-3.5 py-2 text-[13px]`}>
          Ver como o cliente vê
        </a>
        <Link href={`/admin/confirmacoes/${id}/editar`} className={`${adminBtnSoft} px-3.5 py-2 text-[13px]`}>
          Editar
        </Link>
        <button
          type="button"
          disabled={canceling}
          onClick={() => {
            if (!window.confirm("Cancelar esta confirmação? O link deixa de funcionar para o cliente.")) return;
            startCancel(() => cancelConfirmationAction(id));
          }}
          className={`${adminBtnSoft} px-3.5 py-2 text-[13px] hover:border-destructive hover:text-destructive`}
        >
          {canceling ? "Cancelando…" : "Cancelar"}
        </button>
      </div>
    </div>
  );
}
