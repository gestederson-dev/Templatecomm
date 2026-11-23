import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// image_url: caminho em /public (ex.: /confirmacoes/copo-termico-473.jpg) ou foto de produto do Storage
export type ConfirmationItem = {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
  /** produto do catálogo de onde o item veio (quando veio) */
  product_id?: string;
};
export type PaymentOption = {
  id: string;
  label: string;
  amount: number;
  note?: string;
};

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
  logo_paths: string[];
  art_later: boolean;
  order_id: string | null;
  quote_id: string | null;
  customer_message: string | null;
  responded_at: string | null;
  created_at: string;
};

/** Na lista do admin vem junto o número do pedido e do orçamento ligados. */
export type ConfirmationWithLinks = OrderConfirmation & {
  order: { id: string; order_number: string | null } | null;
  quote: { id: string; quote_number: string | null } | null;
};

export { LOGO_BUCKET } from "@/lib/validators/confirmacao";
import { LOGO_BUCKET } from "@/lib/validators/confirmacao";

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
export async function listConfirmations(): Promise<ConfirmationWithLinks[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_confirmations")
    .select("*, order:orders(id, order_number), quote:quotes(id, quote_number)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao listar confirmações: ${error.message}`);
  return data ?? [];
}

export async function getConfirmationById(id: string): Promise<OrderConfirmation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("order_confirmations").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Falha ao ler confirmação: ${error.message}`);
  return data;
}

export type ConfirmationProductOption = {
  id: string;
  name: string;
  basePrice: number | null;
  imageUrl: string | null;
};

/** Produtos ativos com a foto principal, para preencher um item da confirmação com um clique. */
export async function getConfirmationProductOptions(): Promise<ConfirmationProductOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, base_price, product_images(url, is_primary, sort_order)")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error(`Falha ao listar produtos: ${error.message}`);
  type Row = {
    id: string;
    name: string;
    base_price: number | null;
    product_images: { url: string; is_primary: boolean; sort_order: number }[] | null;
  };
  return ((data ?? []) as Row[]).map((row) => {
    const images = [...(row.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
    return {
      id: row.id,
      name: row.name,
      basePrice: row.base_price,
      imageUrl: images[0]?.url ?? null,
    };
  });
}

export async function getConfirmationByOrderId(orderId: string): Promise<OrderConfirmation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("order_confirmations").select("*").eq("order_id", orderId).maybeSingle();
  if (error) throw new Error(`Falha ao ler confirmação: ${error.message}`);
  return data;
}

export async function getConfirmationsByQuoteId(quoteId: string): Promise<OrderConfirmation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("order_confirmations").select("*").eq("quote_id", quoteId).order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao ler confirmações: ${error.message}`);
  return data ?? [];
}

export type ArtFile = { path: string; name: string; ext: string; download: string | null; preview: string | null };

/** Nome que o cliente deu ao arquivo (o caminho guarda "<id>/<timestamp>-<nome>"). */
export function artDisplayName(path: string): string {
  return (path.split("/").pop() ?? path).replace(/^\d+-/, "");
}

/** Links temporários (1 h) para baixar e, quando é imagem, mostrar cada arte. Bucket privado, leitura só admin. */
export async function artFiles(paths: string[], seconds = 60 * 60): Promise<ArtFile[]> {
  if (paths.length === 0) return [];
  const supabase = await createClient();
  const bucket = supabase.storage.from(LOGO_BUCKET);
  const imagePaths = paths.filter((path) => /\.(png|jpe?g|webp|svg)$/i.test(path));
  const [{ data: downloads }, { data: previews }] = await Promise.all([
    bucket.createSignedUrls(paths, seconds, { download: true }),
    imagePaths.length ? bucket.createSignedUrls(imagePaths, seconds) : Promise.resolve({ data: [] as { path: string | null; signedUrl: string }[] }),
  ]);
  return paths.map((path) => ({
    path,
    name: artDisplayName(path),
    ext: (path.split(".").pop() ?? "").toLowerCase(),
    download: downloads?.find((d) => d.path === path)?.signedUrl ?? null,
    preview: previews?.find((d) => d.path === path)?.signedUrl ?? null,
  }));
}

/**
 * Compra feita no site: cria a confirmação ligada ao pedido, já com os dados do
 * cadastro, para o cliente só enviar a arte e dizer se quer nota fiscal. O
 * pagamento já foi escolhido no checkout, então vai sem opções de pagamento.
 * Roda no servidor com service_role depois que o pedido foi criado pelo próprio cliente.
 */
export async function createConfirmationForSiteOrder(orderId: string, email: string | null): Promise<string | null> {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, shipping_address, shipping_cost, profile:profiles(full_name, company_name, phone, person_type, cpf, cnpj), order_items(product_id, product_name, quantity, unit_price)",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  type Row = {
    order_number: string | null;
    shipping_address: Record<string, string> | null;
    shipping_cost: number;
    profile: {
      full_name: string | null;
      company_name: string | null;
      phone: string | null;
      person_type: string | null;
      cpf: string | null;
      cnpj: string | null;
    } | null;
    order_items: { product_id: string | null; product_name: string; quantity: number; unit_price: number }[];
  };
  const row = order as unknown as Row;
  const productIds = row.order_items.map((item) => item.product_id).filter((id): id is string => Boolean(id));
  const { data: images } = productIds.length
    ? await supabase.from("product_images").select("product_id, url, is_primary, sort_order").in("product_id", productIds)
    : { data: [] };
  const imageOf = (productId: string | null) =>
    (images ?? [])
      .filter((image) => image.product_id === productId)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0]?.url;

  const profile = row.profile;
  const label = profile?.company_name || profile?.full_name || "cliente";
  const doc = (profile?.person_type === "pj" ? profile?.cnpj : profile?.cpf)?.replace(/\D/g, "") || null;
  const address = row.shipping_address;

  const { data: created, error } = await supabase
    .from("order_confirmations")
    .insert({
      order_id: orderId,
      customer_label: label,
      items: row.order_items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        ...(item.product_id ? { product_id: item.product_id } : {}),
        ...(imageOf(item.product_id) ? { image_url: imageOf(item.product_id) } : {}),
      })),
      payment_options: [],
      notes: `Pedido ${row.order_number ?? ""} feito pelo site${row.shipping_cost > 0 ? ", frete incluído no pagamento" : ""}.`.replace("  ", " "),
      contact_name: profile?.company_name || profile?.full_name || null,
      contact_email: email,
      contact_phone: profile?.phone?.replace(/\D/g, "") || null,
      document: doc,
      cep: address?.cep?.replace(/\D/g, "") || null,
      street: address?.street || null,
      number: address?.number || null,
      complement: address?.complement || null,
      district: address?.district || null,
      city: address?.city || null,
      state: address?.state || null,
    })
    .select("token")
    .single();
  if (error) {
    console.error("[confirmacao] falha ao criar confirmação do pedido do site:", error.message);
    return null;
  }
  return created.token;
}

export type OrderConfirmationSummary = { token: string; status: OrderConfirmation["status"]; artCount: number; artLater: boolean };

/**
 * Para a página "Meu pedido": quem chama já leu o pedido com a sessão do cliente (o RLS
 * garante que é dele), então aqui pode ler a confirmação pelo service_role. Compra do site
 * feita antes desta mudança, ainda em produção, ganha uma na hora.
 */
export async function getOrCreateConfirmationForOwnedOrder(
  order: { id: string; origin: string; status: string },
  email: string | null,
): Promise<OrderConfirmationSummary | null> {
  const supabase = createAdminClient();
  const read = async () =>
    (await supabase.from("order_confirmations").select("token, status, logo_paths, art_later").eq("order_id", order.id).maybeSingle()).data as {
      token: string;
      status: OrderConfirmation["status"];
      logo_paths: string[];
      art_later: boolean;
    } | null;

  let row = await read();
  // só para pedido que ainda vai ser produzido; enviado ou entregue não pede arte de novo
  if (!row && order.origin === "direct" && ["pending", "paid", "processing"].includes(order.status)) {
    await createConfirmationForSiteOrder(order.id, email);
    row = await read();
  }
  return row ? { token: row.token, status: row.status, artCount: row.logo_paths.length, artLater: row.art_later } : null;
}
