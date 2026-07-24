import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { melhorEnvioBaseUrl } from "@/lib/shipping/melhor-envio-token";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não definida.`);
  return value;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Só admin pode iniciar a autorização — inicia o fluxo OAuth do Melhor Envio. */
export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl()}/admin/login`);

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.redirect(`${siteUrl()}/`);

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${siteUrl()}/api/integrations/melhor-envio/callback`;

  const authorizeUrl = new URL("/oauth/authorize", melhorEnvioBaseUrl());
  authorizeUrl.searchParams.set("client_id", requireEnv("MELHOR_ENVIO_CLIENT_ID"));
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "shipping-calculate");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set("melhor_envio_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
