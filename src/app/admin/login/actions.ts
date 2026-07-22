"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validators/auth";

export type AdminAuthState = { error: string } | undefined;

export async function adminSignInAction(_prevState: AdminAuthState, formData: FormData): Promise<AdminAuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "E-mail ou senha inválidos." };
  }

  // decide o destino aqui mesmo em vez de deixar o proxy corrigir depois —
  // evita um redirect-dentro-de-redirect durante navegação client-side, que
  // deixa a barra de endereço mostrando /admin mesmo quando o conteúdo real
  // já é outra página.
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  redirect(profile?.role === "admin" ? "/admin" : "/");
}
