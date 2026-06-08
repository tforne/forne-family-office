# Portal AI 1.6 - Incident Detail Intelligence

## Summary

Sprint 1.6 upgrades the incident detail page from a raw record view into an AI-assisted operational workspace.

The incident page now shows a deterministic intelligence card grounded in visible incident data, comments, and related tenant-visible incidents. The card helps the user understand:

- current operational state
- urgency and escalation level
- repeated issue hints
- latest visible activity
- recommended next step
- timeline summary
- safe manual follow-up actions

## Files Changed

Created:

- `src/lib/portal/incident-detail-intelligence.service.ts`
- `src/lib/portal/__tests__/incident-detail-intelligence.service.test.ts`
- `docs/portal-ai-1.6-incident-detail-intelligence.md`

Modified:

- `src/app/portal/incidents/[id]/page.tsx`

## Architecture

The new page-level intelligence is built server-side from data the detail page already loads:

```text
incident detail page
  -> getIncidents()
  -> getIncidentComments()
  -> buildIncidentDetailIntelligence(...)
  -> lightweight intelligence card in the existing page
```

No extra AI call is made. All logic is deterministic and grounded in tenant-visible data only.

## Intelligence Model

The service returns:

- detected problem
- operational status
- priority and urgency
- operational risk summary
- latest activity label
- recommended next step
- repeated issue flag
- escalation label
- compact timeline summary
- manual next-action links

## Operational Status Logic

The current implementation uses deterministic rules such as:

- `Nuevo`
  - active incident, recently created, no visible comments yet
- `En seguimiento`
  - active incident with visible activity and no strong escalation signals
- `Pendiente de revisión`
  - active incident with no comment history after the initial creation window
- `Atención requerida`
  - active incident with strong escalation signals or stale activity
- `Urgente`
  - critical/high risk signals such as gas, electricity, smoke, severe leakage
- `Resuelto recientemente`
  - resolved or non-active incident with visible closure data

## Timeline Logic

Timeline intelligence only summarizes real data already visible in the portal, for example:

- incident creation age
- latest visible comment age
- visible next control date
- whether the incident still appears open
- visible resolution date if present

No events are hallucinated or inferred as if they had occurred.

## Escalation Logic

The service reuses the existing deterministic intent and escalation patterns from earlier portal AI sprints.

Examples of risk-sensitive signals:

- gas
- electricity
- smoke
- water leak
- neighbor impact
- recurrent humidity/filtration patterns

These are converted into friendly labels such as:

- `Urgente`
- `Atención recomendada`
- `Seguimiento sensible`

## Recommended Actions

The intelligence card only suggests manual next steps.

Typical actions:

- `Añadir comentario`
- `Añadir foto`
- `Contactar soporte`
- `Ver incidencias relacionadas`

They link to existing sections or flows. No action is executed automatically.

## Testing Instructions

Run:

```bash
npm run test
npm run build
```

Added service-level tests for:

1. open humidity incident summary
2. repeated issue detection
3. urgent escalation/risk detection
4. recently resolved incident status
5. safe handling when comments are missing

## Manual QA

### Open maintenance incident

Open an active humidity incident.

Expected:

- intelligence card visible
- operational status shown
- latest activity shown
- recommended next step shown

### Repeated issue

Open an incident with related prior incidents on the same property or contract.

Expected:

- repeated issue hint visible
- risk copy references recurrence

### Urgent case

Open an incident with gas, electricity, smoke, or severe leak wording.

Expected:

- urgent or high-attention status
- visible escalation/risk labels
- support-oriented manual action

### Recently resolved

Open a recently resolved incident.

Expected:

- `Resuelto recientemente`
- contextual recommendation focused on review/reference

## Known Limitations

- The current related-incident heuristic is deterministic and intentionally conservative.
- `Añadir foto` currently routes the user to the existing incident contact area rather than a dedicated attachment flow.
- The checked-in `AGENTS.md` and current codebase may include other sprint work in progress; this feature only touches the incident detail intelligence scope.

## Next Sprint Recommendation

- Add dedicated incident detail action handlers for comment/photo workflows inside the page itself.
- Surface more explicit “awaiting response” vs “awaiting tenant input” states if Business Central exposes them.
- Reuse this intelligence model in admin or cross-incident operational views if those remain tenant-safe.
