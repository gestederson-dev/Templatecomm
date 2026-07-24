import { NextResponse, type NextRequest } from "next/server";
import { saveInitialToken } from "@/lib/shipping/melhor-envio-token";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get("melhor_envio_oauth_state")?.value;

  const settingsUrl = new URL("/admin/configuracoes", siteUrl());

  if (!code || !state || !cookieState || state !== cookieState) {
    settingsUrl.searchParams.set("melhor_envio", "erro");
    return NextResponse.redirect(settingsUrl.toString());
  }

  try {
    const redirectUri = `${siteUrl()}/api/integrations/melhor-envio/callback`;
    await saveInitialToken(code, redirectUri);
    settingsUrl.searchParams.set("melhor_envio", "conectado");
  } catch (error) {
    console.error("[melhor-envio] falha ao trocar code por token:", error);
    settingsUrl.searchParams.set("melhor_envio", "erro");
  }

  const response = NextResponse.redirect(settingsUrl.toString());
  response.cookies.delete("melhor_envio_oauth_state");
  return response;
}
