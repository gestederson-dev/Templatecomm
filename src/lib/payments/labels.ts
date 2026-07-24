const PAYMENT_TYPE_LABELS: Record<string, string> = {
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_transfer: "Pix",
  ticket: "Boleto",
  account_money: "Saldo Mercado Pago",
  atm: "Caixa eletrônico",
};

export function paymentTypeLabel(paymentTypeId: string): string | null {
  return PAYMENT_TYPE_LABELS[paymentTypeId] ?? null;
}
