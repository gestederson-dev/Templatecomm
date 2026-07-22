"use client";

import { useActionState } from "react";
import { adminSignInAction } from "@/app/admin/login/actions";
import { btnWine } from "@/components/store/button-styles";
import { storeInput, storeLabel } from "@/components/store/ui-styles";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminSignInAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className={storeLabel}>
          E-mail
        </label>
        <input id="email" name="email" type="email" required autoFocus className={`${storeInput} w-full`} />
      </div>

      <div>
        <label htmlFor="password" className={storeLabel}>
          Senha
        </label>
        <input id="password" name="password" type="password" required className={`${storeInput} w-full`} />
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button type="submit" disabled={pending} className={`${btnWine} w-full disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
