"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/app/(store)/conta/actions";
import { btnWine } from "@/components/store/button-styles";
import { storeInput, storeLabel } from "@/components/store/ui-styles";

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateProfileAction, undefined);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="fullName" className={storeLabel}>
          Nome
        </label>
        <input id="fullName" name="fullName" defaultValue={fullName} required className={storeInput} />
      </div>

      <div>
        <label htmlFor="phone" className={storeLabel}>
          Telefone / WhatsApp
        </label>
        <input id="phone" name="phone" defaultValue={phone} placeholder="(00) 00000-0000" className={storeInput} />
      </div>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? <p className="text-sm font-medium text-ok">Dados atualizados.</p> : null}

      <button type="submit" disabled={pending} className={`${btnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
