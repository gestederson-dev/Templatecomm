"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type ActionState = { error: string } | undefined;

type ManualOrderItemInput = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  customization?: Record<string, string> | null;
};

const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "canceled"];

export async function createManualOrderAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profileId = String(formData.get("profileId") ?? "").trim() || null;
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();

  if (!profileId && !customerName) {
    return { error: "Selecione um cliente cadastrado ou informe ao menos o nome do cliente." };
  }

  const status = String(formData.get("status") ?? "paid") as OrderStatus;
  if (!VALID_STATUSES.includes(status)) return { error: "Status inválido." };

  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const discount = Math.max(0, Number(formData.get("discount") ?? 0) || 0);
  const includeShipping = formData.get("includeShipping") === "on";
  const shippingCost = includeShipping ? Math.max(0, Number(formData.get("shippingCost") ?? 0) || 0) : 0;

  let shippingAddress: Record<string, string> | null = null;
  if (includeShipping) {
    shippingAddress = {
      street: String(formData.get("street") ?? "").trim(),
      number: String(formData.get("number") ?? "").trim(),
      complement: String(formData.get("complement") ?? "").trim(),
      district: String(formData.get("district") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      cep: String(formData.get("cep") ?? "").trim(),
    };
  }

  let items: ManualOrderItemInput[];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Itens do pedido inválidos." };
  }

  if (!Array.isArray(items) || items.length === 0) return { error: "Adicione ao menos um produto ao pedido." };
  for (const item of items) {
    if (!item.productId || !item.productName || !(item.quantity > 0) || !(item.unitPrice >= 0)) {
      return { error: "Verifique os produtos, quantidades e preços informados." };
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = Math.max(0, subtotal + shippingCost - discount);

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: profileId,
      customer_name: profileId ? null : customerName || null,
      customer_phone: profileId ? null : customerPhone || null,
      status,
      origin: "manual",
      subtotal,
      shipping_cost: shippingCost,
      discount,
      total,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      notes,
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: orderError?.message ?? "Erro ao criar pedido." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
      customization: item.customization ?? null,
    })),
  );

  if (itemsError) return { error: itemsError.message };

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  redirect(`/admin/pedidos/${order.id}`);
}
