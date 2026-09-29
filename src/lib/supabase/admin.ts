import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses Row Level Security entirely. Only for
 * trusted server code (the Discord bot) that has already verified which
 * user it's acting on behalf of; every query it runs must filter by
 * user_id explicitly. Never expose this client or its key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
