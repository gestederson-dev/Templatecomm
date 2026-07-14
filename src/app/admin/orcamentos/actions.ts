"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserEmail } from "@/lib/email/get-user-email";
import { quoteSentEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import type { QuoteItem } from "@/lib/types";

export type ActionState = { error: string } | undefined;

export async function updateQuoteItemPriceAction(itemId: string, quoteId: string, unitPrice: number): Promise<void> {
  const supabase = await createClient();
  await supabase.from("quote_items").update({ unit_price: unitPrice }).eq("id", itemId);
  revalidatePath(`/admin/orcamentos/${quoteId}`);
}

export async function sendQuoteAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const quoteId = String(formData.get("quoteId") ?? "");
  const adminResponse = String(formData.get("adminResponse") ?? "").trim();
  const validUntil = String(formData.get("validUntil") ?? "").trim();

  const supabase = await createClient();

  const { data: items, error: itemsError } = await supabase.from("quote_items").select("quantity, unit_price").eq("quote_id", quoteId);
  if (itemsError) return { error: itemsError.message };
  if (!items || items.length === 0) return { error: "Orçamento sem itens." };
  if (items.some((item) => item.unit_price == null)) return { error: "Defina o preço de todos os itens antes de enviar." };

  const quotedTotal = items.reduce((sum, item) => sum + (item.unit_price ?? 0) * item.quantity, 0);

  const { data: quote, error } = await supabase
    .from("quotes")
    .update({
      status: "quoted",
      quoted_total: quotedTotal,
      admin_response: adminResponse || null,
      valid_until: validUntil || null,
    })
    .eq("id", quoteId)
    .select("quote_number, profile_id")
    .single();

  if (error) return { error: error.message };

  if (quote.profile_id) {
    const email = await getUserEmail(quote.profile_id);
    if (email) {
      const { subject, html } = quoteSentEmail(quote.quote_number, quotedTotal, validUntil || null);
      await sendEmail(email, subject, html);
    }
  }

  revalidatePath(`/admin/orcamentos/${quoteId}`);
  revalidatePath("/admin/orcamentos");
  return undefined;
}

export async function adminRejectQuoteAction(quoteId: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").update({ status: "rejected" }).eq("id", quoteId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/orcamentos/${quoteId}`);
  revalidatePath("/admin/orcamentos");
  return { success: true };
}

export async function adminConvertToOrderAction(quoteId: string): Promise<{ error: string } | { success: true; orderNumber: string }> {
  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase.from("quotes").select("*, quote_items(*)").eq("id", quoteId).maybeSingle();
  if (quoteError || !quote) return { error: "Orçamento não encontrado." };
  if (!quote.profile_id) return { error: "Orçamento sem cliente associado." };
  if (quote.quoted_total == null) return { error: "Defina e envie o preço antes de converter." };

  const items = (quote.quote_items ?? []) as QuoteItem[];
  if (items.some((item) => item.unit_price == null)) return { error: "Nem todos os itens têm preço definido." };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: quote.profile_id,
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

  const { error: itemsInsertError } = await supabase.from("order_items").insert(
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

  if (itemsInsertError) return { error: itemsInsertError.message };

  const { error: updateError } = await supabase.from("quotes").update({ status: "converted", converted_order_id: order.id }).eq("id", quoteId);
  if (updateError) return { error: updateError.message };

  revalidatePath(`/admin/orcamentos/${quoteId}`);
  revalidatePath("/admin/orcamentos");
  revalidatePath("/admin/pedidos");
  return { success: true, orderNumber: order.order_number };
}
