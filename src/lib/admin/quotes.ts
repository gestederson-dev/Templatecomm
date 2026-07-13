import { createClient } from "@/lib/supabase/server";
import type { Quote, QuoteStatus, QuoteWithItems } from "@/lib/types";

export async function getAdminQuotes(status?: QuoteStatus): Promise<Quote[]> {
  const supabase = await createClient();
  let query = supabase.from("quotes").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAdminQuoteById(id: string): Promise<QuoteWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quotes").select("*, quote_items(*)").eq("id", id).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { quote_items, ...quote } = data as Quote & { quote_items: QuoteWithItems["items"] };
  return { ...quote, items: quote_items ?? [] };
}
