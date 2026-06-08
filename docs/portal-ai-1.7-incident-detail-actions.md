# Portal AI 1.7 - Incident Detail Actions

## Summary

Sprint 1.7 turns the incident detail page actions into usable, confirmation-based flows.

The detail page already showed recommended actions from the intelligence layer. Those actions now behave as real page interactions:

- `Añadir comentario`
- `Añadir foto`
- `Contactar soporte`
- `Ver incidencias relacionadas`

The user still confirms everything before anything is submitted.

## Files Changed

Created:

- `src/components/portal/IncidentDetailActions.tsx`
- `docs/portal-ai-1.7-incident-detail-actions.md`

Modified:

- `src/app/portal/incidents/[id]/page.tsx`
- `src/components/portal/IncidentDetailActions.tsx`
- `src/lib/portal/incident-detail-intelligence.service.ts`
- `src/lib/portal/__tests__/incident-detail-intelligence.service.test.ts`

## Action Model

The detail intelligence service now exposes:

- manual actions for the current incident
- tenant-safe related incident links when they exist

The detail page renders those actions through a dedicated client component so inline confirmation flows can happen without redesigning the page.

## Comment Flow

`Añadir comentario` now opens an inline form directly inside the incident action area.

Behavior:

1. User clicks `Añadir comentario`
2. Inline textarea opens
3. User types or edits the comment
4. User confirms with `Enviar comentario`
5. Existing route `/api/incidents/[id]/comments` handles validation and write
6. User sees success or friendly error state

No comment is submitted automatically.

## Photo Flow

The repo already supports attachments during new incident creation, but not a clean tenant-safe upload to an existing incident.

Because of that, Sprint 1.7 keeps `Añadir foto` safe:

- the action shows clear guidance
- the page scrolls to the existing contact/support area
- the limitation is explicit to the user

No risky new attachment write path was introduced.

## Support Flow

`Contactar soporte` now scrolls the user to the existing incident contact form already present on the page.

That preserves the existing portal support/contact route and still requires user confirmation before sending.

## Related Incidents

When the detail intelligence service detects tenant-visible related incidents, the action component now renders them as direct links.

Only incidents already visible within the tenant scope are shown.

## Security Notes

- Comments still go through the existing authenticated incident comment route.
- Tenant scope validation remains server-side.
- No new automatic write behavior was added.
- No new existing-incident attachment API was introduced.
- Related incidents are only drawn from tenant-visible incident data already loaded by the page.

## Testing Instructions

Run:

```bash
npm run test
npm run build
```

Service-level coverage now also checks that repeated-issue intelligence exposes related incident links safely.

## Manual QA

### Add comment

1. Open an incident detail page
2. Click `Añadir comentario`
3. Confirm the inline form opens
4. Submit a valid comment
5. Confirm success feedback is shown

### Empty comment

1. Open the same inline form
2. Try submitting without content

Expected:

- submit stays blocked client-side or the route rejects safely

### Add photo

1. Click `Añadir foto`

Expected:

- clear guidance appears
- page leads the user to the existing contact area
- no automatic upload occurs

### Contact support

1. Click `Contactar soporte`

Expected:

- page scrolls to the existing support/contact form

### Related incidents

1. Open an incident with related history

Expected:

- safe related links are visible
- links point only to tenant-visible incidents

## Known Limitations

- Existing-incident attachment upload is still not implemented because the current safe upload path is limited to incident creation.
- After adding a comment, the page shows success feedback immediately but does not force-refresh the server-rendered comments list in the same interaction.

## Next Sprint Recommendation

- Add a dedicated existing-incident attachment flow if Business Central supports a safe write path for tenant uploads.
- Consider optimistic comment refresh on the detail page after successful submission.
