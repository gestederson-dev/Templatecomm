"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/storage";

export type ActionState = { error: string } | undefined;

export async function createBannerAction(formData: FormData): Promise<ActionState> {
  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();

  if (!file || file.size === 0) return { error: "Selecione uma imagem." };

  const supabase = await createClient();
  const path = `${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from("banners").upload(path, file);
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("banners").getPublicUrl(path);

  const { count } = await supabase.from("banners").select("id", { count: "exact", head: true });

  const { error } = await supabase.from("banners").insert({
    title: title || null,
    image_url: publicUrl,
    link: link || null,
    sort_order: count ?? 0,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return undefined;
}

export async function toggleBannerActiveAction(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("banners").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBannerAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
