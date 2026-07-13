import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** profiles não guarda e-mail — só existe em auth.users, que só o client admin enxerga. */
export async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email ?? null;
}
