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
  offeringNames: string[]   // empty = unallocated
  practiceNames: string[]
}

export async function fetchCaseLibrary(
  supabase: SupabaseClient,
  filters?: CaseLibraryFilters
): Promise<CaseLibraryRow[]> {
  // Filters that require a case-ID subquery are resolved first.
  let caseIds: string[] | undefined

  if (filters?.offeringId === null) {
    // Unallocated: cases with no rows in case_offerings
    const { data: allocated } = await supabase.from('case_offerings').select('case_id')
    const allocatedSet = new Set(allocated?.map((r) => r.case_id))
    const { data: all } = await supabase.from('cases').select('id')
    caseIds = (all ?? []).map((c) => c.id).filter((id) => !allocatedSet.has(id))
  } else if (filters?.offeringId) {
    const { data: rows } = await supabase
      .from('case_offerings')
      .select('case_id')
      .eq('offering_id', filters.offeringId)
    caseIds = (rows ?? []).map((r) => r.case_id)
  } else if (filters?.practiceId) {
    const { data: offerings } = await supabase
      .from('offerings')
      .select('id')
      .eq('practice_id', filters.practiceId)
    const offeringIds = (offerings ?? []).map((o) => o.id)
    if (offeringIds.length === 0) return []
    const { data: rows } = await supabase
      .from('case_offerings')
      .select('case_id')
      .in('offering_id', offeringIds)
    caseIds = (rows ?? []).map((r) => r.case_id)
  }

  if (caseIds !== undefined && caseIds.length === 0) return []

  const remaining: Omit<CaseLibraryFilters, 'offeringId' | 'practiceId'> = {
    propositionId: filters?.propositionId,
    proofLevel: filters?.proofLevel,
    sector: filters?.sector,
  }
  return _queryCases(supabase, remaining, caseIds)
}

async function _queryCases(
  supabase: SupabaseClient,
  filters?: Omit<CaseLibraryFilters, 'offeringId' | 'practiceId'>,
  caseIds?: string[]
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
      case_offerings (
        offerings (
          name,
          practices ( name )
        )
      )
    `)
    .order('client_name')

  if (caseIds !== undefined) query = query.in('id', caseIds)
  if (filters?.propositionId) query = query.eq('proposition_id', filters.propositionId)
  if (filters?.proofLevel) query = query.eq('proof_level', filters.proofLevel)
  if (filters?.sector) query = query.eq('sector', filters.sector)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row) => {
    const proposition = row.propositions as unknown as { name: string } | null
    const caseOfferings = row.case_offerings as unknown as Array<{
      offerings: { name: string; practices: { name: string } | null } | null
    }> | null

    const offerings = (caseOfferings ?? [])
      .map((co) => co.offerings)
      .filter((o): o is { name: string; practices: { name: string } | null } => o != null)

    const offeringNames = offerings.map((o) => o.name)
    const practiceNames = [
      ...new Set(
        offerings.map((o) => o.practices?.name).filter((n): n is string => n != null)
      ),
    ]

    return {
      id: row.id,
      clientName: row.client_name,
      sector: row.sector,
      dateRange: row.date_range,
      proofLevel: row.proof_level as ProofLevel,
      description: row.description,
      result: row.result,
      propositionName: proposition?.name ?? '',
      offeringNames,
      practiceNames,
    }
  })
}

export async function countUnallocatedCases(supabase: SupabaseClient): Promise<number> {
  const { data: allocated } = await supabase.from('case_offerings').select('case_id')
  const allocatedCount = new Set(allocated?.map((r) => r.case_id)).size
  const { count: total } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
  return (total ?? 0) - allocatedCount
}
