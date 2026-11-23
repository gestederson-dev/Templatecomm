"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getConfirmationByToken, LOGO_BUCKET } from "@/lib/confirmations";
import { validateConfirmationInput, validateLogo } from "@/lib/validators/confirmacao";
import { sanitizeFileName } from "@/lib/storage";
import { getSiteSettings } from "@/lib/catalog";
import { sendEmail } from "@/lib/email/send";
import { confirmationReceivedEmail } from "@/lib/email/templates";
import { formatBRL } from "@/lib/format";

export type ConfirmationState = { error: string } | { success: true } | undefined;

export async function submitConfirmationAction(token: string, _prev: ConfirmationState, formData: FormData): Promise<ConfirmationState> {
  const confirmation = await getConfirmationByToken(token);
  if (!confirmation || confirmation.status !== "pendente") return { error: "Este link não está mais disponível. Fale com a Salmar." };

  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") fields[key] = value;
  }

  const parsed = validateConfirmationInput(fields, confirmation.payment_options.map((option) => option.id));
  if (!parsed.ok) return { error: parsed.error };

  const logo = formData.get("logo");
  if (!(logo instanceof File)) return { error: "Anexe a logo para a personalização." };
  const logoError = validateLogo(logo.name, logo.size);
  if (logoError) return { error: logoError };

  const supabase = createAdminClient();
  const path = `${confirmation.id}/${Date.now()}-${sanitizeFileName(logo.name)}`;
  const { error: uploadError } = await supabase.storage.from(LOGO_BUCKET).upload(path, logo, { contentType: logo.type || undefined });
  if (uploadError) {
    console.error("[confirmacao] falha no upload da logo:", uploadError.message);
    return { error: "Não conseguimos receber a logo. Tente de novo em alguns minutos." };
  }

  const data = parsed.data;
  const { data: updated, error: updateError } = await supabase
    .from("order_confirmations")
    .update({
      status: "respondido",
      payment_choice: data.paymentChoice,
      wants_invoice: data.wantsInvoice,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      document: data.document,
      cep: data.cep,
      street: data.street,
      number: data.number,
      complement: data.complement,
      district: data.district,
      city: data.city,
      state: data.state,
      logo_path: path,
      customer_message: data.customerMessage,
      responded_at: new Date().toISOString(),
    })
    .eq("id", confirmation.id)
    .eq("status", "pendente") // evita gravar duas vezes se o cliente clicar de novo
    .select("id");

  if (updateError || !updated?.length) {
    await supabase.storage.from(LOGO_BUCKET).remove([path]);
    if (updateError) console.error("[confirmacao] falha ao salvar resposta:", updateError.message);
    return { error: updateError ? "Não conseguimos salvar seus dados. Tente de novo em alguns minutos." : "Este pedido já foi confirmado." };
  }

  const settings = await getSiteSettings();
  if (settings?.contact_email) {
    const pagamento = confirmation.payment_options.find((option) => option.id === data.paymentChoice);
    const endereco = data.wantsInvoice
      ? `${data.street}, ${data.number}${data.complement ? ` (${data.complement})` : ""} - ${data.district}, ${data.city}/${data.state}, CEP ${data.cep}`
      : "";
    const lines: [string, string][] = [
      ["Pagamento", pagamento ? `${pagamento.label} (${formatBRL(pagamento.amount)})` : data.paymentChoice],
      ["Nota fiscal", data.wantsInvoice ? "Sim" : "Não"],
      ["Nome", data.contactName],
      ["Telefone", data.contactPhone],
      ["E-mail", data.contactEmail],
      ...(data.wantsInvoice ? ([["CPF/CNPJ", data.document ?? ""], ["Endereço", endereco]] as [string, string][]) : []),
      ...(data.customerMessage ? ([["Observações", data.customerMessage]] as [string, string][]) : []),
    ];
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://salmarbrindes.com.br";
    const email = confirmationReceivedEmail(confirmation.customer_label, lines, `${site}/admin/confirmacoes`);
    await sendEmail(settings.contact_email, email.subject, email.html);
  }

  return { success: true };
}
