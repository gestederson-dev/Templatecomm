"use client";

import { useActionState, useEffect, useState } from "react";
import { saveAddressAction, type ActionState } from "@/app/(store)/conta/actions";
import { btnOutline, btnWine } from "@/components/store/button-styles";
import { storeCard, storeInput, storeLabel } from "@/components/store/ui-styles";
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
    <form action={formAction} className={`${storeCard} flex flex-col gap-4`}>
      {address ? <input type="hidden" name="addressId" value={address.id} /> : null}

      <div>
        <label htmlFor="label" className={storeLabel}>
          Identificação (opcional)
        </label>
        <input id="label" name="label" placeholder="Casa, Trabalho..." defaultValue={address?.label ?? ""} className={`${storeInput} w-full`} />
      </div>

      <div>
        <label htmlFor="cep" className={storeLabel}>
          CEP
        </label>
        <input
          id="cep"
          name="cep"
          required
          value={cep}
          onChange={(event) => setCep(formatCep(event.target.value))}
          onBlur={(event) => buscarCep(event.target.value)}
          placeholder="00000-000"
          className={`${storeInput} w-32`}
        />
        {buscandoCep ? <span className="mt-1 block text-xs text-ink/50">Buscando endereço...</span> : null}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label htmlFor="street" className={storeLabel}>
            Endereço
          </label>
          <input id="street" name="street" required value={street} onChange={(event) => setStreet(event.target.value)} className={`${storeInput} w-full`} />
        </div>
        <div>
          <label htmlFor="number" className={storeLabel}>
            Número
          </label>
          <input id="number" name="number" defaultValue={address?.number ?? ""} className={`${storeInput} w-full`} />
        </div>
      </div>

      <div>
        <label htmlFor="complement" className={storeLabel}>
          Complemento
        </label>
        <input id="complement" name="complement" defaultValue={address?.complement ?? ""} className={`${storeInput} w-full`} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2">
          <label htmlFor="district" className={storeLabel}>
            Bairro
          </label>
          <input id="district" name="district" value={district} onChange={(event) => setDistrict(event.target.value)} className={`${storeInput} w-full`} />
        </div>
        <div>
          <label htmlFor="city" className={storeLabel}>
            Cidade
          </label>
          <input id="city" name="city" required value={city} onChange={(event) => setCity(event.target.value)} className={`${storeInput} w-full`} />
        </div>
        <div>
          <label htmlFor="state" className={storeLabel}>
            UF
          </label>
          <input id="state" name="state" required maxLength={2} value={uf} onChange={(event) => setUf(event.target.value.toUpperCase())} className={`${storeInput} w-full`} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/78">
        <input type="checkbox" name="isDefault" defaultChecked={address?.is_default} className="h-4 w-4 rounded border-ink/25 accent-wine" />
        Usar como endereço padrão
      </label>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex gap-2.5">
        <button type="submit" disabled={pending} className={`${btnWine} disabled:pointer-events-none disabled:opacity-50`}>
          {pending ? "Salvando..." : "Salvar endereço"}
        </button>
        {onDone ? (
          <button type="button" onClick={onDone} className={btnOutline}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
