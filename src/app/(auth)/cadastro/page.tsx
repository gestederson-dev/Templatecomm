"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";
import { signUpAction } from "../actions";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signUpAction, undefined);
  const [personType, setPersonType] = useState<"pf" | "pj">("pf");
  const [document, setDocument] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex gap-2 rounded-lg border p-1">
            <button
              type="button"
              onClick={() => {
                setPersonType("pf");
                setDocument("");
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${personType === "pf" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              Pessoa física
            </button>
            <button
              type="button"
              onClick={() => {
                setPersonType("pj");
                setDocument("");
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${personType === "pj" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              Pessoa jurídica
            </button>
          </div>
          <input type="hidden" name="personType" value={personType} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">
              {personType === "pf" ? "Nome completo" : "Nome do responsável"}
            </label>
            <Input id="fullName" name="fullName" required autoFocus />
          </div>

          {personType === "pj" ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="companyName" className="text-sm font-medium">
                Razão social
              </label>
              <Input id="companyName" name="companyName" required />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="document" className="text-sm font-medium">
              {personType === "pf" ? "CPF" : "CNPJ"}
            </label>
            <Input
              id="document"
              name={personType === "pf" ? "cpf" : "cnpj"}
              required
              value={document}
              onChange={(event) => setDocument(personType === "pf" ? formatarCPF(event.target.value) : formatarCNPJ(event.target.value))}
              placeholder={personType === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Telefone / WhatsApp
            </label>
            <Input id="phone" name="phone" placeholder="(00) 00000-0000" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>

          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
