"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { btnWine } from "@/components/store/button-styles";
import { storeCard, storeInput, storeLabel, storeSectionTitle } from "@/components/store/ui-styles";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";
import { signUpAction } from "../actions";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signUpAction, undefined);
  const [personType, setPersonType] = useState<"pf" | "pj">("pf");
  const [document, setDocument] = useState("");

  return (
    <div className={`${storeCard} flex flex-col gap-5`}>
      <h1 className={storeSectionTitle}>Criar conta</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex gap-1 rounded-xl border border-ink/12 p-1">
          <button
            type="button"
            onClick={() => {
              setPersonType("pf");
              setDocument("");
            }}
            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors ${personType === "pf" ? "bg-wine text-white" : "text-ink/55 hover:bg-wine-tint hover:text-wine"}`}
          >
            Pessoa física
          </button>
          <button
            type="button"
            onClick={() => {
              setPersonType("pj");
              setDocument("");
            }}
            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors ${personType === "pj" ? "bg-wine text-white" : "text-ink/55 hover:bg-wine-tint hover:text-wine"}`}
          >
            Pessoa jurídica
          </button>
        </div>
        <input type="hidden" name="personType" value={personType} />

        <div>
          <label htmlFor="fullName" className={storeLabel}>
            {personType === "pf" ? "Nome completo" : "Nome do responsável"}
          </label>
          <input id="fullName" name="fullName" required autoFocus className={`${storeInput} w-full`} />
        </div>

        {personType === "pj" ? (
          <div>
            <label htmlFor="companyName" className={storeLabel}>
              Razão social
            </label>
            <input id="companyName" name="companyName" required className={`${storeInput} w-full`} />
          </div>
        ) : null}

        <div>
          <label htmlFor="document" className={storeLabel}>
            {personType === "pf" ? "CPF" : "CNPJ"}
          </label>
          <input
            id="document"
            name={personType === "pf" ? "cpf" : "cnpj"}
            required
            value={document}
            onChange={(event) => setDocument(personType === "pf" ? formatarCPF(event.target.value) : formatarCNPJ(event.target.value))}
            placeholder={personType === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
            className={`${storeInput} w-full`}
          />
        </div>

        <div>
          <label htmlFor="phone" className={storeLabel}>
            Telefone / WhatsApp
          </label>
          <input id="phone" name="phone" placeholder="(00) 00000-0000" className={`${storeInput} w-full`} />
        </div>

        <div>
          <label htmlFor="email" className={storeLabel}>
            E-mail
          </label>
          <input id="email" name="email" type="email" required className={`${storeInput} w-full`} />
        </div>

        <div>
          <label htmlFor="password" className={storeLabel}>
            Senha
          </label>
          <input id="password" name="password" type="password" required minLength={8} className={`${storeInput} w-full`} />
        </div>

        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <button type="submit" disabled={pending} className={`${btnWine} w-full disabled:pointer-events-none disabled:opacity-50`}>
          {pending ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-ink/62">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-wine hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
