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
 * Fetches every Case in the unallocated pool (offering_id IS NULL) across all
 * Propositions, sorted by Proof level (High → Ongoing). Proposition filtering
 * is left to the client so switching the Case Tray filter is instant.
 */
export async function fetchAllUnallocatedCases(
  supabase: SupabaseClient
): Promise<CaseDetail[]> {
  const { data, error } = await supabase
    .from('cases')
    .select(CASE_COLUMNS)
    .is('offering_id', null)

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
      practices ( name, practice_owner ),
      cases ( count )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const [{ data: casesData }, { data: unallocatedData }] = await Promise.all([
    supabase
      .from('cases')
      .select(CASE_COLUMNS)
      .eq('offering_id', id),
    supabase
      .from('cases')
      .select(CASE_COLUMNS)
      .eq('proposition_id', data.proposition_id)
      .is('offering_id', null),
  ])

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? null,
    keyOutcomes: data.key_outcomes ?? null,
    practice: (data.practices as unknown as { name: string } | null)?.name ?? '',
    practiceOwner: (data.practices as unknown as { practice_owner: string } | null)?.practice_owner ?? '',
    caseCount: (data.cases as { count: number }[])?.[0]?.count ?? 0,
    cases: sortCasesByProofLevel((casesData ?? []).map(mapCaseRow)),
    propositionId: data.proposition_id,
    propositionName: (data.propositions as unknown as { name: string } | null)?.name ?? '',
    unallocatedCases: sortCasesByProofLevel((unallocatedData ?? []).map(mapCaseRow)),
  }
}
