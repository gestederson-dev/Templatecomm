"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/storage";
import { draftTotal, validateDraft } from "@/lib/confirmation-draft";
import type { OrderConfirmation } from "@/lib/confirmations";

// Tudo pelo client com a sessão: o RLS (is_admin) da tabela e do bucket barra quem não é admin.

export type EditorState = { error: string } | undefined;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

function parseDraft(formData: FormData) {
  try {
    return validateDraft(JSON.parse(String(formData.get("draft") ?? "null")), process.env.NEXT_PUBLIC_SUPABASE_URL);
  } catch {
    return { ok: false as const, error: "Dados inválidos." };
  }
}

export async function createConfirmationAction(_prev: EditorState, formData: FormData): Promise<EditorState> {
  const draft = parseDraft(formData);
  if (!draft.ok) return { error: draft.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from("order_confirmations").insert(draft.value).select("id").single();
  if (error?.code === "23505") return { error: "Este pedido já tem uma confirmação. Use a que já existe." };
  if (error || !data) return { error: error?.message ?? "Não foi possível criar a confirmação." };

  revalidatePath("/admin/confirmacoes");
  redirect(`/admin/confirmacoes?criada=${data.id}`);
}

export async function updateConfirmationAction(id: string, _prev: EditorState, formData: FormData): Promise<EditorState> {
  const draft = parseDraft(formData);
  if (!draft.ok) return { error: draft.error };

  const supabase = await createClient();
  // só enquanto o cliente não respondeu: depois disso o que ele aceitou não muda
  const { data, error } = await supabase.from("order_confirmations").update(draft.value).eq("id", id).eq("status", "pendente").select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0)
    return {
      error: "Esta confirmação já foi respondida ou cancelada e não pode mais ser alterada.",
    };

  revalidatePath("/admin/confirmacoes");
  redirect(`/admin/confirmacoes?editada=${id}`);
}

export async function cancelConfirmationAction(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("order_confirmations").update({ status: "cancelado" }).eq("id", id).eq("status", "pendente");
  revalidatePath("/admin/confirmacoes");
}

export async function uploadConfirmationImageAction(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecione uma foto." };
  if (!IMAGE_TYPES.includes(file.type)) return { error: "Use uma foto JPG, PNG ou WEBP." };
  if (file.size > IMAGE_MAX_BYTES) return { error: "Foto maior que 5 MB." };

  const supabase = await createClient();
  const path = `confirmacoes/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

/**
 * Venda fechada por confirmação (WhatsApp ou orçamento) vira pedido no painel, com os
 * dados que o cliente preencheu. Se veio de um orçamento, o orçamento fica como convertido.
 */
export async function createOrderFromConfirmationAction(id: string): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data } = await supabase.from("order_confirmations").select("*").eq("id", id).maybeSingle();
  const c = data as OrderConfirmation | null;
  if (!c) return { error: "Confirmação não encontrada." };
  if (c.order_id) redirect(`/admin/pedidos/${c.order_id}`);
  if (c.status !== "respondido") return { error: "O cliente ainda não respondeu esta confirmação." };

  const total = draftTotal(c.items);
  const pagamento = c.payment_options.find((option) => option.id === c.payment_choice);
  const address = c.street
    ? {
        cep: c.cep ?? "",
        street: c.street,
        number: c.number ?? "",
        complement: c.complement ?? "",
        district: c.district ?? "",
        city: c.city ?? "",
        state: c.state ?? "",
      }
    : null;
  const notes = [
    `Confirmação de ${c.customer_label}${c.wants_invoice ? " · emitir nota fiscal" : ""}`,
    pagamento?.note,
    c.customer_message ? `Cliente: ${c.customer_message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: c.contact_name || c.customer_label,
      customer_phone: c.contact_phone,
      status: "pending",
      origin: c.quote_id ? "quote" : "manual",
      subtotal: total,
      shipping_cost: 0,
      discount: 0,
      total,
      shipping_address: address,
      payment_method: pagamento?.label ?? null,
      notes,
    })
    .select("id")
    .single();
  if (error || !order) return { error: error?.message ?? "Não foi possível criar o pedido." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    c.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id ?? null,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: Math.round(item.quantity * item.unit_price * 100) / 100,
    })),
  );
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: itemsError.message };
  }

  await supabase.from("order_confirmations").update({ order_id: order.id }).eq("id", c.id);
  if (c.quote_id) {
    await supabase.from("quotes").update({ status: "converted", converted_order_id: order.id }).eq("id", c.quote_id);
  }

  revalidatePath("/admin/confirmacoes");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  redirect(`/admin/pedidos/${order.id}`);
}
