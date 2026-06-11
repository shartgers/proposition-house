import { SupabaseClient } from '@supabase/supabase-js'

export type ProofLevel = 'High' | 'Medium-High' | 'Medium' | 'Low-Medium' | 'Ongoing'

export type CaseDetail = {
  id: string
  clientName: string
  sector: string
  dateRange: string
  proofLevel: ProofLevel
  description: string
  result: string
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
      practices ( name, practice_owner ),
      cases ( count )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  const { data: casesData } = await supabase
    .from('cases')
    .select('id, client_name, sector, date_range, proof_level, description, result')
    .eq('offering_id', id)

  const cases = sortCasesByProofLevel(
    (casesData ?? []).map((c) => ({
      id: c.id,
      clientName: c.client_name,
      sector: c.sector,
      dateRange: c.date_range,
      proofLevel: c.proof_level as ProofLevel,
      description: c.description,
      result: c.result,
    }))
  )

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? null,
    keyOutcomes: data.key_outcomes ?? null,
    practice: (data.practices as unknown as { name: string } | null)?.name ?? '',
    practiceOwner: (data.practices as unknown as { practice_owner: string } | null)?.practice_owner ?? '',
    caseCount: (data.cases as { count: number }[])?.[0]?.count ?? 0,
    cases,
  }
}
