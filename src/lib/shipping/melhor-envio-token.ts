import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const PROVIDER = "melhor_envio";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não definida.`);
  }
  return value;
}

export function melhorEnvioBaseUrl(): string {
  return process.env.MELHOR_ENVIO_BASE_URL ?? "https://sandbox.melhorenvio.com.br";
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number; // segundos
};

async function exchangeToken(body: Record<string, string>): Promise<TokenResponse> {
  const form = new URLSearchParams(body);
  const response = await fetch(`${melhorEnvioBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Melhor Envio oauth/token respondeu ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

/** Troca o `code` do callback OAuth pelos tokens iniciais e salva no banco. */
export async function saveInitialToken(code: string, redirectUri: string): Promise<void> {
  const tokens = await exchangeToken({
    grant_type: "authorization_code",
    client_id: requireEnv("MELHOR_ENVIO_CLIENT_ID"),
    client_secret: requireEnv("MELHOR_ENVIO_CLIENT_SECRET"),
    redirect_uri: redirectUri,
    code,
  });

  await persistToken(tokens);
}

async function persistToken(tokens: TokenResponse): Promise<void> {
  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { error } = await supabase.from("shipping_provider_tokens").upsert({
    provider: PROVIDER,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Falha ao salvar token do Melhor Envio: ${error.message}`);
}

/** Retorna um access_token válido, renovando via refresh_token se estiver perto de expirar. */
export async function getValidAccessToken(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("shipping_provider_tokens").select("*").eq("provider", PROVIDER).maybeSingle();

  if (error) throw new Error(`Falha ao ler token do Melhor Envio: ${error.message}`);
  if (!data) throw new Error("Melhor Envio não autorizado ainda — conecte em Configurações.");

  // renova com 5 min de folga antes de expirar de verdade
  const expiresAt = new Date(data.expires_at).getTime();
  if (expiresAt - Date.now() > 5 * 60 * 1000) {
    return data.access_token;
  }

  const tokens = await exchangeToken({
    grant_type: "refresh_token",
    refresh_token: data.refresh_token,
    client_id: requireEnv("MELHOR_ENVIO_CLIENT_ID"),
    client_secret: requireEnv("MELHOR_ENVIO_CLIENT_SECRET"),
  });

  await persistToken(tokens);
  return tokens.access_token;
}
