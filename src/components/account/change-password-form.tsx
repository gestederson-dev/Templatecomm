"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "@/app/(store)/conta/actions";
import { btnWine } from "@/components/store/button-styles";
import { storeInput, storeLabel } from "@/components/store/ui-styles";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(changePasswordAction, undefined);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="password" className={storeLabel}>
          Nova senha
        </label>
        <input id="password" name="password" type="password" required minLength={8} className={`${storeInput} w-full`} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={storeLabel}>
          Confirme a nova senha
        </label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className={`${storeInput} w-full`} />
      </div>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? <p className="text-sm font-medium text-ok">Senha atualizada.</p> : null}

      <button type="submit" disabled={pending} className={`${btnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
