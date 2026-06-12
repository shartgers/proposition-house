import { SupabaseClient } from '@supabase/supabase-js'

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
