"use client";

import { useState } from "react";
import { AddressForm } from "@/components/account/address-form";
import { deleteAddressAction } from "@/app/(store)/conta/actions";
import { btnOutline } from "@/components/store/button-styles";
import { storeCard } from "@/components/store/ui-styles";
import type { Address } from "@/lib/types";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((address) =>
        editingId === address.id ? (
          <AddressForm key={address.id} address={address} onDone={() => setEditingId(null)} />
        ) : (
          <div key={address.id} className={`${storeCard} flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{address.label || "Endereço"}</span>
                {address.is_default ? <span className="rounded-full bg-wine-tint px-2.5 py-0.5 text-[11.5px] font-semibold text-wine">Padrão</span> : null}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingId(address.id)} className="text-sm font-semibold text-wine hover:underline">
                  Editar
                </button>
                <form action={deleteAddressAction}>
                  <input type="hidden" name="addressId" value={address.id} />
                  <button type="submit" className="text-sm font-semibold text-destructive hover:underline">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
            <p className="text-sm text-ink/62">
              {address.street}
              {address.number ? `, ${address.number}` : ""}
              {address.complement ? ` — ${address.complement}` : ""}
              <br />
              {address.district ? `${address.district}, ` : ""}
              {address.city}/{address.state} — CEP {address.cep}
            </p>
          </div>
        ),
      )}

      {addresses.length === 0 && !addingNew ? <p className="text-sm text-ink/52">Nenhum endereço cadastrado ainda.</p> : null}

      {addingNew ? (
        <AddressForm onDone={() => setAddingNew(false)} />
      ) : (
        <button type="button" onClick={() => setAddingNew(true)} className={`${btnOutline} w-fit`}>
          + Novo endereço
        </button>
      )}
    </div>
  );
}
