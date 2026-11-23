import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// image_url: caminho em /public (ex.: /confirmacoes/copo-termico-473.jpg) ou foto de produto do Storage
export type ConfirmationItem = { name: string; description?: string; quantity: number; unit_price: number; image_url?: string };
export type PaymentOption = { id: string; label: string; amount: number; note?: string };

export type OrderConfirmation = {
  id: string;
  token: string;
  customer_label: string;
  items: ConfirmationItem[];
  payment_options: PaymentOption[];
  notes: string | null;
  status: "pendente" | "respondido" | "cancelado";
  payment_choice: string | null;
  wants_invoice: boolean | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  document: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  logo_path: string | null;
  customer_message: string | null;
  responded_at: string | null;
  created_at: string;
};

export const LOGO_BUCKET = "order-confirmation-logos";

/** Token é 64 hex (dois uuid sem hífen); qualquer outra coisa nem vai ao banco. */
const TOKEN_FORMAT = /^[a-f0-9]{64}$/;

export function confirmationTotal(items: ConfirmationItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
}

/** Leitura da página pública: o cliente não tem login, então vai pelo service_role depois de checar o token. */
export async function getConfirmationByToken(token: string): Promise<OrderConfirmation | null> {
  if (!TOKEN_FORMAT.test(token)) return null;
  const { data, error } = await createAdminClient().from("order_confirmations").select("*").eq("token", token).maybeSingle();
  if (error) throw new Error(`Falha ao ler confirmação: ${error.message}`);
  return data;
}

export function confirmationUrl(token: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://salmarbrindes.com.br"}/confirmar/${token}`;
}

// Admin: client com a sessão do usuário, então o RLS (is_admin) também barra, não só o proxy.
export async function listConfirmations(): Promise<OrderConfirmation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("order_confirmations").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao listar confirmações: ${error.message}`);
  return data ?? [];
}

/** Link temporário pra baixar a logo (bucket privado, leitura só admin). */
export async function logoDownloadUrl(path: string, seconds = 60 * 60): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(LOGO_BUCKET).createSignedUrl(path, seconds, { download: true });
  return data?.signedUrl ?? null;
}
