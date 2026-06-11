import { createClient } from '@supabase/supabase-js'

export function createTestClient() {
  const url = process.env.TEST_SUPABASE_URL
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY must be set in .env.test.local'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
