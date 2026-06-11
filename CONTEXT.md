    # Proposition House

The product/marketing layer that organises Xomnia's service portfolio and client evidence. It serves two primary purposes: (1) define and maintain Offerings within each Proposition, and (2) allocate the Case library to those Offerings. Cases start unallocated; assigning them to Offerings is a core editorial workflow.

## Auth

Google SSO via Supabase Auth. All routes require authentication. See ADR-0001.

## Views

**Dashboard**: Five Proposition columns, each listing its Offerings. Clicking an Offering opens the Offering detail view.

**Offering detail**: Shows the Offering's description, key outcomes/deliverables, Practice, Practice Owner, and associated Cases.

**Case detail**: Shows all six Case properties.

**Case library**: Full filterable list of all Cases, including Unallocated Cases. Filters: Proposition, Offering, Proof level, Sector, Practice. Primary surface for allocating Cases to Offerings.

## Users

Internal Xomnia staff only. Both read and write require authentication. There is no public-facing view.

## Language

**Case**:
A named, dated, client-specific engagement with a documented result. The primary unit of evidence in the portfolio. A Case belongs to at most one Offering; a Case with no Offering assigned is **Unallocated**. Within an Offering, Cases are sorted by Proof level descending. Properties: client name, sector, date range, Proof level, description, result.
_Avoid_: Use case, client case, project, engagement

**Unallocated Case**:
A Case not yet assigned to any Offering. A Case stores its Proposition directly. When allocated to an Offering, the Case's Proposition is updated to match the Offering's Proposition. All 99 seeded Cases start with Proposition set and Offering null. A Case can be reassigned to an Offering in any Proposition.
_Avoid_: Orphaned, unassigned, pending

**Proposition**:
One of Xomnia's five top-level service areas (e.g. "Clear direction with AI"). Groups related offerings and cases.
_Avoid_: Service line, category, pillar

**Offering**:
A named, repeatable service within a proposition (e.g. "AI Board Brief", "MLOps maturity scan"). The thing Xomnia sells. An Offering belongs to exactly one Proposition and exactly one Practice. Offerings are manually ordered within their Proposition. Properties: name, description, key outcomes/deliverables, Practice, Practice Owner, sort order.
_Avoid_: Service, product, deliverable

**Practice**:
An internal Xomnia team or capability group that owns and delivers Offerings (e.g. "Data Engineering", "AI Strategy"). A Practice has one Practice Owner.
_Avoid_: Team, department, capability

**Practice Owner**:
The named Xomnia person responsible for a Practice.
_Avoid_: Lead, manager, contact

**Proof**:
A rating on a Case indicating evidential strength: High, Medium-High, Medium, Low-Medium, or Ongoing.
_Avoid_: Confidence, quality, rating, score
