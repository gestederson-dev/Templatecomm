"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | undefined;

export async function createFiadoCustomerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do cliente." };

  const phone = String(formData.get("phone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = amountRaw ? Number(amountRaw) : null;
  const delivered = formData.get("delivered") === "on";

  if (amount != null && amount > 0 && !description) {
    return { error: "Descreva o que foi vendido pra lançar a cobrança inicial." };
  }

  const supabase = await createClient();
  const { data: customer, error } = await supabase.from("fiado_customers").insert({ name, phone, notes }).select("id").single();
  if (error || !customer) return { error: error?.message ?? "Erro ao criar cliente." };

  if (amount != null && amount > 0) {
    const { error: chargeError } = await supabase.from("fiado_charges").insert({ customer_id: customer.id, description, amount, delivered });
    if (chargeError) return { error: chargeError.message };
  }

  revalidatePath("/admin/fiado");
  redirect(`/admin/fiado/${customer.id}`);
}

export async function updateFiadoCustomerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: "Cliente não encontrado." };
  if (!name) return { error: "Informe o nome do cliente." };

  const phone = String(formData.get("phone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("fiado_customers").update({ name, phone, notes }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/fiado/${id}`);
  revalidatePath("/admin/fiado");
  return undefined;
}

export async function addFiadoChargeAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const customerId = String(formData.get("customerId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const delivered = formData.get("delivered") === "on";
  const occurredAt = String(formData.get("occurredAt") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!customerId) return { error: "Cliente não encontrado." };
  if (!description || !(amount > 0)) return { error: "Informe a descrição e um valor maior que zero." };

  const supabase = await createClient();
  const { error } = await supabase.from("fiado_charges").insert({
    customer_id: customerId,
    description,
    amount,
    delivered,
    ...(occurredAt ? { occurred_at: occurredAt } : {}),
    notes,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/fiado/${customerId}`);
  revalidatePath("/admin/fiado");
  return undefined;
}

export async function addFiadoPaymentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const customerId = String(formData.get("customerId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const paidAt = String(formData.get("paidAt") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!customerId) return { error: "Cliente não encontrado." };
  if (!(amount > 0)) return { error: "Informe um valor de pagamento maior que zero." };

  const supabase = await createClient();
  const { error } = await supabase.from("fiado_payments").insert({
    customer_id: customerId,
    amount,
    ...(paidAt ? { paid_at: paidAt } : {}),
    notes,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/fiado/${customerId}`);
  revalidatePath("/admin/fiado");
  return undefined;
}

export async function toggleChargeDeliveredAction(chargeId: string, delivered: boolean): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase.from("fiado_charges").update({ delivered }).eq("id", chargeId).select("customer_id").single();
  revalidatePath("/admin/fiado");
  if (data?.customer_id) revalidatePath(`/admin/fiado/${data.customer_id}`);
}

export async function deleteFiadoChargeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("fiado_charges").delete().eq("id", id);

  revalidatePath(`/admin/fiado/${customerId}`);
  revalidatePath("/admin/fiado");
}

export async function deleteFiadoPaymentAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("fiado_payments").delete().eq("id", id);

  revalidatePath(`/admin/fiado/${customerId}`);
  revalidatePath("/admin/fiado");
}

export async function deleteFiadoCustomerAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("fiado_customers").delete().eq("id", id);

  revalidatePath("/admin/fiado");
  redirect("/admin/fiado");
}
