import { createClient } from "@/lib/supabase/server";
import type { Quote, QuoteWithItems } from "@/lib/types";

export async function getMyQuotes(): Promise<Quote[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from("quotes").select("*").eq("profile_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getQuoteByNumber(quoteNumber: string): Promise<QuoteWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quotes").select("*, quote_items(*)").eq("quote_number", quoteNumber).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { quote_items, ...quote } = data as Quote & { quote_items: QuoteWithItems["items"] };
  return { ...quote, items: quote_items ?? [] };
}
