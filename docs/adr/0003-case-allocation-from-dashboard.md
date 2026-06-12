# Case allocation is possible from the Dashboard, not only from the Case library

The Dashboard gains a Case Tray — a collapsible panel below the Offering grid — from which Unallocated Cases can be dragged onto Offering cards or into the Offering detail pane. Cases already in an Offering can be unallocated via an × button in the detail pane. The Case library (`/cases`) retains allocation UI as a secondary surface.

## Why not keep allocation only on the Case library page?

The Case library is built for bulk triage: filter 99 cases, assign them one by one. The Dashboard is built for editorial review: look at an Offering, decide what evidence belongs to it. These are different mental modes. Forcing users to navigate away from the Dashboard to allocate a case breaks the editorial flow. The Case Tray keeps the user in context.

## Why drag-and-drop rather than a click/select interaction?

The spatial metaphor matches the mental model: cases are pulled from a pool and placed on an offering. It also differentiates the Dashboard allocation UX from the Case library's dropdown-based approach, so the two surfaces feel complementary rather than redundant.

## Trade-offs accepted

- `DndContext` must wrap the Dashboard's main content area, adding dnd-kit coupling to the dashboard component tree.
- Tray case data is fetched lazily (on first expand) and managed in Dashboard state, separate from the SSR data load — a second fetch on first open.
- Unallocation from the detail pane (× button) is not drag-based, breaking the drag-only metaphor slightly. Chosen for safety: drag-back is hard to discover and easy to misfire.
