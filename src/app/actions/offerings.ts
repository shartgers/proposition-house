'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  createOffering,
  updateOffering,
  deleteOffering,
  moveOffering,
  type OfferingInput,
} from '@/lib/offering-mutations'

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

export async function createOfferingAction(input: OfferingInput) {
  const supabase = await getSupabase()
  const result = await createOffering(supabase, input)
  revalidatePath('/')
  return result
}

export async function updateOfferingAction(id: string, input: Partial<OfferingInput>) {
  const supabase = await getSupabase()
  await updateOffering(supabase, id, input)
  revalidatePath('/')
}

export async function deleteOfferingAction(id: string) {
  const supabase = await getSupabase()
  await deleteOffering(supabase, id)
  revalidatePath('/')
}

export async function moveOfferingAction(id: string, direction: 'up' | 'down') {
  const supabase = await getSupabase()
  await moveOffering(supabase, id, direction)
  revalidatePath('/')
}
