'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  createPractice,
  updatePractice,
  deletePractice,
  type PracticeInput,
} from '@/lib/practice-mutations'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}

export async function createPracticeAction(input: PracticeInput) {
  const supabase = await getSupabase()
  const result = await createPractice(supabase, input)
  revalidatePath('/')
  revalidatePath('/practices')
  return result
}

export async function updatePracticeAction(id: string, input: Partial<PracticeInput>) {
  const supabase = await getSupabase()
  await updatePractice(supabase, id, input)
  revalidatePath('/')
  revalidatePath('/practices')
}

export async function deletePracticeAction(id: string): Promise<{ error?: string }> {
  const supabase = await getSupabase()
  try {
    await deletePractice(supabase, id)
    revalidatePath('/')
    revalidatePath('/practices')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Delete failed' }
  }
}
