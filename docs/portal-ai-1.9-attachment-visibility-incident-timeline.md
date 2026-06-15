# Portal AI 1.9 - Attachment Visibility + Incident Timeline

## Summary

Sprint 1.9 turns the incident detail page into a clearer operational history by adding:

- a normalized attachment visibility layer
- a unified timeline built from visible incident data
- deterministic timeline-aware intelligence

The page now shows creation, comments, visible attachments, and visible status/update events without redesigning the existing UI.

## Files Changed

Created in the sprint baseline:

- `src/lib/portal/incident-attachments-view.service.ts`
- `src/lib/portal/incident-timeline.service.ts`
- `src/lib/portal/__tests__/incident-attachments-view.service.test.ts`
- `src/lib/portal/__tests__/incident-timeline.service.test.ts`
- `docs/portal-ai-1.9-attachment-visibility-incident-timeline.md`

Adjusted in the current implementation pass:

- `src/app/portal/incidents/[id]/page.tsx`
- `src/lib/portal/incident-comments.service.ts`
- `src/lib/portal/incident-detail-intelligence.service.ts`
- `src/lib/portal/incident-attachments-view.service.ts`
- `src/lib/portal/incident-timeline.service.ts`
- `src/lib/portal/__tests__/incident-attachments-view.service.test.ts`
- `src/lib/portal/__tests__/incident-detail-intelligence.service.test.ts`
- `src/lib/portal/__tests__/incident-timeline.service.test.ts`

## Architecture

```text
Incident detail page
  -> extractIncidentAttachmentValues()
  -> buildIncidentAttachmentViews()
  -> buildIncidentTimeline()
  -> buildIncidentDetailIntelligence()
```

## Timeline Model

Supported event types:

- `created`
- `comment`
- `attachment`
- `status`
- `updated`
- `system`

Rules:

- only visible portal data is used
- non-public comments are discarded defensively
- dates are cleaned and invalid placeholder values are ignored
- duplicate events are collapsed
- user text is sanitized before display
- entries are sorted by newest visible event first

## Attachment Visibility Model

The attachment visibility service reads known incident fields such as:

- `attachments`
- `incidentAttachments`
- `files`
- `photos`
- `incidentImages`
- `imageUrls`
- `photoUrls`

When an attachment exposes a safe visible URL, the detail page renders `Ver archivo`.
When there is no URL, the page shows metadata only.

## Security Notes

- Only tenant-visible incident data already present in the portal is rendered.
- Comments, filenames, and timeline text are sanitized to avoid rendering HTML-like input.
- Non-public comments are filtered out in both the comment fetch layer and the deterministic intelligence/timeline builders.
- Unsafe attachment URLs such as non-http(s) custom schemes are dropped instead of rendered.
- No download URLs are invented when the backend does not expose them.
- No internal-only notes are inferred or synthesized.

## Tests

Run:

```bash
npm run test
npm run build
```

Covered areas:

- created event visibility
- comment timeline entries
- attachment timeline entries
- newest-first sorting
- missing date handling
- sanitization
- duplicate avoidance
- non-public comment filtering
- unsafe attachment URL suppression
- attachment-aware intelligence

## Manual QA

1. Open an incident with visible creation date and confirm the created event appears in the timeline.
2. Add a comment, refresh the page, and confirm the comment shows in the timeline.
3. Upload a photo or PDF, refresh if needed, and confirm the attachment appears in the attachment list and timeline when the backend exposes it.
4. Open an incident without comments or attachments and confirm the empty states render without breaking the page.
5. Verify that HTML-like comment or filename text is shown as plain safe text.

## Known Limitations

- Existing incident attachments are only shown when the incident payload already exposes visible attachment data.
- The page cannot invent downloadable file URLs when Business Central does not return them.
- Status history remains limited to visible incident dates and current status fields unless a richer backend history feed is exposed later.

## Next Recommendation

Sprint 2.0 can focus on richer operational visibility, for example:

- explicit attachment download metadata
- dedicated status-history records from Business Central
- route-level tests around detail-page refresh after upload/comment actions
