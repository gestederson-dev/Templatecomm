"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConfirmationByToken, LOGO_BUCKET, type OrderConfirmation } from "@/lib/confirmations";
import { MAX_ARTS, validateArtPaths, validateConfirmationInput, validateLogo } from "@/lib/validators/confirmacao";
import { sanitizeFileName } from "@/lib/storage";
import { getSiteSettings } from "@/lib/catalog";
import { sendEmail } from "@/lib/email/send";
import { confirmationReceivedEmail } from "@/lib/email/templates";
import { formatBRL } from "@/lib/format";

// O cliente não tem login: tudo aqui roda com service_role, sempre depois de conferir o token.

export type ConfirmationState = { error: string } | { success: true } | undefined;
export type PreparedUpload = { path: string; token: string };

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://salmarbrindes.com.br";

/**
 * Passo 1 do envio de arte: devolve um link assinado por arquivo para o navegador
 * mandar direto ao Storage (sem passar pelo limite de 4,5 MB da Vercel).
 */
export async function prepareArtUploadsAction(
  token: string,
  files: { name: string; size: number }[],
): Promise<{ uploads: PreparedUpload[] } | { error: string }> {
  const confirmation = await getConfirmationByToken(token);
  if (!confirmation || confirmation.status === "cancelado") return { error: "Este link não está mais disponível. Fale com a Salmar." };
  if (!Array.isArray(files) || files.length === 0) return { error: "Selecione ao menos um arquivo." };
  if (files.length + confirmation.logo_paths.length > MAX_ARTS) return { error: `Você pode enviar até ${MAX_ARTS} artes.` };

  for (const file of files) {
    const problem = validateLogo(String(file.name), Number(file.size));
    if (problem) return { error: `${file.name}: ${problem}` };
  }

  const storage = createAdminClient().storage.from(LOGO_BUCKET);
  const now = Date.now();
  const uploads: PreparedUpload[] = [];
  for (const [index, file] of files.entries()) {
    const path = `${confirmation.id}/${now + index}-${sanitizeFileName(file.name)}`;
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[confirmacao] falha ao preparar upload:", error?.message);
      return { error: "Não conseguimos preparar o envio. Tente de novo em alguns minutos." };
    }
    uploads.push({ path, token: data.token });
  }
  return { uploads };
}

/** Confere no Storage que cada arte que o navegador diz ter enviado chegou mesmo. */
async function confirmUploaded(confirmation: OrderConfirmation, raw: unknown): Promise<{ ok: true; paths: string[] } | { ok: false; error: string }> {
  const parsed = validateArtPaths(raw, confirmation.id, confirmation.logo_paths.length);
  if (!parsed.ok || parsed.paths.length === 0) return parsed;
  const { data } = await createAdminClient().storage.from(LOGO_BUCKET).list(confirmation.id, { limit: 100 });
  const stored = new Set((data ?? []).map((file) => `${confirmation.id}/${file.name}`));
  if (parsed.paths.some((path) => !stored.has(path))) return { ok: false, error: "Alguma arte não terminou de enviar. Tente anexar de novo." };
  return parsed;
}

function parseJson(value: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(value ?? "[]"));
  } catch {
    return null;
  }
}

export async function submitConfirmationAction(token: string, _prev: ConfirmationState, formData: FormData): Promise<ConfirmationState> {
  const confirmation = await getConfirmationByToken(token);
  if (!confirmation || confirmation.status !== "pendente") return { error: "Este link não está mais disponível. Fale com a Salmar." };

  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") fields[key] = value;
  }

  const parsed = validateConfirmationInput(
    fields,
    confirmation.payment_options.map((option) => option.id),
  );
  if (!parsed.ok) return { error: parsed.error };

  const arts = await confirmUploaded(confirmation, parseJson(formData.get("artPaths")));
  if (!arts.ok) return { error: arts.error };
  const artLater = formData.get("artLater") === "on";
  if (arts.paths.length === 0 && !artLater) return { error: "Anexe a arte ou marque que vai enviar depois." };

  const data = parsed.data;
  const supabase = createAdminClient();
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
      logo_paths: arts.paths,
      logo_path: arts.paths[0] ?? null,
      art_later: arts.paths.length === 0,
      customer_message: data.customerMessage,
      responded_at: new Date().toISOString(),
    })
    .eq("id", confirmation.id)
    .eq("status", "pendente") // evita gravar duas vezes se o cliente clicar de novo
    .select("id");

  if (updateError || !updated?.length) {
    if (updateError) console.error("[confirmacao] falha ao salvar resposta:", updateError.message);
    return { error: updateError ? "Não conseguimos salvar seus dados. Tente de novo em alguns minutos." : "Este pedido já foi confirmado." };
  }

  const pagamento = confirmation.payment_options.find((option) => option.id === data.paymentChoice);

  // mantém o pedido e o orçamento de origem em dia com o que o cliente respondeu
  if (confirmation.order_id && pagamento) {
    await supabase.from("orders").update({ payment_method: pagamento.label }).eq("id", confirmation.order_id).is("payment_method", null);
  }
  if (confirmation.quote_id) {
    await supabase.from("quotes").update({ status: "approved" }).eq("id", confirmation.quote_id).eq("status", "quoted");
  }

  const settings = await getSiteSettings();
  if (settings?.contact_email) {
    const endereco = data.wantsInvoice
      ? `${data.street}, ${data.number}${data.complement ? ` (${data.complement})` : ""} - ${data.district}, ${data.city}/${data.state}, CEP ${data.cep}`
      : "";
    const lines: [string, string][] = [
      ...(pagamento ? ([["Pagamento", `${pagamento.label} (${formatBRL(pagamento.amount)})`]] as [string, string][]) : []),
      ["Nota fiscal", data.wantsInvoice ? "Sim" : "Não"],
      ["Nome", data.contactName],
      ["Telefone", data.contactPhone],
      ["E-mail", data.contactEmail],
      ...(data.wantsInvoice
        ? ([
            ["CPF/CNPJ", data.document ?? ""],
            ["Endereço", endereco],
          ] as [string, string][])
        : []),
      ["Artes", arts.paths.length ? `${arts.paths.length} arquivo(s)` : "vai enviar depois"],
      ...(data.customerMessage ? ([["Observações", data.customerMessage]] as [string, string][]) : []),
    ];
    const email = confirmationReceivedEmail(confirmation.customer_label, lines, `${site()}/admin/confirmacoes`);
    await sendEmail(settings.contact_email, email.subject, email.html);
  }

  return { success: true };
}

/** Depois de confirmar, o cliente pode mandar mais artes pela mesma página. */
export async function addArtsAction(token: string, rawPaths: string[]): Promise<{ ok: true } | { error: string }> {
  const confirmation = await getConfirmationByToken(token);
  if (!confirmation || confirmation.status !== "respondido") return { error: "Este link não está mais disponível. Fale com a Salmar." };

  const arts = await confirmUploaded(confirmation, rawPaths);
  if (!arts.ok) return { error: arts.error };
  if (arts.paths.length === 0) return { error: "Selecione ao menos um arquivo." };

  const paths = [...confirmation.logo_paths, ...arts.paths];
  const { error } = await createAdminClient()
    .from("order_confirmations")
    .update({ logo_paths: paths, logo_path: paths[0], art_later: false })
    .eq("id", confirmation.id);
  if (error) {
    console.error("[confirmacao] falha ao anexar arte:", error.message);
    return { error: "Não conseguimos salvar as artes. Tente de novo em alguns minutos." };
  }

  const settings = await getSiteSettings();
  if (settings?.contact_email) {
    const email = confirmationReceivedEmail(
      confirmation.customer_label,
      [["Novas artes", String(arts.paths.length)]],
      `${site()}/admin/confirmacoes`,
      "nova-arte",
    );
    await sendEmail(settings.contact_email, email.subject, email.html);
  }

  revalidatePath(`/confirmar/${token}`);
  return { ok: true };
}
