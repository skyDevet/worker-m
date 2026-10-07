import { createClient } from '@supabase/supabase-js';

export function getSupabase(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[worker] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing.');
    return null;
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
}
