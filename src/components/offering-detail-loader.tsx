'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { OfferingDetail, CaseDetail } from '@/lib/offering-data'
import { fetchOfferingDetail } from '@/lib/offering-data'
import { OfferingPanel } from '@/components/offering-panel'

export type OfferingDetailLoaderProps = {
  supabase: SupabaseClient
  activeOfferingId: string | null
  /** Increment to force a re-fetch without changing the active offering id */
  refreshKey?: number
  onClose: () => void
  onUnallocateCase: (c: CaseDetail) => void
}

export function OfferingDetailLoader({ supabase, activeOfferingId, refreshKey = 0, onClose, onUnallocateCase }: OfferingDetailLoaderProps) {
  const [offeringDetail, setOfferingDetail] = useState<OfferingDetail | null>(null)
  const [loadingOffering, setLoadingOffering] = useState(false)

  useEffect(() => {
    if (!activeOfferingId) return
    setLoadingOffering(true)
    fetchOfferingDetail(supabase, activeOfferingId).then((detail) => {
      setOfferingDetail(detail)
      setLoadingOffering(false)
    })
  }, [activeOfferingId, refreshKey])

  const panelOpen = activeOfferingId !== null

  return (
    <div className={`flex-shrink-0 border-l border-border bg-card overflow-hidden transition-[width] duration-300 ease-in-out ${panelOpen ? 'w-[560px]' : 'w-0'}`}>
      <div className="w-[560px] h-full">
        <OfferingPanel offering={offeringDetail} loading={loadingOffering} onClose={onClose} onUnallocateCase={onUnallocateCase} />
      </div>
    </div>
  )
}
