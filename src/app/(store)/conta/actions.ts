"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { enderecoSchema } from "@/lib/validators/endereco";

export type ActionState = { error: string } | { success: true } | undefined;

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user.id;
}

export async function updateProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (fullName.length < 2) {
    return { error: "Informe seu nome." };
  }

  const supabase = await createClient();
  const userId = await requireUserId();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone ? phone.replace(/\D/g, "") : null })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/conta");
  return { success: true };
}

export async function saveAddressAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = enderecoSchema.safeParse({
    label: formData.get("label"),
    cep: formData.get("cep"),
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement"),
    district: formData.get("district"),
    city: formData.get("city"),
    state: formData.get("state"),
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const addressId = formData.get("addressId");
  const supabase = await createClient();
  const userId = await requireUserId();
  const data = parsed.data;

  if (data.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("profile_id", userId);
  }

  const payload = {
    profile_id: userId,
    label: data.label ?? null,
    cep: data.cep,
    street: data.street,
    number: data.number ?? null,
    complement: data.complement ?? null,
    district: data.district ?? null,
    city: data.city,
    state: data.state,
    is_default: data.isDefault ?? false,
  };

  const { error } = addressId ? await supabase.from("addresses").update(payload).eq("id", String(addressId)) : await supabase.from("addresses").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/conta/enderecos");
  return { success: true };
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return;

  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", addressId);

  revalidatePath("/conta/enderecos");
}
