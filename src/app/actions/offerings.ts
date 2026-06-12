'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createOffering,
  updateOffering,
  deleteOffering,
  moveOffering,
  type OfferingInput,
} from '@/lib/offering-mutations'

export async function createOfferingAction(input: OfferingInput) {
  const supabase = await createClient()
  const result = await createOffering(supabase, input)
  revalidatePath('/')
  return result
}

export async function updateOfferingAction(id: string, input: Partial<OfferingInput>) {
  const supabase = await createClient()
  await updateOffering(supabase, id, input)
  revalidatePath('/')
}

export async function deleteOfferingAction(id: string) {
  const supabase = await createClient()
  await deleteOffering(supabase, id)
  revalidatePath('/')
}

export async function moveOfferingAction(id: string, direction: 'up' | 'down') {
  const supabase = await createClient()
  await moveOffering(supabase, id, direction)
  revalidatePath('/')
}
