import { notFound } from "next/navigation";
import { ManualOrderForm } from "@/components/admin/manual-order-form";
import { getAdminOrderById } from "@/lib/admin/orders";
import { getAdminCustomers } from "@/lib/admin/customers";
import { getAdminProductsForOrderPicker } from "@/lib/admin/products";

export default async function EditarPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, customers, products] = await Promise.all([getAdminOrderById(id), getAdminCustomers(), getAdminProductsForOrderPicker()]);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Editar pedido {order.order_number}</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">Altere cliente, itens, frete ou status deste pedido.</p>
      </div>

      <ManualOrderForm
        customers={customers.map((c) => ({ id: c.id, name: c.company_name || c.full_name || "(sem nome)", phone: c.phone }))}
        products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, basePrice: p.base_price, customizationOptions: p.customization_options }))}
        order={{
          id: order.id,
          profileId: order.profile_id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          status: order.status,
          paymentMethod: order.payment_method,
          notes: order.notes,
          discount: order.discount,
          shippingCost: order.shipping_cost,
          shippingAddress: order.shipping_address,
          items: order.items.map((item) => ({
            productId: item.product_id ?? "",
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            customization: item.customization,
          })),
        }}
      />
    </div>
  );
}
