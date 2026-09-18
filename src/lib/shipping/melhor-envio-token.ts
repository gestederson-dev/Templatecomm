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

type StoredToken = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
};

/** Loja sem conexão válida com o Melhor Envio — só resolve com "Conectar" em Configurações. */
export class MelhorEnvioNotConnectedError extends Error {
  constructor() {
    super("Melhor Envio desconectado — reconecte em Configurações.");
  }
}

/** oauth/token recusou o próprio token (expirado/revogado), não a configuração do app. */
class RejectedTokenError extends Error {}

function isRejectedToken(body: string): boolean {
  // invalid_client (credencial do app errada) e 5xx (instabilidade) ficam de fora:
  // nesses casos o token salvo ainda pode ser bom e não deve ser descartado.
  try {
    const { error } = JSON.parse(body) as { error?: string };
    return error === "invalid_grant" || error === "invalid_request";
  } catch {
    return false;
  }
}

async function exchangeToken(body: Record<string, string>): Promise<TokenResponse> {
  // API roda em Laravel Passport e espera multipart/form-data no /oauth/token
  // (confirmado na SDK de referência) — urlencoded falha com "invalid_client".
  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    form.append(key, value);
  }

  const response = await fetch(`${melhorEnvioBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    const message = `Melhor Envio oauth/token respondeu ${response.status}: ${text}`;
    throw isRejectedToken(text) ? new RejectedTokenError(message) : new Error(message);
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

async function readToken(): Promise<StoredToken | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipping_provider_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("provider", PROVIDER)
    .maybeSingle();

  if (error) throw new Error(`Falha ao ler token do Melhor Envio: ${error.message}`);
  return data;
}

async function refresh(current: StoredToken): Promise<string> {
  try {
    const tokens = await exchangeToken({
      grant_type: "refresh_token",
      refresh_token: current.refresh_token,
      client_id: requireEnv("MELHOR_ENVIO_CLIENT_ID"),
      client_secret: requireEnv("MELHOR_ENVIO_CLIENT_SECRET"),
    });

    await persistToken(tokens);
    return tokens.access_token;
  } catch (error) {
    if (!(error instanceof RejectedTokenError)) throw error;

    // refresh_token é de uso único: se outra request renovou ao mesmo tempo, o nosso
    // já foi consumido — usa o que ela salvou em vez de derrubar a conexão.
    const latest = await readToken();
    if (latest && latest.refresh_token !== current.refresh_token) return latest.access_token;

    // Morto de verdade (o Melhor Envio expira o refresh_token depois de semanas sem uso).
    // Apaga pra Configurações parar de mostrar "Conectado" e pedir reconexão.
    console.error("[melhor-envio] refresh_token recusado, removendo conexão:", error.message);
    const { error: deleteError } = await createAdminClient()
      .from("shipping_provider_tokens")
      .delete()
      .eq("provider", PROVIDER)
      .eq("refresh_token", current.refresh_token);
    if (deleteError) console.error("[melhor-envio] falha ao remover token morto:", deleteError.message);

    throw new MelhorEnvioNotConnectedError();
  }
}

/** Retorna um access_token válido, renovando via refresh_token se estiver perto de expirar. */
export async function getValidAccessToken(): Promise<string> {
  const current = await readToken();
  if (!current) throw new MelhorEnvioNotConnectedError();

  // renova com 5 min de folga antes de expirar de verdade
  const expiresAt = new Date(current.expires_at).getTime();
  if (expiresAt - Date.now() > 5 * 60 * 1000) {
    return current.access_token;
  }

  return refresh(current);
}

/**
 * Renova mesmo com o access_token ainda válido. Chamado pelo cron semanal: sem isso,
 * semanas sem nenhum cálculo de frete deixam o refresh_token expirar e o checkout para.
 */
export async function forceRefreshToken(): Promise<void> {
  const current = await readToken();
  if (!current) throw new MelhorEnvioNotConnectedError();
  await refresh(current);
}
