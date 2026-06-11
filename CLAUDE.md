@AGENTS.md

## Domain context

**Xomnia** is a Dutch AI consultancy ("We make AI work"). This repo is the **proposition house** — the product/marketing layer that organises Xomnia's service portfolio and client evidence.

Xomnia operates two brands:
- **Xomnia** — enterprise AI engagements with large Dutch organisations.
- **Aurai** — scale-up and mid-market engagements; cases are marked `(Aurai)`.

### The five propositions

All services and client cases map to one of these five propositions:

| # | Name | Focus |
|---|------|-------|
| 01 | Clear direction with AI | AI strategy, Phase Zero, use-case prioritisation, roadmapping |
| 02 | AI and Agentic solutions | Models, agents, connectors — from PoC to production |
| 03 | Intelligent Workflows | Workflow redesign, human-agent orchestration |
| 04 | Data Foundation | AI-ready data platforms, cloud infrastructure, data quality |
| 05 | Trusted AI | AI governance, EU AI Act, DORA, sovereign LLMs, responsible AI |

### Proof levels

Cases carry a **Proof** rating indicating evidential strength:
- **High** — flagship reference, production results, strong external proof
- **Medium** / **Medium-High** — solid engagement, often published externally
- **Low-Medium** — completed but limited external visibility
- **Ongoing** — active engagement, no result yet

### Key facts (June 2026, v3)

- 99 client cases across all five propositions
- Sectors: energy/utilities, financial services, public sector, telecom, healthcare, retail, manufacturing, logistics, aviation, NGOs
- Recurring clients: Alliander, Enexis, VodafoneZiggo, Rabobank, ING, ProRail

### Source of truth

Full deduplicated case list (99 cases with descriptions and results): `input/xomnia_use_cases.md`

Original source document: `input/xomnia_use_cases.docx`

---

## Agent skills

### Issue tracker

Issues live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
