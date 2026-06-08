# Portal AI 1.8 - Existing Incident Attachment Flow

## Goal

Enable tenants to upload supporting files to an existing incident from the incident detail page without redesigning the UI and without performing any upload unless the user explicitly confirms it.

## Architecture

```text
IncidentDetailPage
  -> IncidentDetailActions
    -> POST /api/incidents/[id]/attachments
      -> validateExistingIncidentAttachment()
      -> getIncidentById()
      -> uploadIncidentAttachment()
      -> buildPostOperationIntelligence(kind="attachment_added")
```

## Safety Model

- No automatic upload is triggered by AI or by page load.
- The tenant must manually choose a file and confirm the upload.
- The route validates the portal session and only works for tenant-visible incidents.
- Server-side validation restricts uploads to:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `application/pdf`
- Maximum size: `10 MB`
- Optional free-text context is treated as a manual comment only after the attachment succeeds.

## Attachment Routing

The upload service follows a deterministic safe path:

1. If the incident exposes `requestId`, reuse the existing request attachment sync flow.
2. Otherwise, use `BC_INCIDENT_ATTACHMENTS_ENDPOINT` only if it has been explicitly configured.
3. If neither safe path exists, return a user-facing message and do not upload anything.

## API Contract

### Request

`multipart/form-data`

Fields:

- `file`: required
- `comment`: optional

### Response

```json
{
  "ok": true,
  "attachment": {
    "id": "evidence.jpg",
    "filename": "evidence.jpg"
  },
  "warning": "optional warning",
  "postOperation": {
    "kind": "attachment_added",
    "title": "Archivo añadido correctamente",
    "summary": "...",
    "recommendedNextStep": "...",
    "checklist": ["..."],
    "actions": [
      { "type": "view_incident", "label": "Ver incidencia" },
      { "type": "add_another_attachment", "label": "Añadir otro archivo" },
      { "type": "append_comment", "label": "Añadir comentario" }
    ],
    "links": [
      { "href": "/portal/incidents/...", "label": "Ver incidencia actualizada" }
    ]
  }
}
```

## UI Behavior

- The existing `Adjuntar foto` action on the incident detail page now opens a compact inline upload form.
- The form keeps the current visual language of the incident detail card.
- After success, the page shows a deterministic post-operation block with next-step actions.
- No frontend redesign was introduced.

## Testing

Run:

```bash
npm run test
npm run build
```

Manual verification:

1. Open an existing incident from `/portal/incidents/[id]`.
2. Click `Adjuntar foto`.
3. Select a JPG, PNG, WEBP or PDF under 10 MB.
4. Optionally add a comment.
5. Click `Subir archivo`.
6. Confirm the success state and post-operation guidance.
7. Try an invalid file type and confirm the route rejects it safely.
8. Try an incident without a safe attachment path and confirm the portal shows the safe limitation message instead of uploading.

## Known Limitations

- Existing incident uploads depend on either `requestId` or an explicit `BC_INCIDENT_ATTACHMENTS_ENDPOINT`.
- The portal currently renders image attachments already exposed in incident data, but it does not yet provide a general downloadable attachment list for all file types.
- If the optional follow-up comment fails after the file upload succeeds, the portal returns a warning instead of rolling back the attachment.

## Next Recommendation

Sprint 1.9 can focus on richer attachment visibility in the incident detail page:

- generic attachment list
- upload history/timeline entries
- explicit attachment metadata
- route-level tests for the upload endpoint
