# AGENTS.md — Sprint Portal AI 1.9
# Attachment Visibility + Incident Timeline

You are Codex working locally on the OneData Tenant Portal repository.

Implement **Sprint Portal AI 1.9 — Attachment Visibility + Incident Timeline**.

The portal already supports:

- AI chat
- incident drafting
- incident creation with review
- duplicate detection
- add comment to existing incident
- post-operation intelligence
- incident detail intelligence
- incident detail actions
- safe attachment upload to existing incidents

The next goal is to improve visibility after incidents are created, commented, or updated with attachments.

---

# Business Goal

The incident detail page should become a clear operational timeline.

A tenant should see:

```text
09:12 - Incidencia creada
09:14 - Foto adjuntada
09:15 - Comentario añadido
10:03 - Estado actualizado
```

This makes the portal feel transparent, professional and operationally reliable.

---

# Strict Scope

Implement:

1. Attachment visibility on incident detail page
2. Unified incident timeline
3. Timeline entries for comments
4. Timeline entries for attachments
5. Timeline entries for creation/status where available
6. Deterministic timeline intelligence
7. Tests where practical
8. Documentation

Do NOT implement:

- new autonomous AI actions
- provider workflows
- automatic status changes
- frontend redesign
- streaming/WebSockets
- new authentication system
- new Business Central extensions unless absolutely necessary

---

# Existing Assets To Inspect

Search and reuse:

```text
src/app/portal/incidents/[id]/page.tsx
src/components/portal/IncidentDetailActions.tsx
src/lib/portal/incident-detail-intelligence.service.ts
src/lib/portal/incident-attachments.service.ts
src/lib/portal/incident-attachment-sync.service.ts
src/lib/portal/incident-comments.service.ts
src/app/api/incidents/[id]/attachments/route.ts
src/app/api/incidents/[id]/comments/route.ts
```

Also search for:

```text
attachments
comments
timeline
history
activity
createdAt
updatedAt
status
```

---

# Target UX

Inside the incident detail page, show a section like:

```text
Actividad de la incidencia

Hoy 09:12
Incidencia creada

Hoy 09:14
Foto adjuntada: humedad_bano.jpg

Hoy 09:15
Comentario añadido:
"Sigo teniendo humedad y ahora huele mal."

Ayer 18:20
Estado actualizado: En seguimiento
```

Also show an attachment list:

```text
Archivos adjuntos

- humedad_bano.jpg
- factura_reparacion.pdf
```

If download/view links are available, render them.

If not, show metadata only.

---

# 1. Incident Timeline Service

Create:

```text
src/lib/portal/incident-timeline.service.ts
```

## Suggested Types

```ts
export type IncidentTimelineEntryType =
  | "created"
  | "comment"
  | "attachment"
  | "status"
  | "updated"
  | "system";

export interface IncidentTimelineEntry {
  id: string;
  type: IncidentTimelineEntryType;
  title: string;
  description?: string;
  occurredAt?: string;
  actorLabel?: string;
  href?: string;
  metadata?: Record<string, unknown>;
}
```

## Required Function

```ts
export function buildIncidentTimeline(input: {
  incident: unknown;
  comments?: unknown[];
  attachments?: unknown[];
  statusHistory?: unknown[];
}): IncidentTimelineEntry[]
```

## Requirements

- only use visible real data
- do not hallucinate events
- sort by date ascending or descending depending existing UX, but be consistent
- handle missing dates safely
- deduplicate obvious duplicated entries
- sanitize user-generated text

---

# 2. Attachment Visibility Service

Create or extend:

```text
src/lib/portal/incident-attachments-view.service.ts
```

or use existing attachment service if present.

## Suggested Type

```ts
export interface IncidentAttachmentView {
  id: string;
  filename: string;
  contentType?: string;
  sizeLabel?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  href?: string;
}
```

## Required Function

```ts
export function buildIncidentAttachmentViews(
  attachments: unknown[]
): IncidentAttachmentView[]
```

If the current backend does not expose attachments for existing incidents, document limitation and render only the upload success state where available.

---

# 3. Page Integration

Modify:

```text
src/app/portal/incidents/[id]/page.tsx
```

or existing detail components.

Render:

- intelligence card
- actions
- attachments list
- timeline

Do not redesign the page.

Use existing card styles.

---

# 4. Timeline Intelligence

Extend:

```text
incident-detail-intelligence.service.ts
```

if useful.

The intelligence card may include:

```text
Última actividad:
Foto adjuntada hace 2 horas
```

or:

```text
Seguimiento:
3 eventos registrados en esta incidencia.
```

Keep it deterministic.

---

# 5. Attachment Links

If attachment href/download URL exists:

- render link/button
- label as `Ver archivo` or filename

If no URL exists:

- render filename and metadata
- do not invent a download URL

---

# 6. Security

Critical:

- only show tenant-visible attachments/comments
- do not expose internal-only notes
- do not expose files outside tenant scope
- sanitize comments and filenames
- do not render raw HTML from comments
- do not trust frontend data

---

# 7. Tests

Add tests where practical.

Suggested:

```text
src/lib/portal/__tests__/incident-timeline.service.test.ts
src/lib/portal/__tests__/incident-attachments-view.service.test.ts
```

Test:

1. created event appears when incident has creation date
2. comments become timeline entries
3. attachments become timeline entries
4. entries are sorted correctly
5. missing dates do not crash
6. filenames/comments are sanitized
7. duplicate entries are avoided where practical

---

# 8. Manual QA

## Test 1 — Created incident

Open a simple incident.

Expected:

- timeline visible
- created event visible if date exists

## Test 2 — Comment

Add comment.

Expected:

- comment visible in timeline after refresh or current flow update

## Test 3 — Attachment

Upload photo/PDF.

Expected:

- attachment appears in attachment list or timeline if backend exposes it

## Test 4 — Missing data

Open incident with no comments/attachments.

Expected:

- empty state shown clearly
- no crash

## Test 5 — Sanitization

Use a comment or filename containing HTML-like text.

Expected:

- displayed as safe text, not rendered HTML

---

# 9. Documentation

Create:

```text
docs/portal-ai-1.9-attachment-visibility-incident-timeline.md
```

Include:

- summary
- files changed
- architecture
- timeline model
- attachment visibility model
- security notes
- tests
- manual QA
- known limitations
- next sprint recommendation

---

# 10. Final Output From Codex

When finished, provide:

1. Files created
2. Files modified
3. Summary of implementation
4. How to test locally
5. Test results
6. Assumptions made
7. Remaining TODOs

---

# Final Goal

The incident detail page should show a clear operational history:

```text
created
comments
attachments
status updates
latest activity
```

This makes the incident lifecycle transparent and completes the tenant-facing operational view.
