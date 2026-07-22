"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { btnWine } from "@/components/store/button-styles";
import { storeCard, storeInput, storeLabel, storeSectionTitle } from "@/components/store/ui-styles";
import { resetPasswordAction } from "../actions";

export default function RedefinirSenhaPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");

  useEffect(() => {
    const supabase = createClient();

    // O link de recuperação do Supabase entrega os tokens no fragmento da
    // URL (#access_token=...), que nunca chega ao servidor. O client do
    // @supabase/ssr não faz detecção automática desse fragmento (ao
    // contrário do supabase-js puro), então extraímos e aplicamos na mão.
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setStatus("invalid");
      return;
    }

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data, error }) => {
      setStatus(data.session && !error ? "ready" : "invalid");
      // limpa o fragmento da URL pra não deixar o token exposto na barra de endereço
      window.history.replaceState(null, "", window.location.pathname);
    });
  }, []);

  if (status === "checking") {
    return (
      <div className={`${storeCard} flex flex-col items-center gap-3 py-10 text-center`}>
        <p className="text-sm text-ink/62">Verificando o link...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className={`${storeCard} flex flex-col gap-3 text-center`}>
        <h1 className={storeSectionTitle}>Link inválido ou expirado</h1>
        <p className="text-sm text-ink/62">Solicite um novo link de redefinição de senha.</p>
        <Link href="/esqueci-senha" className="text-sm font-semibold text-wine hover:underline">
          Esqueci minha senha
        </Link>
      </div>
    );
  }

  return (
    <div className={`${storeCard} flex flex-col gap-5`}>
      <div>
        <h1 className={storeSectionTitle}>Defina uma nova senha</h1>
        <p className="mt-1 text-sm text-ink/62">Escolha uma senha com pelo menos 8 caracteres.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="password" className={storeLabel}>
            Nova senha
          </label>
          <input id="password" name="password" type="password" required minLength={8} autoFocus className={`${storeInput} w-full`} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={storeLabel}>
            Confirme a nova senha
          </label>
          <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className={`${storeInput} w-full`} />
        </div>

        {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <button type="submit" disabled={pending} className={`${btnWine} w-full disabled:pointer-events-none disabled:opacity-50`}>
          {pending ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
