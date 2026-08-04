import { createClient } from "@/lib/supabase/server";
import type { FiadoCharge, FiadoCustomer, FiadoPayment } from "@/lib/types";

export type FiadoCustomerSummary = FiadoCustomer & {
  totalCharged: number;
  totalPaid: number;
  balance: number;
  lastActivityAt: string | null;
};

/** Lista de clientes com o saldo já calculado (soma de cobranças - soma de pagamentos) — nunca digitado à mão. */
export async function getFiadoCustomers(): Promise<FiadoCustomerSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fiado_customers")
    .select("*, fiado_charges(amount, occurred_at), fiado_payments(amount, paid_at)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  type Row = FiadoCustomer & { fiado_charges: { amount: number; occurred_at: string }[]; fiado_payments: { amount: number; paid_at: string }[] };

  return ((data ?? []) as unknown as Row[]).map((row) => {
    const { fiado_charges, fiado_payments, ...customer } = row;
    const totalCharged = fiado_charges.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = fiado_payments.reduce((sum, p) => sum + p.amount, 0);
    const dates = [...fiado_charges.map((c) => c.occurred_at), ...fiado_payments.map((p) => p.paid_at)].sort();
    return {
      ...customer,
      totalCharged,
      totalPaid,
      balance: totalCharged - totalPaid,
      lastActivityAt: dates.length > 0 ? dates[dates.length - 1] : null,
    };
  });
}

export type FiadoCustomerDetail = FiadoCustomer & { charges: FiadoCharge[]; payments: FiadoPayment[]; totalCharged: number; totalPaid: number; balance: number };

export async function getFiadoCustomerById(id: string): Promise<FiadoCustomerDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fiado_customers")
    .select("*, fiado_charges(*), fiado_payments(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { fiado_charges, fiado_payments, ...customer } = data as FiadoCustomer & { fiado_charges: FiadoCharge[]; fiado_payments: FiadoPayment[] };
  const charges = (fiado_charges ?? []).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  const payments = (fiado_payments ?? []).sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  const totalCharged = charges.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return { ...customer, charges, payments, totalCharged, totalPaid, balance: totalCharged - totalPaid };
}
