/**
 * Data-migration script: copies cases.offering_id → case_offerings junction rows,
 * then signals that the column-drop migration is safe to apply.
 *
 * Run BEFORE applying migration 20260624000003_drop_offering_id_from_cases.sql:
 *   npx tsx scripts/migrate-case-allocations.ts
 *   npm run db:push
 *
 * Idempotent — safe to run on a database where the migration is already done
 * (it detects the absent column and exits cleanly) or where some rows were
 * already copied (duplicate inserts are silently skipped).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

try {
  readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
      if (m) process.env[m[1]] = m[2].trim()
    })
} catch {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Try to read offering_id from cases. If the column no longer exists PostgREST
  // returns a 400 with "column … does not exist" in the message.
  const { data, error } = await supabase
    .from('cases')
    .select('id, offering_id')

  if (error) {
    const alreadyDropped =
      error.message.toLowerCase().includes('offering_id') ||
      error.message.toLowerCase().includes('does not exist')
    if (alreadyDropped) {
      console.log('✓ offering_id column is already absent from cases — migration already complete.')
      return
    }
    throw error
  }

  const rows = (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.offering_id != null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => ({ case_id: c.id, offering_id: c.offering_id as string }))

  if (rows.length === 0) {
    console.log('✓ No cases have offering_id set — nothing to copy.')
    console.log('  Apply migration 20260624000003 to drop the column:  npm run db:push')
    return
  }

  console.log(`Found ${rows.length} allocation(s) to migrate...`)

  const { error: upsertError } = await supabase
    .from('case_offerings')
    .upsert(rows, { onConflict: 'case_id,offering_id', ignoreDuplicates: true })

  if (upsertError) throw upsertError

  console.log(`✓ Copied ${rows.length} row(s) into case_offerings.`)
  console.log('  Apply migration 20260624000003 to drop the column:  npm run db:push')
}

main().catch((e) => {
  console.error('Migration failed:', e.message ?? e)
  process.exit(1)
})
