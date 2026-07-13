"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cartTotalPrice, useCartStore } from "@/stores/cart";
import { formatBRL } from "@/lib/format";
import type { Address } from "@/lib/types";
import type { ShippingOption } from "@/lib/shipping";
import { createOrderAction, quoteShippingAction } from "@/app/checkout/actions";

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);

  const [addressId, setAddressId] = useState(addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? "");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [shippingIndex, setShippingIndex] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartTotalPrice(items);
  const shippingOption = shippingIndex != null ? shippingOptions?.[shippingIndex] : null;
  const total = subtotal + (shippingOption?.price ?? 0);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Seu carrinho está vazio. <Link href="/produtos" className="underline">Ver catálogo</Link>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Cadastre um endereço de entrega antes de continuar.{" "}
        <Link href="/conta/enderecos" className="underline">
          Adicionar endereço
        </Link>
      </div>
    );
  }

  async function handleCalcularFrete() {
    const address = addresses.find((a) => a.id === addressId);
    if (!address) return;

    setLoadingShipping(true);
    setError(null);
    setShippingOptions(null);
    setShippingIndex(null);

    const result = await quoteShippingAction(
      address.cep,
      items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    );

    setLoadingShipping(false);
    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    setShippingOptions(result?.options ?? []);
  }

  async function handlePagar() {
    if (!shippingOption) return;
    setSubmitting(true);
    setError(null);

    const result = await createOrderAction({
      addressId,
      shippingCost: shippingOption.price,
      shippingService: shippingOption.service,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });

    if ("error" in result) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    clearCart();
    window.location.href = result.checkoutUrl;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">1. Endereço de entrega</h2>
        <div className="flex flex-col gap-2">
          {addresses.map((address) => (
            <label key={address.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${addressId === address.id ? "border-foreground" : ""}`}>
              <input
                type="radio"
                name="address"
                checked={addressId === address.id}
                onChange={() => {
                  setAddressId(address.id);
                  setShippingOptions(null);
                  setShippingIndex(null);
                }}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{address.label || "Endereço"}</span>
                <br />
                {address.street}
                {address.number ? `, ${address.number}` : ""} — {address.city}/{address.state} — CEP {address.cep}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">2. Frete</h2>
        <Button type="button" variant="outline" className="w-fit" onClick={handleCalcularFrete} disabled={loadingShipping}>
          {loadingShipping ? "Calculando..." : "Calcular frete"}
        </Button>

        {shippingOptions ? (
          <div className="flex flex-col gap-2">
            {shippingOptions.map((option, index) => (
              <label key={`${option.service}-${index}`} className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${shippingIndex === index ? "border-foreground" : ""}`}>
                <span className="flex items-center gap-3">
                  <input type="radio" name="shipping" checked={shippingIndex === index} onChange={() => setShippingIndex(index)} />
                  <span>
                    {option.service}
                    {option.deliveryDays ? ` — até ${option.deliveryDays} dias úteis` : ""}
                  </span>
                </span>
                <span className="font-medium tabular-nums">{formatBRL(option.price)}</span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span className="tabular-nums">{shippingOption ? formatBRL(shippingOption.price) : "—"}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatBRL(total)}</span>
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button size="lg" disabled={!shippingOption || submitting} onClick={handlePagar}>
        {submitting ? "Redirecionando..." : "Pagar com Mercado Pago"}
      </Button>
    </div>
  );
}
