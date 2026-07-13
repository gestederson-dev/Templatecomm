"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAddressAction, type ActionState } from "@/app/conta/actions";
import type { Address } from "@/lib/types";

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function AddressForm({ address, onDone }: { address?: Address; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveAddressAction, undefined);
  const [cep, setCep] = useState(address?.cep ?? "");
  const [street, setStreet] = useState(address?.street ?? "");
  const [district, setDistrict] = useState(address?.district ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [uf, setUf] = useState(address?.state ?? "");
  const [buscandoCep, setBuscandoCep] = useState(false);

  async function buscarCep(rawCep: string) {
    const digits = rawCep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro ?? "");
        setDistrict(data.bairro ?? "");
        setCity(data.localidade ?? "");
        setUf(data.uf ?? "");
      }
    } catch {
      // silencioso: usuário preenche manualmente se a busca falhar
    } finally {
      setBuscandoCep(false);
    }
  }

  useEffect(() => {
    if (state && "success" in state) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      {address ? <input type="hidden" name="addressId" value={address.id} /> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="label" className="text-sm font-medium">
          Identificação (opcional)
        </label>
        <Input id="label" name="label" placeholder="Casa, Trabalho..." defaultValue={address?.label ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cep" className="text-sm font-medium">
          CEP
        </label>
        <Input
          id="cep"
          name="cep"
          required
          value={cep}
          onChange={(event) => setCep(formatCep(event.target.value))}
          onBlur={(event) => buscarCep(event.target.value)}
          placeholder="00000-000"
          className="w-32"
        />
        {buscandoCep ? <span className="text-xs text-muted-foreground">Buscando endereço...</span> : null}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="street" className="text-sm font-medium">
            Endereço
          </label>
          <Input id="street" name="street" required value={street} onChange={(event) => setStreet(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="number" className="text-sm font-medium">
            Número
          </label>
          <Input id="number" name="number" defaultValue={address?.number ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="complement" className="text-sm font-medium">
          Complemento
        </label>
        <Input id="complement" name="complement" defaultValue={address?.complement ?? ""} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor="district" className="text-sm font-medium">
            Bairro
          </label>
          <Input id="district" name="district" value={district} onChange={(event) => setDistrict(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-medium">
            Cidade
          </label>
          <Input id="city" name="city" required value={city} onChange={(event) => setCity(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="state" className="text-sm font-medium">
            UF
          </label>
          <Input id="state" name="state" required maxLength={2} value={uf} onChange={(event) => setUf(event.target.value.toUpperCase())} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={address?.is_default} className="h-4 w-4 rounded border-input" />
        Usar como endereço padrão
      </label>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar endereço"}
        </Button>
        {onDone ? (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
