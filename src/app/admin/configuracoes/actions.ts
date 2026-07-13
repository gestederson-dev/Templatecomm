"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | { success: true } | undefined;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** primary_color/secondary_color vão direto para um <style> (ThemeInjector) — nunca aceitar algo que não seja #rrggbb. */
function safeHexColor(value: FormDataEntryValue | null, fallback: string): string {
  const text = String(value ?? "");
  return HEX_COLOR.test(text) ? text : fallback;
}

export async function saveSiteSettingsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const payload = {
    site_name: String(formData.get("siteName") ?? "").trim() || "Salmar Brindes",
    primary_color: safeHexColor(formData.get("primaryColor"), "#1e40af"),
    secondary_color: safeHexColor(formData.get("secondaryColor"), "#f59e0b"),
    contact_email: String(formData.get("contactEmail") ?? "").trim() || null,
    contact_phone: String(formData.get("contactPhone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    store_cnpj: String(formData.get("storeCnpj") ?? "").trim() || null,
    social_links: {
      instagram: String(formData.get("instagram") ?? "").trim(),
      facebook: String(formData.get("facebook") ?? "").trim(),
    },
    store_address: {
      street: String(formData.get("addressStreet") ?? "").trim(),
      city: String(formData.get("addressCity") ?? "").trim(),
      state: String(formData.get("addressState") ?? "").trim(),
      cep: String(formData.get("addressCep") ?? "").trim(),
    },
    policies: {
      sobre: String(formData.get("policySobre") ?? "").trim(),
      trocas: String(formData.get("policyTrocas") ?? "").trim(),
      privacidade: String(formData.get("policyPrivacidade") ?? "").trim(),
      termos: String(formData.get("policyTermos") ?? "").trim(),
    },
  };

  const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  return { success: true };
}

export async function uploadLogoAction(formData: FormData): Promise<{ error: string } | { url: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };

  const supabase = await createClient();
  const path = `logo-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("site-assets").getPublicUrl(path);

  const { error } = await supabase.from("site_settings").update({ logo_url: publicUrl }).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  return { url: publicUrl };
}
