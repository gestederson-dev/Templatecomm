import { createClient } from "@/lib/supabase/server";
import { getUserEmail } from "@/lib/email/get-user-email";
import type { Profile, Quote, QuoteStatus, QuoteWithItems } from "@/lib/types";

export type AdminQuoteListItem = Quote & {
  profile: Pick<Profile, "full_name" | "company_name" | "person_type" | "cnpj" | "cpf"> | null;
  itemCount: number;
  totalUnits: number;
};

export async function getAdminQuotes(status?: QuoteStatus): Promise<AdminQuoteListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("quotes")
    .select("*, profile:profiles(full_name, company_name, person_type, cnpj, cpf), quote_items(quantity)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;

  type Row = Quote & { profile: AdminQuoteListItem["profile"]; quote_items: { quantity: number }[] };

  return ((data ?? []) as unknown as Row[]).map((row) => {
    const { quote_items, ...quote } = row;
    return {
      ...quote,
      itemCount: quote_items?.length ?? 0,
      totalUnits: (quote_items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    };
  });
}

export type AdminQuoteDetail = QuoteWithItems & { profile: Profile | null; customerEmail: string | null };

export async function getAdminQuoteById(id: string): Promise<AdminQuoteDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quotes").select("*, quote_items(*)").eq("id", id).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { quote_items, ...quote } = data as Quote & { quote_items: QuoteWithItems["items"] };

  let profile: Profile | null = null;
  let customerEmail: string | null = null;
  if (quote.profile_id) {
    const [{ data: profileData }, email] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", quote.profile_id).maybeSingle(),
      getUserEmail(quote.profile_id),
    ]);
    profile = profileData ?? null;
    customerEmail = email;
  }

  return { ...quote, items: quote_items ?? [], profile, customerEmail };
}
