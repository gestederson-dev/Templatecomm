"use client";

import { useActionState, useTransition } from "react";
import { addCustomizationOptionAction, deleteCustomizationOptionAction, toggleCustomizationRequiredAction, type ActionState } from "@/app/admin/produtos/actions";
import { adminCard, adminInput } from "@/components/admin/ui-styles";
import type { ProductCustomizationOption } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  text: "Texto",
  select: "Seleção",
  color: "Cor",
  logo_upload: "Upload",
};

function RequiredToggle({ option, productId }: { option: ProductCustomizationOption; productId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={option.required}
      aria-label="Obrigatório"
      disabled={pending}
      onClick={() => startTransition(() => toggleCustomizationRequiredAction(option.id, productId, !option.required))}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${option.required ? "bg-ok" : "bg-ink/18"}`}
    >
      <span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-transform ${option.required ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

export function ProductCustomization({ productId, options }: { productId: string; options: ProductCustomizationOption[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addCustomizationOptionAction, undefined);
  const [deleting, startDelete] = useTransition();

  return (
    <div className={adminCard}>
      <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Opções de personalização</h3>

      {options.length > 0 ? (
        <div className="mb-3 flex flex-col gap-2.5">
          {options.map((option) => (
            <div key={option.id} className="grid grid-cols-[1fr_auto_auto_32px] items-center gap-2.5 rounded-[10px] border border-line p-3">
              <div>
                <span className="text-[13.5px] font-semibold">{option.name}</span>
                <small className="block text-[11.5px] font-normal text-ink/52">{option.options ? option.options.join(", ") : "obrigatório opcional"}</small>
              </div>
              <span className="rounded-md bg-wine-tint px-2 py-1 text-[11px] font-semibold text-wine">{TYPE_LABEL[option.type] ?? option.type}</span>
              <RequiredToggle option={option} productId={productId} />
              <button
                type="button"
                disabled={deleting}
                aria-label="Remover opção"
                onClick={() => startDelete(() => deleteCustomizationOptionAction(option.id, productId))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink/52 hover:border-wine hover:text-wine"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <form action={formAction} className="flex flex-wrap items-end gap-2.5">
        <input type="hidden" name="productId" value={productId} />
        <div style={{ width: 160 }}>
          <label className="mb-1 block text-[11px] text-ink/52">Nome</label>
          <input name="name" placeholder="Cor, Gravação..." required className={adminInput} />
        </div>
        <div style={{ width: 128 }}>
          <label className="mb-1 block text-[11px] text-ink/52">Tipo</label>
          <select name="type" defaultValue="text" className={adminInput}>
            <option value="text">Texto</option>
            <option value="select">Lista</option>
            <option value="color">Cor</option>
            <option value="logo_upload">Upload de logo</option>
          </select>
        </div>
        <div style={{ width: 208 }}>
          <label className="mb-1 block text-[11px] text-ink/52">Valores (vírgula)</label>
          <input name="options" placeholder="Azul, Vermelho, Preto" className={adminInput} />
        </div>
        <label className="mb-2.5 flex items-center gap-1.5 text-[13px]">
          <input type="checkbox" name="required" className="h-4 w-4 rounded border-line" />
          Obrigatório
        </label>
        <button type="submit" disabled={pending} className="mb-0.5 inline-flex items-center gap-1.5 rounded-[10px] border border-line px-3.5 py-2.5 text-[13px] font-semibold text-wine hover:border-wine">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[15px] w-[15px] stroke-current">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {pending ? "Adicionando..." : "Adicionar opção"}
        </button>
      </form>
      {state?.error ? <p className="mt-2 text-sm text-destructive">{state.error}</p> : null}
    </div>
  );
}
