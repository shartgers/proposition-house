import { createClient } from '@supabase/supabase-js'

export function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// proposition 01 id — matches the seeded DB used across all integration tests
export const PROP_01_ID = 'aa1e9cf8-4835-4e84-8689-6664bbe4e49a'
