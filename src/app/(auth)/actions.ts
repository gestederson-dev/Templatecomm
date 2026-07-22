"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, newPasswordSchema, signInSchema, signUpSchema } from "@/lib/validators/auth";

export type AuthActionState = { error: string } | undefined;
export type PasswordActionState = { error: string } | { success: true } | undefined;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUpAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const personType = formData.get("personType") === "pj" ? "pj" : "pf";

  const parsed = signUpSchema.safeParse({
    personType,
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    cpf: formData.get("cpf"),
    cnpj: formData.get("cnpj"),
    companyName: formData.get("companyName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=/conta`,
      data: {
        full_name: data.fullName,
        phone: data.phone ? onlyDigits(data.phone) : null,
        person_type: data.personType,
        cpf: data.personType === "pf" ? onlyDigits(data.cpf) : null,
        cnpj: data.personType === "pj" ? onlyDigits(data.cnpj) : null,
        company_name: data.personType === "pj" ? data.companyName : null,
      },
    },
  });

  if (error) {
    return { error: error.message === "User already registered" ? "Este e-mail já está cadastrado." : error.message };
  }

  redirect("/cadastro/verifique-seu-email");
}

export async function signInAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/conta");
}

export async function forgotPasswordAction(_prevState: PasswordActionState, formData: FormData): Promise<PasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    // o link de recuperação do Supabase entrega a sessão via fragmento da URL
    // (#access_token=...), não como query param — por isso aponta direto pra
    // cá, uma página client, em vez de passar pela rota /auth/confirm (que só
    // lê query params e nunca veria o fragmento).
    redirectTo: `${siteUrl()}/redefinir-senha`,
  });

  // não revela se o e-mail existe ou não na base
  return { success: true };
}

export async function resetPasswordAction(_prevState: PasswordActionState, formData: FormData): Promise<PasswordActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Link expirado ou inválido. Solicite a redefinição novamente." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/login?redefinida=1");
}
