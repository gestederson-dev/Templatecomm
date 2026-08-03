import { ManualQuoteForm } from "@/components/admin/manual-quote-form";
import { getAdminCustomers } from "@/lib/admin/customers";
import { getAdminProductsForOrderPicker } from "@/lib/admin/products";

export default async function NovoOrcamentoPage() {
  const [customers, products] = await Promise.all([getAdminCustomers(), getAdminProductsForOrderPicker()]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Novo orçamento</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">Registre um pedido de cotação recebido fora do site (ex: WhatsApp).</p>
      </div>

      <ManualQuoteForm
        customers={customers.map((c) => ({ id: c.id, name: c.company_name || c.full_name || "(sem nome)", phone: c.phone }))}
        products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, basePrice: p.base_price, customizationOptions: p.customization_options }))}
      />
    </div>
  );
}
