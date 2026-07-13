"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { QuoteItem } from "@/lib/types";

export type CreateQuoteInput = {
  productId: string;
  quantity: number;
  customization: Record<string, string>;
  message: string;
};

export async function createQuoteAction(input: CreateQuoteInput): Promise<{ quoteNumber: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar logado para solicitar um orçamento." };

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, allow_quote, min_quote_quantity, is_active")
    .eq("id", input.productId)
    .maybeSingle();

  if (productError || !product) return { error: "Produto não encontrado." };
  if (!product.is_active || !product.allow_quote) return { error: "Este produto não aceita orçamento." };
  if (input.quantity < product.min_quote_quantity) return { error: `Quantidade mínima para orçamento: ${product.min_quote_quantity}.` };

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({ profile_id: user.id, status: "requested", customer_message: input.message || null })
    .select("id, quote_number")
    .single();

  if (quoteError || !quote) return { error: quoteError?.message ?? "Erro ao criar orçamento." };

  const { error: itemError } = await supabase.from("quote_items").insert({
    quote_id: quote.id,
    product_id: product.id,
    product_name: product.name,
    quantity: input.quantity,
    customization: Object.keys(input.customization).length > 0 ? input.customization : null,
  });

  if (itemError) return { error: itemError.message };

  revalidatePath("/conta/orcamentos");
  return { quoteNumber: quote.quote_number };
}

export async function rejectQuoteAction(quoteId: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase.from("quotes").update({ status: "rejected" }).eq("id", quoteId).eq("profile_id", user.id).eq("status", "quoted");

  if (error) return { error: error.message };

  revalidatePath("/conta/orcamentos");
  return { success: true };
}

export async function approveQuoteAction(quoteId: string): Promise<{ error: string } | { success: true; orderNumber: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: quote, error: quoteError } = await supabase.from("quotes").select("*, quote_items(*)").eq("id", quoteId).eq("profile_id", user.id).maybeSingle();

  if (quoteError || !quote) return { error: "Orçamento não encontrado." };
  if (quote.status !== "quoted") return { error: "Este orçamento ainda não foi cotado pelo admin." };
  if (quote.quoted_total == null) return { error: "Orçamento sem valor definido." };

  const items = (quote.quote_items ?? []) as QuoteItem[];
  if (items.some((item) => item.unit_price == null)) {
    return { error: "Nem todos os itens têm preço definido ainda." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: user.id,
      status: "pending",
      origin: "quote",
      subtotal: quote.quoted_total,
      shipping_cost: 0,
      discount: 0,
      total: quote.quoted_total,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) return { error: orderError?.message ?? "Erro ao criar pedido." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price ?? 0,
      customization: item.customization,
      total: (item.unit_price ?? 0) * item.quantity,
    })),
  );

  if (itemsError) return { error: itemsError.message };

  const { error: updateError } = await supabase.from("quotes").update({ status: "converted", converted_order_id: order.id }).eq("id", quoteId);
  if (updateError) return { error: updateError.message };

  revalidatePath("/conta/orcamentos");
  revalidatePath("/conta/pedidos");
  return { success: true, orderNumber: order.order_number };
}
