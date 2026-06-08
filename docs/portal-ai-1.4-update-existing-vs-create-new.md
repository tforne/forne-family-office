# Portal AI 1.4 - Update Existing Incident vs Create New

## Summary

Sprint 1.4 turns duplicate incident detection into a tenant-facing operational decision flow.

When the portal AI detects that a new chat message is likely describing an already open incident, the assistant now offers three explicit actions:

- `Ver incidencia existente`
- `Añadir comentario`
- `Crear nueva incidencia igualmente`

The tenant keeps full control at every step. No comment is posted and no new incident is created without user confirmation.

## Files Changed

Created:

- `src/app/api/incidents/[id]/comments/route.ts`
- `src/lib/portal/incident-comment-draft.service.ts`
- `src/lib/portal/__tests__/incident-comments.service.test.ts`
- `docs/portal-ai-1.4-update-existing-vs-create-new.md`

Modified:

- `src/app/api/portal/chat/route.ts`
- `src/components/portal/PortalChatLauncher.tsx`
- `src/lib/portal/incident-comments.service.ts`
- `src/lib/portal/operational-routing.service.ts`
- `src/lib/portal/__tests__/operational-routing.service.test.ts`

## Architecture

The existing architecture remains intact:

```text
PortalChatLauncher.tsx
  -> /api/portal/chat
  -> intent + duplicate detection + operational routing
  -> AI reply or deterministic fallback
```

For comment submission, the new write path is:

```text
PortalChatLauncher.tsx
  -> /api/incidents/[id]/comments
  -> incident-comments.service.ts
  -> Business Central custom API endpoint
```

## Duplicate Decision Flow

When a likely duplicate open incident is detected:

1. The chat response still includes the normal duplicate summary block.
2. Duplicate-specific actions are added to the reply payload:
   - `view_incident`
   - `append_comment`
   - `create_anyway`
3. The standard `create_incident` action is suppressed for duplicate cases to reduce accidental duplicate creation.

## Add Comment Flow

The add-comment path is intentionally lightweight:

1. User clicks `Añadir comentario`.
2. An inline review box opens inside the existing assistant message.
3. The current user message is prefilled as the suggested comment.
4. The tenant can edit or cancel.
5. The comment is only sent after clicking `Enviar comentario`.

Server-side protections:

- authenticated portal session required
- incident must be visible to the current tenant scope
- empty comments rejected
- HTML/script tags stripped
- comments are normalized and capped to 1000 characters
- user-facing errors returned instead of raw Business Central failures

## Create Anyway Flow

If the tenant decides the issue is new after all:

1. User clicks `Crear nueva incidencia igualmente`.
2. The existing chat-to-incident review handoff from Sprint 1.2b is reused.
3. The draft is stored in session storage.
4. The tenant lands on `/portal/incidents?draft=chat`.
5. The incident is still only created after manual form submission.

## Response Payload

Duplicate cases now include action payloads like:

```json
[
  {
    "type": "view_incident",
    "label": "Ver incidencia existente",
    "payload": {
      "incidentId": "INC-001",
      "href": "/portal/incidents/1"
    }
  },
  {
    "type": "append_comment",
    "label": "Añadir comentario",
    "payload": {
      "incidentId": "INC-001",
      "href": "/portal/incidents/1",
      "suggestedComment": "Tengo humedad en el baño otra vez"
    }
  },
  {
    "type": "create_anyway",
    "label": "Crear nueva incidencia igualmente"
  }
]
```

## Tests

Automated coverage added or updated for:

- duplicate routing actions include `view_incident`, `append_comment`, and `create_anyway`
- non-duplicate routing does not add duplicate-only actions
- empty comment preparation is rejected
- HTML/script content is sanitized
- oversized comments are trimmed to the portal limit

Run:

```bash
npm run test
npm run build
```

## Manual QA

### Duplicate flow

Message:

```text
Tengo humedad en el baño otra vez
```

Expected:

- duplicate warning shown
- actions for view existing, add comment, and create anyway

### View existing

Click `Ver incidencia existente`.

Expected:

- navigates to the existing incident detail page

### Add comment

Click `Añadir comentario`.

Expected:

- inline comment editor opens
- suggested comment is prefilled from the user message
- user can edit or cancel
- submitting creates a comment only after confirmation

### Create anyway

Click `Crear nueva incidencia igualmente`.

Expected:

- existing draft review flow opens
- draft is prefilled
- no automatic creation happens

### Non-duplicate

Message:

```text
Tengo un problema nuevo con una ventana rota
```

Expected:

- no duplicate-only actions
- normal create-incident guidance continues

## Known Limitations

- The comment write payload assumes the existing Business Central incident comments endpoint accepts `incidentNo`, `incidentId`, and `commentText`.
- The chat currently supports one inline comment draft at a time.
- Duplicate resolution is driven by the top-ranked match, not a multi-incident chooser.

## Next Sprint Recommendation

Good next steps after 1.4:

- add route-level tests for `/api/incidents/[id]/comments`
- show recent incident comments immediately after successful submission
- support explicit "this is a different issue" reasoning in duplicate decision copy
