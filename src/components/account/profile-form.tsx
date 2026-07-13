"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction, type ActionState } from "@/app/conta/actions";

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateProfileAction, undefined);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nome
        </label>
        <Input id="fullName" name="fullName" defaultValue={fullName} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Telefone / WhatsApp
        </label>
        <Input id="phone" name="phone" defaultValue={phone} placeholder="(00) 00000-0000" />
      </div>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? <p className="text-sm text-primary">Dados atualizados.</p> : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
