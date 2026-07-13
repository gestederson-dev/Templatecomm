import "server-only";
import { Resend } from "resend";

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "Salmar Brindes <onboarding@resend.dev>";
}

/**
 * Envio best-effort: nunca lança. Uma falha de e-mail não pode derrubar um
 * webhook de pagamento ou uma ação do admin — só registra no log do servidor.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY não configurada — e-mail "${subject}" para ${to} não enviado.`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: fromAddress(), to, subject, html });
  } catch (error) {
    console.error(`[email] falha ao enviar "${subject}" para ${to}:`, error);
  }
}
