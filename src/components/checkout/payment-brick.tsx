"use client";

import { useEffect, useRef } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

let mpInitialized = false;

export type PaymentBrickResult = { error: string } | { error?: undefined; [key: string]: unknown };

export function PaymentBrick({
  amount,
  payerEmail,
  onResult,
}: {
  amount: number;
  payerEmail: string;
  onResult: (formData: Record<string, unknown>) => Promise<PaymentBrickResult>;
}) {
  const brickKey = useRef(`${amount}-${payerEmail}`).current;

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (!publicKey) return;
    if (!mpInitialized) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
      mpInitialized = true;
    }
  }, []);

  return (
    <Payment
      key={brickKey}
      initialization={{ amount, payer: { email: payerEmail } }}
      customization={{
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
          ticket: "all",
          bankTransfer: "all",
        },
      }}
      onSubmit={async ({ formData }) => {
        const result = await onResult(formData as unknown as Record<string, unknown>);
        if (result && "error" in result && result.error) {
          throw new Error(result.error);
        }
      }}
      onError={(error) => {
        console.error("Payment Brick error:", error);
      }}
    />
  );
}
