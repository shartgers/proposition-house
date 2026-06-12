import { SupabaseClient } from '@supabase/supabase-js'
import type { ProofLevel } from '@/lib/db/types'

export type CaseLibraryFilters = {
  propositionId?: string
  offeringId?: string | null  // null = unallocated only
  proofLevel?: string
  sector?: string
  practiceId?: string
}

export type CaseLibraryRow = {
  id: string
  clientName: string
  sector: string
  dateRange: string
  proofLevel: ProofLevel
  description: string
  result: string
  propositionName: string
  offeringName: string | null
  practiceName: string | null
}

export async function fetchCaseLibrary(
  supabase: SupabaseClient,
  filters?: CaseLibraryFilters
): Promise<CaseLibraryRow[]> {
  // practiceId filter requires resolving offering IDs first
  if (filters?.practiceId !== undefined) {
    const { data: offeringRows, error: offeringError } = await supabase
      .from('offerings')
      .select('id')
      .eq('practice_id', filters.practiceId)
    if (offeringError) throw offeringError

    const offeringIds = (offeringRows ?? []).map((o) => o.id)
    if (offeringIds.length === 0) return []

    const remaining = { ...filters, practiceId: undefined, offeringId: undefined }
    return _queryCases(supabase, remaining, { offeringIds })
  }

  return _queryCases(supabase, filters)
}

async function _queryCases(
  supabase: SupabaseClient,
  filters?: Omit<CaseLibraryFilters, 'practiceId'>,
  extra?: { offeringIds?: string[] }
): Promise<CaseLibraryRow[]> {
  let query = supabase
    .from('cases')
    .select(`
      id,
      client_name,
      sector,
      date_range,
      proof_level,
      description,
      result,
      propositions ( name ),
      offerings (
        name,
        practices ( name )
      )
    `)
    .order('client_name')

  if (filters?.propositionId) query = query.eq('proposition_id', filters.propositionId)

  if (extra?.offeringIds) {
    query = query.in('offering_id', extra.offeringIds)
  } else if (filters?.offeringId === null) {
    query = query.is('offering_id', null)
  } else if (filters?.offeringId) {
    query = query.eq('offering_id', filters.offeringId)
  }

  if (filters?.proofLevel) query = query.eq('proof_level', filters.proofLevel)
  if (filters?.sector) query = query.eq('sector', filters.sector)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row) => {
    const offering = row.offerings as { name: string; practices: { name: string } | null } | null
    const proposition = row.propositions as { name: string } | null
    return {
      id: row.id,
      clientName: row.client_name,
      sector: row.sector,
      dateRange: row.date_range,
      proofLevel: row.proof_level as ProofLevel,
      description: row.description,
      result: row.result,
      propositionName: proposition?.name ?? '',
      offeringName: offering?.name ?? null,
      practiceName: offering?.practices?.name ?? null,
    }
  })
}

export async function countUnallocatedCases(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from('cases')
    .select('id', { count: 'exact', head: true })
    .is('offering_id', null)
  if (error) throw error
  return count ?? 0
}
