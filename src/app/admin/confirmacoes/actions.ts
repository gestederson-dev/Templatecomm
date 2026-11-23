"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/storage";
import { validateDraft } from "@/lib/confirmation-draft";

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
