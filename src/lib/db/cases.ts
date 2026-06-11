import type { SupabaseClient } from '@supabase/supabase-js'
import type { Case } from './types'

export type CaseFilters = {
  proposition_id?: string
  offering_id?: string | null
  proof_level?: string
  sector?: string
}

export async function getCases(client: SupabaseClient, filters?: CaseFilters): Promise<Case[]> {
  let query = client.from('cases').select('*')

  if (filters?.proposition_id) query = query.eq('proposition_id', filters.proposition_id)
  if (filters?.offering_id === null) query = query.is('offering_id', null)
  else if (filters?.offering_id) query = query.eq('offering_id', filters.offering_id)
  if (filters?.proof_level) query = query.eq('proof_level', filters.proof_level)
  if (filters?.sector) query = query.eq('sector', filters.sector)

  const { data, error } = await query
  if (error) throw error
  return data
}
