import Link from "next/link";
import { ConfirmationEditor, type ConfirmationEditorInitial } from "@/components/admin/confirmation-editor";
import { adminBtnSoft, adminCard } from "@/components/admin/ui-styles";
import { getAdminOrderById } from "@/lib/admin/orders";
import { getAdminQuoteById } from "@/lib/admin/quotes";
import { getConfirmationByOrderId, getConfirmationProductOptions, type ConfirmationProductOption } from "@/lib/confirmations";
import { DEFAULT_NOTES } from "@/lib/confirmation-draft";

type Fonte = { productId: string | null; name: string; quantity: number; unitPrice: number | null };

function toItems(list: Fonte[], products: ConfirmationProductOption[]): ConfirmationEditorInitial["items"] {
  return list.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice ?? product?.basePrice ?? 0,
      ...(product?.imageUrl ? { image_url: product.imageUrl } : {}),
      ...(item.productId ? { product_id: item.productId } : {}),
    };
  });
}

/** Nova confirmação: em branco, ou já preenchida a partir de um pedido (?pedido=) ou orçamento (?orcamento=). */
async function prefill(
  products: ConfirmationProductOption[],
  pedido?: string,
  orcamento?: string,
): Promise<ConfirmationEditorInitial | { jaExiste: string } | undefined> {
  if (pedido) {
    const existing = await getConfirmationByOrderId(pedido);
    if (existing) return { jaExiste: existing.id };
    const order = await getAdminOrderById(pedido);
    if (!order) return undefined;
    return {
      customerLabel: order.profileName || order.customer_name || "",
      items: toItems(
        order.items.map((i) => ({ productId: i.product_id, name: i.product_name, quantity: i.quantity, unitPrice: i.unit_price })),
        products,
      ),
      notes: order.shipping_cost > 0 ? `Frete: R$ ${order.shipping_cost.toFixed(2).replace(".", ",")}.` : DEFAULT_NOTES,
      orderId: order.id,
      sourceLabel: `Pedido ${order.order_number ?? ""}`.trim(),
    };
  }
  if (orcamento) {
    const quote = await getAdminQuoteById(orcamento);
    if (!quote) return undefined;
    return {
      customerLabel: quote.profile?.company_name || quote.profile?.full_name || quote.customer_name || "",
      items: toItems(
        quote.items.map((i) => ({ productId: i.product_id, name: i.product_name, quantity: i.quantity, unitPrice: i.unit_price })),
        products,
      ),
      notes: quote.admin_response?.trim() || DEFAULT_NOTES,
      quoteId: quote.id,
      sourceLabel: `Orçamento ${quote.quote_number ?? ""}`.trim(),
    };
  }
  return undefined;
}

export default async function NovaConfirmacaoPage({ searchParams }: { searchParams: Promise<{ pedido?: string; orcamento?: string }> }) {
  const { pedido, orcamento } = await searchParams;
  const products = await getConfirmationProductOptions();
  const initial = await prefill(products, pedido, orcamento);

  if (initial && "jaExiste" in initial) {
    return (
      <div className={`${adminCard} flex flex-col items-start gap-3`}>
        <p className="text-sm text-ink/70">Este pedido já tem uma confirmação.</p>
        <Link href={`/admin/confirmacoes?editada=${initial.jaExiste}`} className={adminBtnSoft}>
          Ver confirmação
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Nova confirmação de pedido</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">Monte o que o cliente fechou. Ao salvar, o link para enviar aparece na lista.</p>
      </div>
      <ConfirmationEditor products={products} initial={initial} />
    </div>
  );
}
