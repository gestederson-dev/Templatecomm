"use client";

import { useActionState } from "react";
import Link from "next/link";
import { btnWine } from "@/components/store/button-styles";
import { storeCard, storeInput, storeLabel, storeSectionTitle } from "@/components/store/ui-styles";
import { forgotPasswordAction } from "../actions";

export default function EsqueciSenhaPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined);

  if (state && "success" in state) {
    return (
      <div className={`${storeCard} flex flex-col gap-3 text-center`}>
        <h1 className={storeSectionTitle}>Verifique seu e-mail</h1>
        <p className="text-sm text-ink/62">Se esse e-mail estiver cadastrado, você vai receber um link para redefinir sua senha.</p>
        <Link href="/login" className="text-sm font-semibold text-wine hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className={`${storeCard} flex flex-col gap-5`}>
      <div>
        <h1 className={storeSectionTitle}>Esqueceu a senha?</h1>
        <p className="mt-1 text-sm text-ink/62">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className={storeLabel}>
            E-mail
          </label>
          <input id="email" name="email" type="email" required autoFocus className={`${storeInput} w-full`} />
        </div>

        {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <button type="submit" disabled={pending} className={`${btnWine} w-full disabled:pointer-events-none disabled:opacity-50`}>
          {pending ? "Enviando..." : "Enviar link"}
        </button>

        <p className="text-center text-sm text-ink/62">
          <Link href="/login" className="font-semibold text-wine hover:underline">
            Voltar para o login
          </Link>
        </p>
      </form>
    </div>
  );
}
