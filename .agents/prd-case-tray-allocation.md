# PRD: Case Tray — Drag-and-Drop Allocation from the Dashboard

## Problem Statement

Allocating Unallocated Cases to Offerings currently requires navigating away from the Dashboard to the Case Library page. This breaks the editorial workflow: a user reviewing an Offering's evidence in the Dashboard must context-switch to `/cases`, locate the right Case, assign it via a dropdown, then navigate back. There is no way to see which Cases are available while looking at the Offering they belong on.

## Solution

Add a **Case Tray** to the Dashboard — a collapsible panel below the Offering grid that lists all Unallocated Cases. Users drag Cases from the tray onto Offering cards in the grid, or onto the drop zone in the Offering detail pane, to allocate them. Cases already allocated to an Offering can be unallocated via an × button in the detail pane. The Case Library remains available as a secondary allocation surface for bulk triage work.

## User Stories

1. As an editor, I want to see all Unallocated Cases in a tray below the Offering grid, so that I know what evidence is available to assign while reviewing the Dashboard.
2. As an editor, I want the Case Tray to be collapsible, so that I can hide it when I'm not allocating and focus on the Offering grid.
3. As an editor, I want the Case Tray's proposition filter to automatically match the Proposition I've selected in the sidebar, so that I immediately see the most relevant Unallocated Cases.
4. As an editor, I want to change the Case Tray's proposition filter manually, so that I can allocate Cases from any Proposition to the currently viewed Offerings.
5. As an editor, I want to drag a Case from the tray onto an Offering card in the grid, so that I can allocate it without leaving the Dashboard.
6. As an editor, I want the Offering card's case count badge to update immediately after I drop a Case onto it, so that I get instant confirmation the allocation worked.
7. As an editor, I want to drag a Case from the tray into the open Offering detail pane, so that I can allocate it while reviewing the Offering's full description and existing Cases.
8. As an editor, I want a visual highlight on Offering cards and the detail pane when I'm dragging a Case over them, so that I know where I can drop it.
9. As an editor, I want the Case to disappear from the tray immediately after I drop it onto an Offering, so that the tray always reflects the current unallocated pool without a page refresh.
10. As an editor, I want the allocation to roll back optimistically if the server call fails, so that the UI doesn't get out of sync silently.
11. As an editor, I want to drag a Case that's already allocated to one Offering onto a different Offering card, so that I can reassign evidence without going to the Case Library.
12. As an editor, I want to click the × button on a Case row in the Offering detail pane, so that I can send it back to Unallocated without navigating to the Case Library.
13. As an editor, I want the unallocated Case to reappear in the tray immediately after I click ×, so that I can drag it onto a different Offering right away.
14. As an editor, I want the Offering card's case count badge to decrement immediately when I unallocate a Case from the detail pane, so that the grid stays accurate.
15. As an editor, I want cross-proposition allocation to work — dragging a Case whose Proposition differs from the target Offering's Proposition — so that I'm not constrained by the Case's original Proposition when placing evidence.
16. As an editor, I want the detail pane to refresh its Cases list after a successful drop onto it, so that the newly allocated Case appears in the correct Proof-level order.
17. As an editor, I want the detail pane to stay open when I drop a Case onto an Offering card in the grid (not the detail pane), so that my current review context isn't disrupted.

## Implementation Decisions

- **New server action `unallocateCaseAction(caseId)`**: sets `offering_id = null` on the Case; `proposition_id` is left as-is (it was already updated to the Offering's Proposition on allocation and remains correct for the unallocated state).

- **New lib function `fetchAllUnallocatedCases(supabase)`**: fetches all Cases where `offering_id IS NULL`, returning `CaseDetail[]` sorted by Proof level descending. No proposition filter at the DB level — filtering is done client-side in the tray so proposition-switching is instant.

- **`DndContext` lives in `Dashboard`**: wraps the entire main content area (sidebar excluded). `onDragEnd` receives a dragged Case id and a target Offering id (or "tray" for unallocation), calls the appropriate server action, and applies optimistic state updates.

- **Draggable items**: Case items in the Case Tray; Case rows in the Offering detail pane (for re-allocation and the drag-back gesture, complemented by the × button).

- **Droppable targets**: each Offering card in the Offering grid; the Cases section of the Offering detail pane.

- **Optimistic badge count**: `localOfferingsMap` in `Dashboard` (already used for Offering reorder) is updated on drop — increment the target Offering's `caseCount`, decrement the source Offering's `caseCount` if the Case was previously allocated. Rolled back on server error.

- **Tray state in `Dashboard`**: `unallocatedCases: CaseDetail[]` fetched lazily on first tray open via the Supabase browser client (same pattern as `OfferingDetailLoader`). `trayOpen: boolean` controls visibility.

- **Proposition filter**: `trayPropositionFilter` in `Dashboard` state, initialised to the selected Proposition id and reset when the sidebar selection changes. Filtering applied client-side over the full `unallocatedCases` list.

- **Detail pane refresh after drop onto pane**: `detailRefreshKey` (already exists in `Dashboard`) is incremented after a successful allocation onto the detail pane, triggering `OfferingDetailLoader` to re-fetch.

- **No detail pane auto-open on grid card drop**: dropping a Case onto an Offering card updates the badge count only; the detail pane state is not changed.

- **Cross-proposition allocation**: already handled by the existing `allocateCase` mutation, which updates both `offering_id` and `proposition_id` on the Case row. No new DB work needed.

- **`CaseTray` component**: new component, lives below the Offering grid in a flex-column layout replacing the current `OfferingGrid` full-height `main` element. Collapsible via a toggle handle. Shows proposition filter chips and a scrollable list of draggable Case items.

- **`OfferingGrid` changes**: Offering cards become `useDroppable` targets. A drag-over highlight (coloured border, matching the Proposition accent colour) is applied during drag.

- **`OfferingPanel` changes**: Cases section gains a drop zone (`useDroppable`). Each Case row gains an × unallocate button visible on hover.

## Testing Decisions

Good tests verify observable behaviour at the highest stable seam — what the function returns or what state it produces — not the internal implementation. Avoid testing component rendering details; test server-side mutations and pure state logic.

- **`unallocateCase` in `case-mutations.ts`**: integration test against a real Supabase client (same pattern as existing `schema.test.ts`). Assert that after calling `unallocateCase`, the Case row has `offering_id = null` and `proposition_id` unchanged.

- **Optimistic state reducer for the Case Tray**: pure function tests in the style of the existing `dashboard-logic.test.ts`. Given an `unallocatedCases` list and an allocation event, assert the returned list excludes the allocated Case. Given a deallocation event, assert the Case is appended.

- **`applyOptimisticCaseCountUpdate`** (new pure function in `dashboard-logic.ts`): unit tests asserting correct increment/decrement of `caseCount` on the target and source Offerings in `localOfferingsMap`, including the rollback shape.

- **`fetchAllUnallocatedCases`**: integration test against Supabase — seed some allocated and unallocated Cases, assert only unallocated ones are returned, sorted by Proof level.

## Out of Scope

- Drag-and-drop reordering of Cases within an Offering (Cases are sorted by Proof level, not manually ordered).
- Showing allocated Cases in the Case Tray (tray is Unallocated Cases only).
- Any allocation UI on the `/cases` Case Library page being removed or changed.
- Mobile / touch drag-and-drop support (dnd-kit supports it but the Dashboard layout is desktop-only).
- Bulk allocation (dragging multiple Cases at once).

## Further Notes

- `allocateCaseAction` already exists and correctly updates both `offering_id` and `proposition_id`. It returns offering metadata (`offeringName`, `practiceName`, `propositionName`) which can be used to update optimistic state.
- ADR-0003 documents the rationale for embedding allocation in the Dashboard rather than keeping it solely on the Case Library page.
- ADR-0002 documents why deleting an Offering orphans (unallocates) its Cases rather than cascading — consistent with the × unallocate behaviour introduced here.
