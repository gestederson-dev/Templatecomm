"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartTotalPrice, useCartStore } from "@/stores/cart";
import { formatBRL } from "@/lib/format";
import { btnOutline, btnWine } from "@/components/store/button-styles";
import { storeCard, storeSectionTitle } from "@/components/store/ui-styles";
import type { Address } from "@/lib/types";
import type { ShippingOption } from "@/lib/shipping";
import { createOrderAction, processPaymentAction, quoteShippingAction, type ProcessPaymentState } from "@/app/checkout/actions";
import { PaymentBrick } from "./payment-brick";
import { PixInstructions, BoletoInstructions } from "./payment-instructions";

type OrderCreated = { orderId: string; orderNumber: string; total: number; payerEmail: string };
type PaymentSuccess = Extract<ProcessPaymentState, { status: string }>;

// Guarda o resultado do pagamento por um tempo — se a aba recarregar logo depois
// do Pix/boleto aparecer (comum no celular, ao trocar pro app do banco e voltar),
// o React perde todo o estado em memória. Sem isso, a tela mostra "carrinho
// vazio" (o carrinho já foi limpo) mesmo com o pagamento certo em andamento.
const CHECKOUT_RESULT_STORAGE_KEY = "salmar-brindes-checkout-result";
const CHECKOUT_RESULT_TTL_MS = 2 * 60 * 60 * 1000;

function readStoredResult(): { order: OrderCreated; paymentResult: PaymentSuccess } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { order: OrderCreated; paymentResult: PaymentSuccess; savedAt: number };
    if (Date.now() - parsed.savedAt > CHECKOUT_RESULT_TTL_MS) return null;
    return { order: parsed.order, paymentResult: parsed.paymentResult };
  } catch {
    return null;
  }
}

function clearStoredResult() {
  try {
    sessionStorage.removeItem(CHECKOUT_RESULT_STORAGE_KEY);
  } catch {
    // sessionStorage indisponível (ex.: modo privado) — sem problema, é só rede de segurança.
  }
}

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);

  const [addressId, setAddressId] = useState(addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? "");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [shippingIndex, setShippingIndex] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderCreated | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentSuccess | null>(null);
  const [brickAttempt, setBrickAttempt] = useState(0);

  // Recupera o resultado do pagamento se a aba recarregou (ver comentário acima).
  useEffect(() => {
    const stored = readStoredResult();
    if (stored) {
      setOrder(stored.order);
      setPaymentResult(stored.paymentResult);
    }
  }, []);

  // Se voltou pra cá com o carrinho cheio (compra nova), o resultado recuperado é de um
  // pedido antigo — descarta pra não travar o cliente numa tela de pagamento já resolvida.
  useEffect(() => {
    if (paymentResult && items.length > 0) {
      setOrder(null);
      setPaymentResult(null);
      clearStoredResult();
    }
  }, [items, paymentResult]);

  const subtotal = cartTotalPrice(items);
  const shippingOption = shippingIndex != null ? shippingOptions?.[shippingIndex] : null;
  const total = subtotal + (shippingOption?.price ?? 0);

  if (paymentResult) {
    return <PaymentResultPanel result={paymentResult} orderNumber={order?.orderNumber ?? ""} onRetry={handleTentarNovamente} />;
  }

  if (items.length === 0 && !order) {
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

  async function handleContinuar() {
    if (!shippingOption) return;
    setSubmitting(true);
    setError(null);
    clearStoredResult();

    const result = await createOrderAction({
      addressId,
      shippingCost: shippingOption.price,
      shippingService: shippingOption.service,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, customization: item.customization })),
    });

    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setOrder(result);
  }

  async function handlePaymentResult(orderId: string, formData: Record<string, unknown>) {
    const result = await processPaymentAction(orderId, formData);
    if (!("error" in result)) {
      clearCart();
      setPaymentResult(result);
      if (order) {
        try {
          sessionStorage.setItem(CHECKOUT_RESULT_STORAGE_KEY, JSON.stringify({ order, paymentResult: result, savedAt: Date.now() }));
        } catch {
          // sessionStorage indisponível — sem problema, é só rede de segurança pra reload.
        }
      }
    }
    return result;
  }

  function handleTentarNovamente() {
    setPaymentResult(null);
    setBrickAttempt((n) => n + 1);
    clearStoredResult();
  }

  if (order) {
    return (
      <div className="flex flex-col gap-6">
        <section className={`${storeCard} flex flex-col gap-2 text-sm`}>
          <h2 className={storeSectionTitle}>Pedido #{order.orderNumber}</h2>
          <div className="flex justify-between border-t border-ink/10 pt-2.5 text-base font-semibold text-ink">
            <span>Total a pagar</span>
            <span className="font-[family-name:var(--font-display)] tabular-nums text-wine">{formatBRL(order.total)}</span>
          </div>
        </section>

        <section className={`${storeCard} flex flex-col gap-4`}>
          <h2 className={storeSectionTitle}>Pagamento</h2>
          <PaymentBrick
            key={brickAttempt}
            amount={order.total}
            payerEmail={order.payerEmail}
            onResult={(formData) => handlePaymentResult(order.orderId, formData)}
          />
        </section>
      </div>
    );
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

      <button type="button" className={`${btnWine} w-full py-3.5 text-base disabled:pointer-events-none disabled:opacity-50`} disabled={!shippingOption || submitting} onClick={handleContinuar}>
        {submitting ? "Processando..." : "Continuar para pagamento"}
      </button>
    </div>
  );
}

function PaymentResultPanel({ result, orderNumber, onRetry }: { result: PaymentSuccess; orderNumber: string; onRetry: () => void }) {
  const router = useRouter();
  const orderHref = `/pedido/${orderNumber}`;

  // Aprovado não tem mais nada acionável nessa tela — manda direto pro status do pedido.
  useEffect(() => {
    if (result.status === "approved") {
      const timeout = setTimeout(() => router.push(orderHref), 1500);
      return () => clearTimeout(timeout);
    }
  }, [result.status, orderHref, router]);

  if (result.status === "approved") {
    return (
      <div className={`${storeCard} flex flex-col items-center gap-3 py-10 text-center`}>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-positive">Pagamento aprovado!</h2>
        <p className="text-sm text-ink/70">Pedido #{orderNumber} confirmado. Você vai receber um e-mail com os detalhes.</p>
        <Link href={orderHref} className={`${btnWine} mt-2 px-6 py-2.5`}>
          Ver status do pedido
        </Link>
      </div>
    );
  }

  if (result.qrCode) {
    return (
      <div className={`${storeCard} flex flex-col items-center gap-4 py-8 text-center`}>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">Pague com Pix pra concluir</h2>
        <p className="text-sm text-ink/70">Pedido #{orderNumber} — escaneie o QR code ou copie o código abaixo no app do seu banco.</p>
        <PixInstructions qrCode={result.qrCode} qrCodeBase64={result.qrCodeBase64} />
        <Link href={orderHref} className={`${btnOutline} mt-1 px-6 py-2.5`}>
          Ver status do pedido
        </Link>
      </div>
    );
  }

  if (result.ticketUrl) {
    return (
      <div className={`${storeCard} flex flex-col items-center gap-4 py-8 text-center`}>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">Boleto gerado</h2>
        <p className="text-sm text-ink/70">Pedido #{orderNumber} — imprima ou visualize o boleto abaixo.</p>
        <BoletoInstructions ticketUrl={result.ticketUrl} />
        <Link href={orderHref} className={`${btnOutline} mt-1 px-6 py-2.5`}>
          Ver status do pedido
        </Link>
      </div>
    );
  }

  if (result.status === "rejected") {
    return (
      <div className={`${storeCard} flex flex-col items-center gap-3 py-10 text-center`}>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-destructive">Pagamento recusado</h2>
        <p className="text-sm text-ink/70">O pedido #{orderNumber} foi criado, mas o pagamento não foi aprovado. Tente novamente com outro cartão ou meio de pagamento.</p>
        <div className="mt-2 flex gap-3">
          <button type="button" className={`${btnWine} px-6 py-2.5`} onClick={onRetry}>
            Tentar novamente
          </button>
          <Link href={orderHref} className={`${btnOutline} px-6 py-2.5`}>
            Ver status do pedido
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${storeCard} flex flex-col items-center gap-3 py-10 text-center`}>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">Pagamento em processamento</h2>
      <p className="text-sm text-ink/70">Pedido #{orderNumber} — assim que confirmarmos o pagamento, você recebe um e-mail.</p>
      <Link href={orderHref} className={`${btnWine} mt-2 px-6 py-2.5`}>
        Ver status do pedido
      </Link>
    </div>
  );
}
