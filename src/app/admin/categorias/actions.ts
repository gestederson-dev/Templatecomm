"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | undefined;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveCategoryAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get("id");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Informe o nome da categoria." };

  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const parentId = String(formData.get("parentId") ?? "") || null;

  const payload = {
    name,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    parent_id: parentId,
    sort_order: Number(formData.get("sortOrder") ?? 0) || 0,
  };

  const supabase = await createClient();

  const { error } = id ? await supabase.from("categories").update(payload).eq("id", String(id)) : await supabase.from("categories").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  return undefined;
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("categories").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/categorias");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  // produtos e subcategorias não são apagados — só perdem a referência
  // (category_id/parent_id viram null, via ON DELETE SET NULL no schema).
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
