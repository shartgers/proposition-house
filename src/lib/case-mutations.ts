import { SupabaseClient } from '@supabase/supabase-js'
import type { ProofLevel } from '@/lib/db/types'

export type CaseInput = {
  clientName: string
  sector: string
  dateRange: string
  proofLevel: ProofLevel
  description: string
  result: string
  propositionId: string
}

export async function createCase(
  supabase: SupabaseClient,
  input: CaseInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('cases')
    .insert({
      client_name: input.clientName,
      sector: input.sector,
      date_range: input.dateRange,
      proof_level: input.proofLevel,
      description: input.description,
      result: input.result,
      proposition_id: input.propositionId,
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id }
}

export async function updateCase(
  supabase: SupabaseClient,
  id: string,
  input: Partial<Omit<CaseInput, 'propositionId'>>
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (input.clientName !== undefined) patch.client_name = input.clientName
  if (input.sector !== undefined) patch.sector = input.sector
  if (input.dateRange !== undefined) patch.date_range = input.dateRange
  if (input.proofLevel !== undefined) patch.proof_level = input.proofLevel
  if (input.description !== undefined) patch.description = input.description
  if (input.result !== undefined) patch.result = input.result

  const { error } = await supabase.from('cases').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteCase(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('cases').delete().eq('id', id)
  if (error) throw error
}

// Adds a case to an offering. Idempotent — safe to call more than once for the
// same pair. Does not touch proposition_id; the offering determines the
// proposition context, not the case row.
export async function allocateCase(
  supabase: SupabaseClient,
  caseId: string,
  offeringId: string
): Promise<void> {
  // Validate offering exists first so callers get a meaningful error.
  const { error: offeringError } = await supabase
    .from('offerings')
    .select('id')
    .eq('id', offeringId)
    .single()

  if (offeringError) throw offeringError ?? new Error('Offering not found')

  const { error } = await supabase
    .from('case_offerings')
    .upsert({ case_id: caseId, offering_id: offeringId }, { onConflict: 'case_id,offering_id' })

  if (error) throw error
}

// Removes a case from a specific offering only.
export async function removeCaseFromOffering(
  supabase: SupabaseClient,
  caseId: string,
  offeringId: string
): Promise<void> {
  const { error } = await supabase
    .from('case_offerings')
    .delete()
    .eq('case_id', caseId)
    .eq('offering_id', offeringId)

  if (error) throw error
}

// Removes a case from all offerings (full unallocation).
export async function unallocateCase(
  supabase: SupabaseClient,
  caseId: string
): Promise<void> {
  const { error } = await supabase
    .from('case_offerings')
    .delete()
    .eq('case_id', caseId)

  if (error) throw error
}
