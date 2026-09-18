import { NextResponse, type NextRequest } from "next/server";
import { forceRefreshToken } from "@/lib/shipping/melhor-envio-token";

/**
 * Vercel Cron (vercel.json), toda semana: renova o token do Melhor Envio pra ele não
 * expirar em semanas sem venda. A Vercel manda `Authorization: Bearer $CRON_SECRET`;
 * sem a env var configurada a rota recusa tudo.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await forceRefreshToken();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[melhor-envio] renovação agendada falhou:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
