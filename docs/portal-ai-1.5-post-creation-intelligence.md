# Portal AI 1.5 - Post-Creation Intelligence

## Summary

Sprint 1.5 adds deterministic post-creation intelligence after two confirmed write actions:

- creating a new incident
- adding a comment to an existing incident

The portal now returns review-first guidance immediately after those actions complete. The user sees what happened, what to review next, and which manual follow-up options are available. No follow-up operation is executed automatically.

## Files Changed

Created:

- `src/lib/portal/post-operation-intelligence.service.ts`
- `src/lib/portal/__tests__/post-operation-intelligence.service.test.ts`
- `docs/portal-ai-1.5-post-creation-intelligence.md`

Modified:

- `src/app/api/incidents/contact/route.ts`
- `src/app/api/incidents/[id]/comments/route.ts`
- `src/components/portal/NewIncidentForm.tsx`
- `src/components/portal/PortalChatLauncher.tsx`

## Architecture

The new shared builder is deterministic and reusable:

```text
confirmed operation
  -> route handler
  -> buildPostOperationIntelligence(...)
  -> response payload
  -> existing UI surface
```

Write flows remain unchanged:

- incident creation still uses `/api/incidents/contact`
- incident comments still use `/api/incidents/[id]/comments`

The only extension is a new `postOperation` payload returned on success.

## Post-Operation Payload

Successful create/comment responses can now include:

```json
{
  "ok": true,
  "incident": { "...": "..." },
  "postOperation": {
    "kind": "incident_created",
    "title": "Seguimiento recomendado",
    "summary": "...",
    "recommendedNextStep": "...",
    "checklist": ["..."],
    "actions": [
      {
        "type": "view_incident",
        "label": "Ver incidencia creada"
      }
    ],
    "links": [
      {
        "href": "/portal/incidents/...",
        "label": "Abrir incidencia creada"
      }
    ]
  }
}
```

## Incident Creation Flow

After a new incident is created:

- the form still shows the success confirmation
- an additional intelligence card explains what to review next
- the card includes deterministic follow-up guidance and links
- nothing is updated automatically after creation

Guidance adapts to:

- priority level
- whether attachments were included
- whether contract context is available

## Comment Follow-Up Flow

After a comment is confirmed in chat:

- the assistant posts a success message
- the message includes an operational summary block
- links and safe manual actions are attached
- the user may reopen the incident or choose to add more follow-up manually

The action remains confirmation-based because `append_comment` still opens an editable draft instead of posting immediately.

## Security Notes

- No new autonomous write operations were added.
- Follow-up suggestions are informational or manual-entry actions only.
- The create/comment routes still validate authentication and tenant scope before writing.

## Tests

Added deterministic coverage for:

- post-create intelligence payload shape
- post-comment intelligence payload shape
- manual-action suggestions after comment confirmation

Run:

```bash
npm run test
npm run build
```

## Manual QA

### New incident

1. Open `/portal/incidents`
2. Create a new incident normally
3. Confirm the existing success banner appears
4. Confirm a new intelligence card appears with:
   - summary
   - recommended next step
   - checklist
   - links back to the created incident

### Comment from chat

1. Use a duplicate-detection scenario in chat
2. Click `Añadir comentario`
3. Confirm and submit the comment
4. Verify the assistant success reply includes:
   - operational summary
   - link to the updated incident
   - optional manual follow-up action

## Known Limitations

- The checked-in `AGENTS.md` still describes Sprint 1.4, so this implementation follows the user request for 1.5 rather than a repo-local 1.5 brief.
- The incident creation form currently renders post-operation links, not generic action buttons.
- Post-operation guidance is deterministic and based on current portal-visible incident metadata only.

## Next Sprint Recommendation

- Add route-level tests for the `postOperation` payload in both success endpoints.
- Surface recent follow-up events directly on the incident detail page after user actions.
- Let chat consume post-operation context proactively when the user returns to ask about the same incident.
