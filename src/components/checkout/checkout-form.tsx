"use client";

import { useState } from "react";
import Link from "next/link";
import { cartTotalPrice, useCartStore } from "@/stores/cart";
import { formatBRL } from "@/lib/format";
import { btnOutline, btnWine } from "@/components/store/button-styles";
import { storeCard, storeSectionTitle } from "@/components/store/ui-styles";
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
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/60">
        Seu carrinho está vazio.{" "}
        <Link href="/produtos" className="font-semibold text-wine hover:underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/60">
        Cadastre um endereço de entrega antes de continuar.{" "}
        <Link href="/conta/enderecos" className="font-semibold text-wine hover:underline">
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
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, customization: item.customization })),
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
    <div className="flex flex-col gap-6">
      <section className={`${storeCard} flex flex-col gap-4`}>
        <h2 className={storeSectionTitle}>1. Endereço de entrega</h2>
        <div className="flex flex-col gap-2.5">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ${
                addressId === address.id ? "border-wine bg-wine-tint" : "border-ink/12 hover:border-ink/25"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={addressId === address.id}
                onChange={() => {
                  setAddressId(address.id);
                  setShippingOptions(null);
                  setShippingIndex(null);
                }}
                className="mt-1 accent-wine"
              />
              <span>
                <span className="font-semibold text-ink">{address.label || "Endereço"}</span>
                <br />
                <span className="text-ink/62">
                  {address.street}
                  {address.number ? `, ${address.number}` : ""} — {address.city}/{address.state} — CEP {address.cep}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className={`${storeCard} flex flex-col gap-4`}>
        <h2 className={storeSectionTitle}>2. Frete</h2>
        <button type="button" className={`${btnOutline} w-fit`} onClick={handleCalcularFrete} disabled={loadingShipping}>
          {loadingShipping ? "Calculando..." : "Calcular frete"}
        </button>

        {shippingOptions ? (
          <div className="flex flex-col gap-2.5">
            {shippingOptions.map((option, index) => (
              <label
                key={`${option.service}-${index}`}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-sm transition-colors ${
                  shippingIndex === index ? "border-wine bg-wine-tint" : "border-ink/12 hover:border-ink/25"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input type="radio" name="shipping" checked={shippingIndex === index} onChange={() => setShippingIndex(index)} className="accent-wine" />
                  <span className="text-ink/85">
                    {option.service}
                    {option.deliveryDays ? ` — até ${option.deliveryDays} dias úteis` : ""}
                  </span>
                </span>
                <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-wine">{formatBRL(option.price)}</span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className={`${storeCard} flex flex-col gap-2 text-sm`}>
        <div className="flex justify-between text-ink/70">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Frete</span>
          <span className="tabular-nums">{shippingOption ? formatBRL(shippingOption.price) : "—"}</span>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-2.5 text-base font-semibold text-ink">
          <span>Total</span>
          <span className="font-[family-name:var(--font-display)] tabular-nums text-wine">{formatBRL(total)}</span>
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button type="button" className={`${btnWine} w-full py-3.5 text-base disabled:pointer-events-none disabled:opacity-50`} disabled={!shippingOption || submitting} onClick={handlePagar}>
        {submitting ? "Redirecionando..." : "Pagar com Mercado Pago"}
      </button>
    </div>
  );
}
