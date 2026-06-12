import type { SupabaseClient } from '@supabase/supabase-js'

// Removes any test offerings/practices (named with __ prefix) and unlinks their cases.
// Call in beforeAll for any test file that asserts absolute case counts.
export async function cleanupTestArtifacts(supabase: SupabaseClient) {
  // '\\_\\_' escapes both underscores so SQL LIKE treats them as literals, not wildcards
  const { data: testOfferings } = await supabase
    .from('offerings')
    .select('id')
    .like('name', '\\_\\_%')

  if (testOfferings?.length) {
    const ids = testOfferings.map((o: { id: string }) => o.id)
    await supabase.from('cases').update({ offering_id: null }).in('offering_id', ids)
    await supabase.from('offerings').delete().in('id', ids)
  }

  await supabase.from('practices').delete().like('name', '\\_\\_%')
}
