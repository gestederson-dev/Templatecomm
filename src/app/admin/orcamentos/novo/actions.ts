"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | undefined;

type ManualQuoteItemInput = {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number | null;
  customization?: Record<string, string> | null;
};

export async function createManualQuoteAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profileId = String(formData.get("profileId") ?? "").trim() || null;
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();

  if (!profileId && !customerName) {
    return { error: "Selecione um cliente cadastrado ou informe ao menos o nome do cliente." };
  }

  const customerMessage = String(formData.get("customerMessage") ?? "").trim() || null;

  let items: ManualQuoteItemInput[];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Itens do orçamento inválidos." };
  }

  if (!Array.isArray(items) || items.length === 0) return { error: "Adicione ao menos um produto ao orçamento." };
  for (const item of items) {
    if (!item.productName || !(item.quantity > 0)) return { error: "Verifique os produtos e quantidades informados." };
  }

  const hasAllPrices = items.every((item) => item.unitPrice != null && item.unitPrice >= 0);
  const quotedTotal = hasAllPrices ? items.reduce((sum, item) => sum + item.quantity * (item.unitPrice ?? 0), 0) : null;

  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      profile_id: profileId,
      customer_name: profileId ? null : customerName || null,
      customer_phone: profileId ? null : customerPhone || null,
      status: hasAllPrices ? "quoted" : "requested",
      customer_message: customerMessage,
      quoted_total: quotedTotal,
    })
    .select("id")
    .single();

  if (quoteError || !quote) return { error: quoteError?.message ?? "Erro ao criar orçamento." };

  const { error: itemsError } = await supabase.from("quote_items").insert(
    items.map((item) => ({
      quote_id: quote.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      customization: item.customization ?? null,
    })),
  );

  if (itemsError) return { error: itemsError.message };

  revalidatePath("/admin/orcamentos");
  revalidatePath("/admin");
  redirect(`/admin/orcamentos/${quote.id}`);
}
