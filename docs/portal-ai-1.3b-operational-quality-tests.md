# Portal AI 1.3b

## Summary

Sprint Portal AI 1.3b hardens the deterministic operational intelligence layer added in 1.3a.

Main goals completed:

- automated tests for deterministic portal AI rules
- safer duplicate detection with reduced false positives
- escalation and routing test coverage
- user-friendly labels for tenant-facing UI
- improved copy in operational cards

The frontend structure was preserved. No redesign was introduced.

## Files Changed

### Created

- `vitest.config.ts`
- `src/lib/portal/portal-ai-labels.ts`
- `src/lib/portal/__tests__/intent-detector.service.test.ts`
- `src/lib/portal/__tests__/incident-draft.service.test.ts`
- `src/lib/portal/__tests__/escalation-detector.service.test.ts`
- `src/lib/portal/__tests__/duplicate-incident-detector.service.test.ts`
- `src/lib/portal/__tests__/operational-routing.service.test.ts`
- `docs/portal-ai-1.3b-operational-quality-tests.md`

### Modified

- `package.json`
- `src/lib/portal/duplicate-incident-detector.service.ts`
- `src/lib/portal/escalation-detector.service.ts`
- `src/lib/portal/operational-routing.service.ts`
- `src/lib/portal/incident-summary.service.ts`
- `src/components/portal/PortalChatLauncher.tsx`

## Test Framework Used

Vitest was added as a lightweight test runner.

Run tests with:

```bash
npm run test
```

## Test Cases Added

### Intent detector

- maintenance incident
- urgent water leak
- critical gas issue
- invoice question
- contract question
- document request overriding contract intent
- support request

### Incident draft

- draft generated for maintenance messages
- no draft for non-incident intents

### Escalation detector

- gas issue -> urgent
- water leak to neighbor -> recommended/urgent
- ordinary humidity -> not urgent
- repeated unresolved complaint -> watch/recommended

### Duplicate detector

- positive duplicate on same property
- negative duplicate for invoice query
- lower confidence on different property
- lower confidence on closed incident
- repeated unresolved complaint stays duplicate-friendly

### Operational routing

- invoice -> `/portal/invoices`
- document request -> `/portal/documents`
- maintenance issue -> `/portal/incidents`
- duplicate detected -> existing incident detail

## Duplicate Scoring Improvements

Duplicate detection is now more conservative.

### Confidence increases when

- same property
- same contract
- strong operational keyword overlap
- incident is still open
- message indicates repetition like `otra vez` or `sigue igual`

### Confidence decreases when

- explicit different property
- explicit different contract
- incident is already closed
- only generic wording overlaps
- no property/contract match and weak overlap

### Threshold

Potential duplicate is now shown only when:

```text
confidence >= 0.65
```

This reduces noisy matches.

## Label Mapping Improvements

Tenant-facing labels no longer expose raw technical identifiers such as:

- `maintenance_incident`
- `urgent_incident`
- `watch`

Instead, the UI shows friendly labels such as:

- `Incidencia de mantenimiento`
- `Incidencia urgente`
- `En observación`
- `Revisión recomendada`

## How To Run

```bash
npm run test
npm run build
```

## Known Limitations

- duplicate detection still relies on heuristic text overlap rather than semantic similarity
- labels are currently applied in the frontend; backend payload values remain technical for internal consistency
- there is still no end-to-end browser automation for the chat cards

## Next Sprint Recommendation

Suggested next step for Portal AI 1.4:

- add integration tests around `/api/portal/chat`
- test fallback-path enrichment explicitly
- add a reviewed “update existing incident vs create new incident” decision flow
- improve duplicate reasoning with richer structured incident metadata
