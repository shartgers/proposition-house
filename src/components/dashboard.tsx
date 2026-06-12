'use client'

import { useState, useEffect, useTransition } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { ChevronRight, Briefcase, Users, LogOut, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, Settings2, Library } from 'lucide-react'
import type { Proposition } from '@/lib/dashboard-data'
import type { OfferingDetail } from '@/lib/offering-data'
import { fetchOfferingDetail } from '@/lib/offering-data'
import { OfferingPanel } from '@/components/offering-panel'
import { OfferingForm } from '@/components/offering-form'
import {
  createOfferingAction,
  updateOfferingAction,
  deleteOfferingAction,
  moveOfferingAction,
} from '@/app/actions/offerings'

const STYLES = {
  '01': { dot: 'bg-blue-500', activeBar: 'border-l-blue-500', num: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', cardAccent: 'hover:border-blue-200', cardActive: 'border-blue-300 bg-blue-50/50' },
  '02': { dot: 'bg-violet-500', activeBar: 'border-l-violet-500', num: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', cardAccent: 'hover:border-violet-200', cardActive: 'border-violet-300 bg-violet-50/50' },
  '03': { dot: 'bg-emerald-500', activeBar: 'border-l-emerald-500', num: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', cardAccent: 'hover:border-emerald-200', cardActive: 'border-emerald-300 bg-emerald-50/50' },
  '04': { dot: 'bg-amber-500', activeBar: 'border-l-amber-500', num: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', cardAccent: 'hover:border-amber-200', cardActive: 'border-amber-300 bg-amber-50/50' },
  '05': { dot: 'bg-rose-500', activeBar: 'border-l-rose-500', num: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', cardAccent: 'hover:border-rose-200', cardActive: 'border-rose-300 bg-rose-50/50' },
}

type Practice = { id: string; name: string }

export function Dashboard({
  propositions,
  practices,
  initialPropositionNumber,
  userEmail,
  userInitials,
}: {
  propositions: Proposition[]
  practices: Practice[]
  initialPropositionNumber: string
  userEmail: string
  userInitials: string
}) {
  const initial = propositions.find((p) => p.number === initialPropositionNumber) ?? propositions[0]
  const [selectedId, setSelectedId] = useState(initial.id)
  const selected = propositions.find((p) => p.id === selectedId)!
  const s = STYLES[selected.number as keyof typeof STYLES]
  const totalCases = selected.offerings.reduce((n, o) => n + o.caseCount, 0)

  // Offering detail panel
  const [activeOfferingId, setActiveOfferingId] = useState<string | null>(null)
  const [offeringDetail, setOfferingDetail] = useState<OfferingDetail | null>(null)
  const [loadingOffering, setLoadingOffering] = useState(false)
  const panelOpen = activeOfferingId !== null

  // Add / edit form
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTransition, startDeleteTransition] = useTransition()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!activeOfferingId) return
    setLoadingOffering(true)
    fetchOfferingDetail(supabase, activeOfferingId).then((detail) => {
      setOfferingDetail(detail)
      setLoadingOffering(false)
    })
  }, [activeOfferingId])

  function openOffering(id: string) {
    setShowAddForm(false)
    setEditingId(null)
    setActiveOfferingId(activeOfferingId === id ? null : id)
  }

  function closePanel() {
    setActiveOfferingId(null)
  }


  async function handleAdd(input: Parameters<typeof createOfferingAction>[0]) {
    await createOfferingAction(input)
    setShowAddForm(false)
  }

  async function handleEdit(id: string, input: Parameters<typeof updateOfferingAction>[1]) {
    await updateOfferingAction(id, input)
    setEditingId(null)
    if (activeOfferingId === id) {
      setLoadingOffering(true)
      fetchOfferingDetail(supabase, id).then((d) => { setOfferingDetail(d); setLoadingOffering(false) })
    }
  }

  function confirmDelete(id: string) {
    setDeletingId(id)
  }

  function handleDeleteConfirm() {
    if (!deletingId) return
    startDeleteTransition(async () => {
      await deleteOfferingAction(deletingId)
      if (activeOfferingId === deletingId) closePanel()
      setDeletingId(null)
    })
  }

  const propList = propositions.map((p) => ({ id: p.id, number: p.number, name: p.name }))

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card flex-shrink-0 shadow-soft">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Xomnia</p>
          <h1 className="font-heading text-base font-semibold leading-tight">Proposition House</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
          <Link
            href="/cases"
            title="Case library"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Library className="w-4 h-4" />
          </Link>
          <Link
            href="/practices"
            title="Manage practices"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {userInitials}
          </div>
          <form action="/auth/signout" method="POST">
            <button type="submit" title="Sign out" className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r border-border bg-accent flex-shrink-0 overflow-y-auto py-3">
          <p className="px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Propositions</p>
          {propositions.map((prop) => {
            const ps = STYLES[prop.number as keyof typeof STYLES]
            const isActive = prop.id === selectedId
            const cases = prop.offerings.reduce((n, o) => n + o.caseCount, 0)
            return (
              <button
                key={prop.id}
                onClick={() => { setSelectedId(prop.id); setActiveOfferingId(null); setShowAddForm(false); setEditingId(null) }}
                className={`w-full text-left px-4 py-3 border-l-2 transition-all ${isActive ? `${ps.activeBar} bg-background shadow-soft` : 'border-l-transparent hover:bg-background/60'}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ps.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${isActive ? ps.num : 'text-muted-foreground'}`}>{prop.number}</p>
                    <p className="text-sm font-medium leading-snug truncate">{prop.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{prop.offerings.length} offerings · {cases} cases</p>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />}
                </div>
              </button>
            )
          })}
        </nav>

        {/* Content panel */}
        <main className="flex-1 overflow-y-auto p-8 bg-background" style={{ minWidth: 260 }}>
          <div className="max-w-xl">
            <div className="flex items-start justify-between mb-7">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${s.num}`}>{selected.number}</p>
                <h2 className="font-heading text-2xl font-semibold">{selected.name}</h2>
                <p className="text-muted-foreground text-sm mt-1.5">{selected.offerings.length} offerings · {totalCases} cases</p>
              </div>
              <button
                onClick={() => { setShowAddForm(true); setEditingId(null); setActiveOfferingId(null) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add offering
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {selected.offerings.map((offering, idx) => {
                const isOfferingActive = activeOfferingId === offering.id
                const isEditing = editingId === offering.id

                return (
                  <div
                    key={offering.id}
                    className={`group relative rounded-xl border bg-card shadow-soft transition-all duration-200 ${isOfferingActive ? s.cardActive : `border-border ${s.cardAccent}`}`}
                  >
                    {/* Card body — clickable for detail */}
                    <button
                      onClick={() => openOffering(offering.id)}
                      className="w-full text-left p-5 hover:-translate-y-0.5 transition-transform duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <p className="font-heading text-sm font-semibold leading-snug">{offering.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>{offering.caseCount}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Briefcase className="w-3 h-3 flex-shrink-0" />
                          <span>{offering.practice}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          <span>{offering.practiceOwner}</span>
                        </div>
                      </div>
                    </button>

                    {/* Action toolbar — appears on hover */}
                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-0.5 bg-card/90 backdrop-blur-sm rounded-lg border border-border px-1 py-0.5 shadow-soft">
                      <button
                        onClick={() => moveOfferingAction(offering.id, 'up')}
                        disabled={idx === 0}
                        title="Move up"
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveOfferingAction(offering.id, 'down')}
                        disabled={idx === selected.offerings.length - 1}
                        title="Move down"
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-4 bg-border mx-0.5" />
                      <button
                        onClick={() => { setEditingId(offering.id); setActiveOfferingId(null) }}
                        title="Edit"
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => confirmDelete(offering.id)}
                        title="Delete"
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        {/* Offering detail panel */}
        <div className={`flex-shrink-0 border-l border-border bg-card overflow-hidden transition-[width] duration-300 ease-in-out ${panelOpen ? 'w-[560px]' : 'w-0'}`}>
          <div className="w-[560px] h-full">
            <OfferingPanel offering={offeringDetail} loading={loadingOffering} onClose={closePanel} />
          </div>
        </div>
      </div>

      {/* Edit offering dialog */}
      {editingId && (() => {
        const editingOffering = selected.offerings.find((o) => o.id === editingId)
        if (!editingOffering) return null
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-[520px] max-h-[90vh] overflow-y-auto space-y-4">
              <h3 className="font-heading text-base font-semibold">Edit offering</h3>
              <OfferingForm
                initial={{
                  name: editingOffering.name,
                  propositionId: selected.id,
                  practiceId: editingOffering.practiceId ?? '',
                  description: editingOffering.description ?? '',
                  keyOutcomes: editingOffering.keyOutcomes ?? '',
                }}
                practices={practices}
                propositions={propList}
                onSubmit={(input) => handleEdit(editingId, input)}
                onCancel={() => setEditingId(null)}
                submitLabel="Save changes"
              />
            </div>
          </div>
        )
      })()}

      {/* Add offering dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-[520px] max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-heading text-base font-semibold">New offering</h3>
            <OfferingForm
              initial={{ propositionId: selected.id }}
              practices={practices}
              propositions={propList}
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              submitLabel="Add offering"
            />
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-soft-xl p-6 w-80 space-y-4">
            <h3 className="font-heading text-base font-semibold">Delete offering?</h3>
            <p className="text-sm text-muted-foreground">This will remove the offering and unlink its cases. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteTransition}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {deleteTransition && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
