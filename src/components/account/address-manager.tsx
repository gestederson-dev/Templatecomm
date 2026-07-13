"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/account/address-form";
import { deleteAddressAction } from "@/app/conta/actions";
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
          <div key={address.id} className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{address.label || "Endereço"}</span>
                {address.is_default ? <Badge variant="secondary">Padrão</Badge> : null}
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(address.id)}>
                  Editar
                </Button>
                <form action={deleteAddressAction}>
                  <input type="hidden" name="addressId" value={address.id} />
                  <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                    Excluir
                  </Button>
                </form>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
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

      {addresses.length === 0 && !addingNew ? <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado ainda.</p> : null}

      {addingNew ? (
        <AddressForm onDone={() => setAddingNew(false)} />
      ) : (
        <Button type="button" variant="outline" className="w-fit" onClick={() => setAddingNew(true)}>
          + Novo endereço
        </Button>
      )}
    </div>
  );
}
