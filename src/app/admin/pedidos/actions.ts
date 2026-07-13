"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type ActionState = { error: string } | undefined;

export async function updateOrderStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const trackingCode = String(formData.get("trackingCode") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, tracking_code: trackingCode || null })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  return undefined;
}
