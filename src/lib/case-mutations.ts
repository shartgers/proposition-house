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
      offering_id: null,
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

export async function unallocateCase(
  supabase: SupabaseClient,
  caseId: string
): Promise<void> {
  // Send the case back to the unallocated pool. proposition_id is left as-is:
  // it already matches the proposition the case was allocated under, which
  // remains the correct value for the unallocated state.
  const { error } = await supabase
    .from('cases')
    .update({ offering_id: null })
    .eq('id', caseId)

  if (error) throw error
}

export async function allocateCase(
  supabase: SupabaseClient,
  caseId: string,
  offeringId: string
): Promise<void> {
  const { data: offering, error: offeringError } = await supabase
    .from('offerings')
    .select('proposition_id')
    .eq('id', offeringId)
    .single()

  if (offeringError || !offering) {
    throw offeringError ?? new Error('Offering not found')
  }

  const { error } = await supabase
    .from('cases')
    .update({ offering_id: offeringId, proposition_id: offering.proposition_id })
    .eq('id', caseId)

  if (error) throw error
}
