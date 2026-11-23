import { validarCNPJ, validarCPF } from "./documento";

/** Bucket privado das artes (aqui e não em lib/confirmations porque o navegador também usa). */
export const LOGO_BUCKET = "order-confirmation-logos";

/** Extensões aceitas pra logo: imagem comum + arquivos de gráfica (vetor/PDF). */
export const LOGO_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg", "pdf", "ai", "eps", "cdr"];
// a arte vai direto do navegador para o Storage (link assinado), então não passa pelo limite de 4,5 MB da Vercel
export const LOGO_MAX_BYTES = 25 * 1024 * 1024;
export const MAX_ARTS = 6;

export type ConfirmationInput = {
  paymentChoice: string | null;
  wantsInvoice: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  document: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  customerMessage: string | null;
};

type Result = { ok: true; data: ConfirmationInput } | { ok: false; error: string };

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/**
 * Valida o que o cliente preencheu. Endereço e CPF/CNPJ só são obrigatórios
 * quando ele pede nota fiscal; nome, telefone e e-mail sempre.
 */
export function validateConfirmationInput(fields: Record<string, string | undefined>, paymentIds: string[]): Result {
  const get = (key: string) => (fields[key] ?? "").trim();

  // compra feita no site já vem paga: a confirmação não tem opções de pagamento
  const paymentChoice = paymentIds.length === 0 ? null : get("paymentChoice");
  if (paymentChoice !== null && !paymentIds.includes(paymentChoice)) return { ok: false, error: "Escolha a forma de pagamento." };

  const invoice = get("wantsInvoice");
  if (invoice !== "sim" && invoice !== "nao") return { ok: false, error: "Diga se você precisa de nota fiscal." };
  const wantsInvoice = invoice === "sim";

  const contactName = get("contactName");
  if (contactName.length < 3) return { ok: false, error: "Informe o nome ou a razão social." };

  const contactPhone = onlyDigits(get("contactPhone"));
  if (contactPhone.length < 10 || contactPhone.length > 11) return { ok: false, error: "Informe um telefone com DDD." };

  const contactEmail = get("contactEmail").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return { ok: false, error: "Informe um e-mail válido." };

  const customerMessage = get("customerMessage") || null;

  if (!wantsInvoice) {
    return {
      ok: true,
      data: {
        paymentChoice,
        wantsInvoice,
        contactName,
        contactPhone,
        contactEmail,
        customerMessage,
        document: null,
        cep: null,
        street: null,
        number: null,
        complement: null,
        district: null,
        city: null,
        state: null,
      },
    };
  }

  const document = onlyDigits(get("document"));
  const documentOk = document.length === 11 ? validarCPF(document) : document.length === 14 ? validarCNPJ(document) : false;
  if (!documentOk) return { ok: false, error: "CPF ou CNPJ inválido." };

  const cep = onlyDigits(get("cep"));
  if (cep.length !== 8) return { ok: false, error: "Informe um CEP válido." };

  const street = get("street");
  const number = get("number");
  const district = get("district");
  const city = get("city");
  const state = get("state").toUpperCase();
  if (!street || !number || !district || !city) return { ok: false, error: "Preencha o endereço completo: rua, número, bairro e cidade." };
  if (!/^[A-Z]{2}$/.test(state)) return { ok: false, error: "Informe a UF com 2 letras." };

  return {
    ok: true,
    data: {
      paymentChoice,
      wantsInvoice,
      contactName,
      contactPhone,
      contactEmail,
      customerMessage,
      document,
      cep,
      street,
      number,
      complement: get("complement") || null,
      district,
      city,
      state,
    },
  };
}

/** Confere nome e tamanho da logo; o conteúdo em si a gente não interpreta, só guarda. */
export function validateLogo(fileName: string, size: number): string | null {
  if (size === 0) return "Anexe a logo para a personalização.";
  if (size > LOGO_MAX_BYTES) return "Cada arte pode ter no máximo 25 MB.";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!LOGO_EXTENSIONS.includes(ext)) return `Formato não aceito. Envie em ${LOGO_EXTENSIONS.join(", ").toUpperCase()}.`;
  return null;
}

/**
 * Caminhos de arte que o navegador diz ter enviado. Só vale o que está na pasta
 * da própria confirmação, sem repetir e sem passar do limite junto com as que já existem.
 */
export function validateArtPaths(raw: unknown, confirmationId: string, alreadyStored: number): { ok: true; paths: string[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: "Arquivos inválidos." };
  const paths = [...new Set(raw.map(String))];
  const pattern = new RegExp(`^${confirmationId}/\\d+-[\\w.\\-]+$`);
  if (paths.some((path) => !pattern.test(path))) return { ok: false, error: "Arquivos inválidos." };
  if (paths.length + alreadyStored > MAX_ARTS) return { ok: false, error: `Você pode enviar até ${MAX_ARTS} artes.` };
  return { ok: true, paths };
}
