# Portal AI 1.3a

## Overview

Sprint Portal AI 1.3a extends the portal assistant from intent and draft preparation into deterministic operational intelligence.

Focus areas:

- duplicate incident detection
- operational summaries
- escalation detection
- operational routing
- property operational context enrichment

The existing architecture is preserved:

```text
PortalChatLauncher.tsx
  -> /api/portal/chat
  -> ai-layer.service.ts
  -> Business Central AI Layer
```

The deterministic fallback path remains active. If the AI layer fails, the portal still returns the same operational intelligence signals using rule-based services.

## New Services

- `src/lib/portal/duplicate-incident-detector.service.ts`
- `src/lib/portal/incident-summary.service.ts`
- `src/lib/portal/escalation-detector.service.ts`
- `src/lib/portal/operational-routing.service.ts`

## Updated Components

- `src/lib/portal/portal-ai-context-builder.ts`
- `src/app/api/portal/chat/route.ts`
- `src/components/portal/PortalChatLauncher.tsx`

## Duplicate Incident Detection

Duplicate detection is deterministic and tenant-scoped.

### Inputs used

- current user message
- detected intent
- tenant-visible incidents from `getIncidents()`
- current contract and property context

### Signals used

- same `fixedRealEstateNo`
- same `contractNo`
- overlap between message keywords and incident title/description
- overlap in maintenance signals such as humidity, leak, electricity, smoke
- whether the matching incident is still open

### Output

The route enriches the reply with:

```json
{
  "duplicateIncident": {
    "isPotentialDuplicate": true,
    "confidence": 0.78,
    "summary": "He encontrado incidencias parecidas...",
    "matches": [
      {
        "id": "...",
        "incidentId": "INC-001",
        "title": "Fuga de agua en cocina",
        "similarity": 0.82,
        "reason": "Coincide con una incidencia muy parecida ya registrada.",
        "href": "/portal/incidents/..."
      }
    ]
  }
}
```

## Escalation Detection

Escalation remains deterministic.

### Escalation signals

- critical or high urgency
- wording such as `sigue igual`, `otra vez`, `sin respuesta`, `lleva dias`
- detected duplicate while an incident is still open
- property operational context showing multiple open incidents

### Levels

- `none`
- `watch`
- `recommended`
- `urgent`

### Behavior

Escalation never triggers automatic execution. It only:

- enriches the reply
- enables escalation guidance
- suggests routing or human review

## Operational Routing

Routing decides the best next portal destination using deterministic logic.

### Examples

- duplicate incident detected -> route to existing incident detail
- maintenance incident -> route to `/portal/incidents`
- invoice question -> route to `/portal/invoices`
- contract question -> route to `/portal/contracts`
- document request -> route to `/portal/documents`

Routing also generates action buttons such as:

- `Revisar incidencia existente`
- `Preparar incidencia`
- `Ir a facturas`

## Property Operational Intelligence

`portal-ai-context-builder.ts` now enriches the context with tenant-safe property intelligence.

### Context added

- related property reference
- related contract number
- open incident count for the property or contract
- total incident count
- latest incident title
- operational status

### Operational status values

- `stable`
- `active_attention`
- `high_attention`

### Example summary

```text
El inmueble ya tiene una incidencia abierta en seguimiento.
```

This context is included in:

- the deterministic reply enrichment
- the compact context text sent to the AI layer

## Operational Summary

The assistant now returns a concise operational summary card that combines:

- property status
- duplicate findings
- escalation needs
- recommended next step

This summary is deterministic and visible in both AI and fallback paths.

## Response Payload

The chat payload is safely extended with:

- `duplicateIncident`
- `operationalSummary`
- `escalation`
- `routing`
- `propertyOperationalIntelligence`

Existing fields such as `answer`, `links`, `suggestions`, `intent`, `incidentDraft`, and `actions` remain intact.

## Frontend Rendering

`PortalChatLauncher.tsx` now renders additional lightweight cards inside the existing assistant message:

- possible duplicate warning
- operational summary
- escalation hint
- property operational context
- routing chip

No redesign was introduced.

## Security Boundaries

All logic remains within tenant and property boundaries already enforced by the portal services.

- duplicate detection only uses incidents returned by `getIncidents()`
- property intelligence only uses tenant-visible contracts and incidents
- no cross-tenant lookup is performed
- no operation is executed automatically

## Fallback Behavior

Fallback is preserved.

If the AI layer fails:

1. `buildPortalChatReply(...)` still returns the chat answer
2. duplicate detection still runs
3. escalation detection still runs
4. operational routing still runs
5. property operational intelligence still runs
6. operational summary still runs

## Local Testing

Run:

```bash
npm run build
npm run dev
```

### Suggested manual tests

1. `Tengo humedad en el baño`
   - incident intent detected
   - property context shown if available
   - create incident action still available

2. `Tengo otra vez humedad en el baño y sigue igual`
   - escalation should move to `watch` or `recommended`
   - operational summary should mention follow-up sensitivity

3. A message that closely matches an already open incident on the same property
   - duplicate detection should show one or more matches
   - routing should prefer `Revisar incidencia existente`

4. `No entiendo esta factura`
   - routing should prefer invoices
   - no duplicate incident card should appear

5. AI fallback simulation
   - all deterministic operational cards should still appear

## Known Limitations

- duplicate scoring is heuristic and based on string overlap
- property intelligence depends on the quality of incident and contract references
- operational summary is concise and does not yet explain every scoring factor
- escalation is guidance only and does not yet connect to a formal escalation workflow

## Next Recommendation

Suggested next step for Portal AI 1.3b:

- add automated test coverage for duplicate scoring and escalation rules
- improve duplicate ranking with richer incident metadata
- add structured operational queues or assignment hints
- introduce a dedicated review state for “update existing incident vs create new one”
