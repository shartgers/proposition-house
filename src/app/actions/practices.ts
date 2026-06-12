'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createPractice,
  updatePractice,
  deletePractice,
  type PracticeInput,
  type PracticeUpdate,
} from '@/lib/practice-mutations'

export async function createPracticeAction(input: PracticeInput) {
  const supabase = await createClient()
  const result = await createPractice(supabase, input)
  revalidatePath('/')
  revalidatePath('/practices')
  return result
}

export async function updatePracticeAction(id: string, input: PracticeUpdate) {
  const supabase = await createClient()
  await updatePractice(supabase, id, input)
  revalidatePath('/')
  revalidatePath('/practices')
}

export async function deletePracticeAction(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  try {
    await deletePractice(supabase, id)
    revalidatePath('/')
    revalidatePath('/practices')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Delete failed' }
  }
}
