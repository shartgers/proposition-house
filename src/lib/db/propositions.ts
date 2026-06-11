import type { SupabaseClient } from '@supabase/supabase-js'
import type { Proposition } from './types'

export async function getPropositions(client: SupabaseClient): Promise<Proposition[]> {
  const { data, error } = await client
    .from('propositions')
    .select('id, number, name')
    .order('number')
  if (error) throw error
  return data
}
