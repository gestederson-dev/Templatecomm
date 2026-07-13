import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getAddresses } from "@/lib/account";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const addresses = await getAddresses();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Finalizar compra</h1>
      <CheckoutForm addresses={addresses} />
    </div>
  );
}
