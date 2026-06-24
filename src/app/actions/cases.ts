'use server'

import { revalidatePath } from 'next/cache'
import { createAuthenticatedClient } from '@/lib/supabase/server'
import {
  allocateCase,
  unallocateCase,
  removeCaseFromOffering,
  createCase,
  updateCase,
  deleteCase,
} from '@/lib/case-mutations'
import type { CaseInput } from '@/lib/case-mutations'

// Returns the offering's metadata so the caller can update local state.
export async function allocateCaseAction(
  caseId: string,
  offeringId: string
): Promise<{ offeringName: string; practiceName: string | null }> {
  const { supabase } = await createAuthenticatedClient()

  const { data: offering } = await supabase
    .from('offerings')
    .select('name, practices ( name )')
    .eq('id', offeringId)
    .single()

  await allocateCase(supabase, caseId, offeringId)

  revalidatePath('/cases')
  revalidatePath('/')

  const o = offering as { name: string; practices: { name: string } | null } | null

  return {
    offeringName: o?.name ?? '',
    practiceName: (o?.practices as { name: string } | null)?.name ?? null,
  }
}

export async function removeCaseFromOfferingAction(
  caseId: string,
  offeringId: string
): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

  await removeCaseFromOffering(supabase, caseId, offeringId)

  revalidatePath('/cases')
  revalidatePath('/')
}

export async function unallocateCaseAction(caseId: string): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

  await unallocateCase(supabase, caseId)

  revalidatePath('/cases')
  revalidatePath('/')
}

export async function createCaseAction(input: CaseInput): Promise<{ id: string }> {
  const { supabase } = await createAuthenticatedClient()

  const result = await createCase(supabase, input)
  revalidatePath('/cases')
  revalidatePath('/')
  return result
}

export async function updateCaseAction(
  id: string,
  input: Partial<Omit<CaseInput, 'propositionId'>>
): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

  await updateCase(supabase, id, input)
  revalidatePath('/cases')
  revalidatePath('/')
}

export async function deleteCaseAction(id: string): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

  await deleteCase(supabase, id)
  revalidatePath('/cases')
  revalidatePath('/')
}
