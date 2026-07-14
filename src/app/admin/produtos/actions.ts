"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function saveProductAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get("id");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Informe o nome do produto." };

  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const basePriceRaw = String(formData.get("basePrice") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || null;

  const dimensionsRaw = String(formData.get("dimensions") ?? "").trim();
  const dimensionsMatch = dimensionsRaw.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)$/i);
  const dimensions = dimensionsMatch
    ? {
        altura: Number(dimensionsMatch[1].replace(",", ".")),
        largura: Number(dimensionsMatch[2].replace(",", ".")),
        comprimento: Number(dimensionsMatch[3].replace(",", ".")),
      }
    : null;

  const payload = {
    name,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    category_id: categoryId,
    base_price: basePriceRaw ? Number(basePriceRaw) : null,
    sku: String(formData.get("sku") ?? "").trim() || null,
    stock_quantity: Number(formData.get("stockQuantity") ?? 0) || 0,
    weight_grams: Number(formData.get("weightGrams") ?? 0) || 0,
    dimensions,
    allow_direct_sale: formData.get("allowDirectSale") === "on",
    allow_quote: formData.get("allowQuote") === "on",
    min_quote_quantity: Number(formData.get("minQuoteQuantity") ?? 1) || 1,
    is_featured: formData.get("isFeatured") === "on",
    is_active: formData.get("isActive") === "on",
  };

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", String(id));
    if (error) return { error: error.message };
    revalidatePath(`/admin/produtos/${id}`);
    revalidatePath("/admin/produtos");
    return undefined;
  }

  const { data, error } = await supabase.from("products").insert(payload).select("id").single();
  if (error) return { error: error.message };

  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${data.id}`);
}

export async function toggleProductActiveAction(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/produtos");
}

export async function uploadProductImageAction(productId: string, formData: FormData): Promise<ActionState> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };

  const supabase = await createClient();
  const path = `${productId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);

  const { count } = await supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    url: publicUrl,
    is_primary: (count ?? 0) === 0,
    sort_order: count ?? 0,
  });
  if (insertError) return { error: insertError.message };

  revalidatePath(`/admin/produtos/${productId}`);
  return undefined;
}

export async function deleteProductImageAction(imageId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("product_images").delete().eq("id", imageId);
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function setPrimaryImageAction(imageId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function addCustomizationOptionAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "text");
  const optionsRaw = String(formData.get("options") ?? "").trim();

  if (!name) return { error: "Informe o nome da opção." };

  const supabase = await createClient();
  const { error } = await supabase.from("product_customization_options").insert({
    product_id: productId,
    name,
    type,
    options: optionsRaw ? optionsRaw.split(",").map((v) => v.trim()).filter(Boolean) : null,
    required: formData.get("required") === "on",
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/produtos/${productId}`);
  return undefined;
}

export async function toggleCustomizationRequiredAction(optionId: string, productId: string, required: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("product_customization_options").update({ required }).eq("id", optionId);
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function deleteCustomizationOptionAction(optionId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("product_customization_options").delete().eq("id", optionId);
  revalidatePath(`/admin/produtos/${productId}`);
}

export async function addPriceTierAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const minQuantity = Number(formData.get("minQuantity") ?? 0);
  const maxQuantityRaw = String(formData.get("maxQuantity") ?? "").trim();
  const unitPrice = Number(formData.get("unitPrice") ?? 0);

  if (!minQuantity || !unitPrice) return { error: "Informe quantidade mínima e preço." };

  const supabase = await createClient();
  const { error } = await supabase.from("price_tiers").insert({
    product_id: productId,
    min_quantity: minQuantity,
    max_quantity: maxQuantityRaw ? Number(maxQuantityRaw) : null,
    unit_price: unitPrice,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/produtos/${productId}`);
  return undefined;
}

export async function deletePriceTierAction(tierId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("price_tiers").delete().eq("id", tierId);
  revalidatePath(`/admin/produtos/${productId}`);
}
