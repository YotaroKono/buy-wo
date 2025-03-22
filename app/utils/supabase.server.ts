// app/utils/supabase.server.js
import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient(supabaseToken: string) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      },
    }
  );
}