"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserEmail } from "@/lib/email/get-user-email";
import { orderShippedEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import type { OrderStatus } from "@/lib/types";

export type ActionState = { error: string } | undefined;

export async function updateOrderStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim();

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status, tracking_code: trackingCode || null })
    .eq("id", id)
    .select("order_number, profile_id")
    .single();

  if (error) return { error: error.message };

  if (status === "shipped" && order.profile_id) {
    const email = await getUserEmail(order.profile_id);
    if (email) {
      const { subject, html } = orderShippedEmail(order.order_number, trackingCode || null);
      await sendEmail(email, subject, html);
    }
  }

  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  return undefined;
}
