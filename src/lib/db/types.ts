export type ProofLevel = 'High' | 'Medium-High' | 'Medium' | 'Low-Medium' | 'Ongoing'

export type Proposition = {
  id: string
  number: string
  name: string
}

export type Practice = {
  id: string
  name: string
  practice_owner: string
}

export type Offering = {
  id: string
  name: string
  description: string | null
  key_outcomes: string | null
  sort_order: number
  proposition_id: string
  practice_id: string | null
}

export type Case = {
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
