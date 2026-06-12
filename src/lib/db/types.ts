export type ProofLevel = 'High' | 'Medium-High' | 'Medium' | 'Low-Medium' | 'Ongoing'

export type PracticeUnit =
  | 'Strategy & Delivery'
  | 'AI Solutions'
  | 'Analytics & Data Engineering'
  | 'Data Platform Engineering'

export const PRACTICE_UNITS: PracticeUnit[] = [
  'Strategy & Delivery',
  'AI Solutions',
  'Analytics & Data Engineering',
  'Data Platform Engineering',
]

export type PropositionRow = {
  id: string
  number: string
  name: string
}

export type PracticeRow = {
  id: string
  name: string
  practice_owner: string
  unit: PracticeUnit | null
  sort_order: number
}

export type OfferingRow = {
  id: string
  name: string
  description: string | null
  key_outcomes: string | null
  sort_order: number
  proposition_id: string
  practice_id: string | null
}

export type CaseRow = {
  id: string
  client_name: string
  sector: string
  date_range: string
  proof_level: ProofLevel
  description: string
  result: string
  proposition_id: string
  offering_id: string | null
}
