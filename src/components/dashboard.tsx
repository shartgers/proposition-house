'use client'
import { useState, useEffect, useTransition } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { PropositionView, OfferingView } from '@/lib/views'
import type { CaseDetail } from '@/lib/offering-data'
import { fetchAllUnallocatedCases } from '@/lib/offering-data'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { applyOptimisticSwap, applyOptimisticCaseCountUpdate, removeCaseFromUnallocated } from '@/lib/dashboard-logic'
import { createOfferingAction, updateOfferingAction, deleteOfferingAction, moveOfferingAction } from '@/app/actions/offerings'
import { allocateCaseAction } from '@/app/actions/cases'
import { DashboardHeader } from '@/components/dashboard-header'
import { PropositionSidebar } from '@/components/proposition-sidebar'
import { OfferingGrid } from '@/components/offering-grid'
import { CaseTray } from '@/components/case-tray'
import { OfferingCRUDDialogs } from '@/components/offering-crud-dialogs'
import { OfferingDetailLoader } from '@/components/offering-detail-loader'

type Practice = { id: string; name: string }
export function Dashboard({ propositions, practices, initialPropositionNumber, userEmail, userInitials }: { propositions: PropositionView[]; practices: Practice[]; initialPropositionNumber: string; userEmail: string; userInitials: string }) {
  const initial = propositions.find((p) => p.number === initialPropositionNumber) ?? propositions[0]
  const [selectedId, setSelectedId] = useState(initial.id)
  const selected = propositions.find((p) => p.id === selectedId)!
  const [activeOfferingId, setActiveOfferingId] = useState<string | null>(null)
  const [detailRefreshKey, setDetailRefreshKey] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [localOfferingsMap, setLocalOfferingsMap] = useState<Record<string, OfferingView[]>>(() => Object.fromEntries(propositions.map((p) => [p.id, p.offerings])))
  useEffect(() => { setLocalOfferingsMap(Object.fromEntries(propositions.map((p) => [p.id, p.offerings]))) }, [propositions])
  const [movePending, startMoveTransition] = useTransition()
  const [moveError, setMoveError] = useState<string | null>(null)
  const [deleteTransition, startDeleteTransition] = useTransition()
  const [trayOpen, setTrayOpen] = useState(false)
  const [unallocatedCases, setUnallocatedCases] = useState<CaseDetail[] | null>(null)
  const [trayLoading, setTrayLoading] = useState(false)
  const [trayPropositionFilter, setTrayPropositionFilter] = useState<string | 'all'>(initial.id)
  const [allocError, setAllocError] = useState<string | null>(null)
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  // Lazy-fetch the unallocated pool on first tray open (not at page load)
  useEffect(() => {
    if (!trayOpen || unallocatedCases !== null || trayLoading) return
    setTrayLoading(true)
    fetchAllUnallocatedCases(supabase).then((cases) => {
      setUnallocatedCases(cases)
      setTrayLoading(false)
    })
  }, [trayOpen, unallocatedCases, trayLoading, supabase])
  const localOfferings = localOfferingsMap[selectedId] ?? selected.offerings
  const propList = propositions.map((p) => ({ id: p.id, number: p.number, name: p.name }))
  function handleMove(offeringId: string, direction: 'up' | 'down') {
    const current = localOfferingsMap[selectedId] ?? []
    const next = applyOptimisticSwap(current, offeringId, direction)
    if (!next) return
    setLocalOfferingsMap((prev) => ({ ...prev, [selectedId]: next }))
    setMoveError(null)
    startMoveTransition(async () => {
      try { await moveOfferingAction(offeringId, direction) }
      catch { setLocalOfferingsMap((prev) => ({ ...prev, [selectedId]: current })); setMoveError('Failed to reorder offering. Please try again.') }
    })
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Allocate a Case dragged from the tray onto a target Offering, optimistically.
  async function allocateFromTray(caseId: string, targetOfferingId: string) {
    const prevCases = unallocatedCases
    const dragged = prevCases?.find((c) => c.id === caseId)
    if (!dragged) return
    const { next, rollback } = applyOptimisticCaseCountUpdate(localOfferingsMap, { targetOfferingId, delta: 1 })
    setUnallocatedCases(removeCaseFromUnallocated(prevCases ?? [], caseId))
    setLocalOfferingsMap(next)
    setAllocError(null)
    try {
      await allocateCaseAction(caseId, targetOfferingId)
    } catch {
      setUnallocatedCases(prevCases)
      setLocalOfferingsMap(rollback)
      setAllocError('Failed to allocate case. Please try again.')
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const activeData = active.data.current as { type?: string; source?: string } | undefined
    const overData = over.data.current as { type?: string; offeringId?: string } | undefined
    if (activeData?.type !== 'case') return

    const caseId = String(active.id)
    // tray → Offering card
    if (activeData.source === 'tray' && overData?.type === 'offering' && overData.offeringId) {
      allocateFromTray(caseId, overData.offeringId)
    }
  }
  return (
    <div className="flex flex-col h-screen bg-background">
      <DashboardHeader userEmail={userEmail} userInitials={userInitials} />
      <div className="flex flex-1 overflow-hidden">
        <PropositionSidebar propositions={propositions} selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); setActiveOfferingId(null); setShowAddForm(false); setEditingId(null); setTrayPropositionFilter(id) }} />
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 260 }}>
            <OfferingGrid propositionNumber={selected.number} propositionName={selected.name} offerings={localOfferings}
              activeOfferingId={activeOfferingId} movePending={movePending} moveError={moveError ?? allocError}
              onOpenOffering={(id) => { setShowAddForm(false); setEditingId(null); setActiveOfferingId(activeOfferingId === id ? null : id) }}
              onMove={handleMove} onEdit={(id) => { setEditingId(id); setActiveOfferingId(null) }}
              onDelete={setDeletingId} onAddOffering={() => { setShowAddForm(true); setEditingId(null); setActiveOfferingId(null) }} />
            <CaseTray open={trayOpen} onToggle={() => setTrayOpen((v) => !v)}
              cases={unallocatedCases} loading={trayLoading} propositions={propList}
              filter={trayPropositionFilter} onFilterChange={setTrayPropositionFilter} />
          </div>
          <OfferingDetailLoader supabase={supabase} activeOfferingId={activeOfferingId} refreshKey={detailRefreshKey} onClose={() => setActiveOfferingId(null)} />
        </DndContext>
      </div>
      <OfferingCRUDDialogs showAddForm={showAddForm} onAddCancel={() => setShowAddForm(false)}
        onAddSubmit={async (input) => { await createOfferingAction(input); setShowAddForm(false) }}
        editingId={editingId} editingOffering={editingId ? (selected.offerings.find((o) => o.id === editingId) ?? null) : null}
        selectedPropositionId={selected.id} onEditCancel={() => setEditingId(null)}
        onEditSubmit={async (id, input) => { await updateOfferingAction(id, input); setEditingId(null); if (activeOfferingId === id) setDetailRefreshKey((k) => k + 1) }}
        deletingId={deletingId} onDeleteCancel={() => setDeletingId(null)}
        onDeleteConfirm={() => { if (!deletingId) return; startDeleteTransition(async () => { await deleteOfferingAction(deletingId); if (activeOfferingId === deletingId) setActiveOfferingId(null); setDeletingId(null) }) }}
        deleteTransition={deleteTransition} practices={practices} propositions={propList} />
    </div>
  )
}
