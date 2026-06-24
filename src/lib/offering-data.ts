import { SupabaseClient } from '@supabase/supabase-js'
import type { ProofLevel } from './db/types'

export type { ProofLevel }

export type CaseDetail = {
  id: string
  clientName: string
  sector: string
  dateRange: string
  proofLevel: ProofLevel
  description: string
  result: string
  propositionId: string
}

export type OfferingDetail = {
  id: string
  name: string
  description: string | null
  keyOutcomes: string | null
  practice: string
  practiceOwner: string
  caseCount: number
  cases: CaseDetail[]
  propositionId: string
  propositionName: string
  unallocatedCases: CaseDetail[]
}

const PROOF_ORDER: Record<ProofLevel, number> = {
  High: 0,
  'Medium-High': 1,
  Medium: 2,
  'Low-Medium': 3,
  Ongoing: 4,
}

export function sortCasesByProofLevel(cases: CaseDetail[]): CaseDetail[] {
  return [...cases].sort((a, b) => PROOF_ORDER[a.proofLevel] - PROOF_ORDER[b.proofLevel])
}

const CASE_COLUMNS = 'id, client_name, sector, date_range, proof_level, description, result, proposition_id'

function mapCaseRow(c: {
  id: string; client_name: string; sector: string; date_range: string
  proof_level: string; description: string; result: string; proposition_id: string
}): CaseDetail {
  return {
    id: c.id,
    clientName: c.client_name,
    sector: c.sector,
    dateRange: c.date_range,
    proofLevel: c.proof_level as ProofLevel,
    description: c.description,
    result: c.result,
    propositionId: c.proposition_id,
  }
}

/**
 * Fetches every Case with no entries in case_offerings (unallocated across all
 * Propositions), sorted by Proof level (High → Ongoing).
 */
export async function fetchAllUnallocatedCases(
  supabase: SupabaseClient
): Promise<CaseDetail[]> {
  const { data: allocated } = await supabase.from('case_offerings').select('case_id')
  const allocatedIds = [...new Set(allocated?.map((r) => r.case_id) ?? [])]

  let query = supabase.from('cases').select(CASE_COLUMNS)
  if (allocatedIds.length > 0) {
    query = query.not('id', 'in', `(${allocatedIds.join(',')})`)
  }

  const { data, error } = await query
  if (error) throw error
  return sortCasesByProofLevel((data ?? []).map(mapCaseRow))
}

export async function fetchOfferingDetail(
  supabase: SupabaseClient,
  id: string
): Promise<OfferingDetail | null> {
  const { data, error } = await supabase
    .from('offerings')
    .select(`
      id,
      name,
      description,
      key_outcomes,
      proposition_id,
      propositions ( name ),
      practices ( name, practice_owner )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  // Cases linked to this offering (via junction)
  const { data: junctionRows } = await supabase
    .from('case_offerings')
    .select(`cases ( ${CASE_COLUMNS} )`)
    .eq('offering_id', id)

  const linkedCases = (junctionRows ?? [])
    .map((r) => (r.cases as unknown as Parameters<typeof mapCaseRow>[0] | null))
    .filter((c): c is Parameters<typeof mapCaseRow>[0] => c != null)
    .map(mapCaseRow)

  // Unallocated cases in the same proposition (no entries in case_offerings at all)
  const { data: allAllocated } = await supabase.from('case_offerings').select('case_id')
  const allocatedIds = [...new Set(allAllocated?.map((r) => r.case_id) ?? [])]

  let unallocatedQuery = supabase
    .from('cases')
    .select(CASE_COLUMNS)
    .eq('proposition_id', data.proposition_id)
  if (allocatedIds.length > 0) {
    unallocatedQuery = unallocatedQuery.not('id', 'in', `(${allocatedIds.join(',')})`)
  }
  const { data: unallocatedData } = await unallocatedQuery

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? null,
    keyOutcomes: data.key_outcomes ?? null,
    practice: (data.practices as unknown as { name: string } | null)?.name ?? '',
    practiceOwner: (data.practices as unknown as { practice_owner: string } | null)?.practice_owner ?? '',
    caseCount: linkedCases.length,
    cases: sortCasesByProofLevel(linkedCases),
    propositionId: data.proposition_id,
    propositionName: (data.propositions as unknown as { name: string } | null)?.name ?? '',
    unallocatedCases: sortCasesByProofLevel((unallocatedData ?? []).map(mapCaseRow)),
  }
}
