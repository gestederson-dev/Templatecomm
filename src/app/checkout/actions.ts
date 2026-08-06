"use server";

import { createClient } from "@/lib/supabase/server";
import { getShippingProvider, type ShippingOption } from "@/lib/shipping";
import { getPaymentProvider } from "@/lib/payments";
import type { PaymentStatus } from "@/lib/payments";

export type ShippingQuoteState = { options: ShippingOption[] } | { error: string } | undefined;

export async function quoteShippingAction(cep: string, items: { productId: string; quantity: number }[]): Promise<ShippingQuoteState> {
  if (items.length === 0) return { error: "Carrinho vazio." };

  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, weight_grams")
    .in(
      "id",
      items.map((item) => item.productId),
    );

  if (error) return { error: error.message };

  const shippingItems = items.map((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return { weightGrams: product?.weight_grams ?? 300, quantity: item.quantity };
  });

  try {
    const options = await getShippingProvider().quote({ toCep: cep, items: shippingItems });
    if (options.length === 0) return { error: "Nenhuma opção de frete disponível para este CEP." };
    return { options };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao calcular frete." };
  }
}

export type CreateOrderInput = {
  addressId: string;
  shippingCost: number;
  shippingService: string;
  items: { productId: string; quantity: number; customization?: Record<string, string> | null }[];
};

export type CreateOrderState = { orderId: string; orderNumber: string; total: number; payerEmail: string } | { error: string };

/** Só cria o pedido (status pending) — o pagamento em si é processado depois via processPaymentAction, pelo Payment Brick embutido na página. */
export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderState> {
  if (input.items.length === 0) return { error: "Carrinho vazio." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Não autenticado." };

  const { data: address, error: addressError } = await supabase.from("addresses").select("*").eq("id", input.addressId).maybeSingle();
  if (addressError || !address) return { error: "Endereço não encontrado." };

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, base_price, is_active, is_published, allow_direct_sale")
    .in(
      "id",
      input.items.map((item) => item.productId),
    );
  if (productsError) return { error: productsError.message };

  const orderItemsInput: { product_id: string; product_name: string; quantity: number; unit_price: number; total: number; customization: Record<string, string> | null }[] = [];

  for (const item of input.items) {
    const product = products?.find((p) => p.id === item.productId);
    if (!product || !product.is_active || !product.is_published || !product.allow_direct_sale || product.base_price == null) {
      return { error: `Produto indisponível para compra direta: ${product?.name ?? item.productId}` };
    }
    orderItemsInput.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: product.base_price,
      total: product.base_price * item.quantity,
      customization: item.customization ?? null,
    });
  }

  const subtotal = orderItemsInput.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + input.shippingCost;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: user.id,
      status: "pending",
      origin: "direct",
      subtotal,
      shipping_cost: input.shippingCost,
      discount: 0,
      total,
      shipping_address: {
        label: address.label,
        cep: address.cep,
        street: address.street,
        number: address.number,
        complement: address.complement,
        district: address.district,
        city: address.city,
        state: address.state,
        service: input.shippingService,
      },
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) return { error: orderError?.message ?? "Erro ao criar pedido." };

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsInput.map((item) => ({ ...item, order_id: order.id })));
  if (itemsError) return { error: itemsError.message };

  return { orderId: order.id, orderNumber: order.order_number, total, payerEmail: user.email };
}

export type ProcessPaymentState =
  | { status: PaymentStatus; paymentId: string; paymentTypeId: string; qrCode?: string; qrCodeBase64?: string; ticketUrl?: string }
  | { error: string };

/**
 * Processa o pagamento vindo do Payment Brick e devolve o resultado pra tela
 * exibir na hora (aprovado / QR do Pix / boleto / recusado). O pedido em si
 * só é marcado como pago pelo webhook — que roda com service_role e é a
 * única fonte de verdade (CLAUDE.md regra 5) — por isso nenhuma coluna de
 * `orders` é escrita aqui.
 */
export async function processPaymentAction(orderId: string, formData: Record<string, unknown>): Promise<ProcessPaymentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Não autenticado." };

  const { data: order, error: orderError } = await supabase.from("orders").select("id, total, profile_id, status").eq("id", orderId).maybeSingle();
  if (orderError || !order || order.profile_id !== user.id) return { error: "Pedido não encontrado." };
  if (order.status !== "pending") return { error: "Este pedido já foi processado." };

  try {
    return await getPaymentProvider().processPayment({
      orderId,
      amount: order.total,
      payerEmail: user.email,
      formData,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao processar pagamento." };
  }
}
