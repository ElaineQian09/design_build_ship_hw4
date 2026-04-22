import { createClient } from "@supabase/supabase-js";
import { getWorkerEnv } from "../env";

export function getSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getWorkerEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
