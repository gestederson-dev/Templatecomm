"use client";

import { useActionState } from "react";
import Link from "next/link";
import { btnWine } from "@/components/store/button-styles";
import { storeCard, storeInput, storeLabel, storeSectionTitle } from "@/components/store/ui-styles";
import { signInAction } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, undefined);

  return (
    <div className={`${storeCard} flex flex-col gap-5`}>
      <h1 className={storeSectionTitle}>Entrar</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className={storeLabel}>
            E-mail
          </label>
          <input id="email" name="email" type="email" required autoFocus className={`${storeInput} w-full`} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className={storeLabel.replace("mb-1.5 ", "")}>
              Senha
            </label>
            <Link href="/esqueci-senha" className="text-xs font-semibold text-wine hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <input id="password" name="password" type="password" required className={`${storeInput} w-full`} />
        </div>

        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <button type="submit" disabled={pending} className={`${btnWine} w-full disabled:pointer-events-none disabled:opacity-50`}>
          {pending ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-ink/62">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-wine hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
