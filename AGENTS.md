# AGENTS.md — Sprint Portal AI 1.2b
# Incident Draft Review + Create Incident Flow

You are Codex working locally on the OneData Tenant Portal repository.

Implement **Sprint Portal AI 1.2b — Incident Draft Review + Create Incident Flow**.

Sprint Portal AI 1.2a already added:

- deterministic intent detection
- urgency detection
- incident draft generation
- suggested operational actions
- chat action buttons
- fallback-safe operational enrichment

The next goal is to make the `Crear incidencia` action useful by opening a review flow with the incident draft pre-filled.

The user must always review and confirm before any incident is created.

---

# Business Goal

Transform the assistant from:

```text
AI prepares an incident draft
```

into:

```text
AI prepares draft
↓
user reviews
↓
user confirms
↓
portal creates incident through existing incident creation flow
```

---

# Strict Scope

Implement:

1. Incident draft review flow
2. Pre-filled incident creation UI
3. Connect `create_incident` action to review flow
4. Use existing incident creation endpoint/service
5. Preserve user confirmation
6. Documentation

Do NOT implement:

- automatic incident creation without confirmation
- new Business Central write endpoints if existing ones already work
- streaming
- WebSockets
- agent selector
- frontend redesign
- property manager workflow
- dashboard widgets

---

# Existing Assets To Reuse

Look for and reuse existing incident creation assets:

```text
src/components/portal/NewIncidentForm.tsx
src/components/portal/IncidentContactForm.tsx
src/app/api/incidents/contact/route.ts
src/lib/portal/incident-create.service.ts
src/lib/portal/incident-attachment-sync.service.ts
```

Do not duplicate incident creation logic if existing flow can be reused.

---

# Existing Chat Assets

Likely files:

```text
src/components/portal/PortalChatLauncher.tsx
src/lib/portal/incident-draft.service.ts
src/lib/portal/intent-detector.service.ts
src/app/api/portal/chat/route.ts
```

---

# Target UX

When the assistant returns an incident draft and an action:

```text
Crear incidencia
```

the user clicks it.

Then the portal should show a review panel/modal/card:

```text
Incidencia propuesta

Título:
Humedad y mal olor en baño

Tipo:
Mantenimiento

Prioridad:
Media

Descripción:
El inquilino informa de humedad persistente y mal olor en el baño.

[Editar]
[Cancelar]
[Crear incidencia]
```

The user can review and edit before submitting.

---

# Required Behavior

## 1. Clicking `Crear incidencia`

When the user clicks the action button:

```json
{
  "type": "create_incident"
}
```

the chat should open a draft review UI.

Do not immediately submit to Business Central.

---

## 2. Review UI

Create a lightweight review component if needed.

Suggested file:

```text
src/components/portal/IncidentDraftReview.tsx
```

or implement inside `PortalChatLauncher.tsx` if that fits current style better.

The review UI should allow editing at least:

- title
- description
- priority
- category/type if supported
- optional notes

If existing `NewIncidentForm` supports initial values, prefer using it.

If it does not, add a safe `initialDraft`/`initialValues` prop.

---

## 3. Pre-fill Existing Form

If reusing `NewIncidentForm.tsx`, add props like:

```ts
type IncidentDraftInitialValues = {
  title?: string;
  description?: string;
  priority?: string;
  category?: string;
  urgency?: string;
};
```

Example:

```tsx
<NewIncidentForm initialValues={incidentDraft} />
```

Adapt to the actual component API.

---

## 4. Submit Existing Flow

The final submit must use the existing incident creation flow.

Likely endpoint:

```text
src/app/api/incidents/contact/route.ts
```

or existing form submit logic.

Do not create a new BC write path unless necessary.

---

# Data Mapping

Map draft fields carefully.

## Incident Draft

```ts
{
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  urgency: "low" | "medium" | "high" | "critical";
  description: string;
  suggestedNextStep?: string;
}
```

## Form Mapping

Map to the existing fields used by `NewIncidentForm`.

Possible mapping:

```text
draft.title -> incident subject/title
draft.description -> description/details
draft.priority -> priority if supported
draft.category -> problem/category/type if supported
draft.urgency -> hidden/supporting field or note if no direct field exists
draft.suggestedNextStep -> internal note or appended to description if appropriate
```

Do not invent required Business Central field names.
Inspect existing form/service field names first.

---

# Confirmation Requirement

Critical:

The incident must only be created after explicit user action:

```text
Crear incidencia
```

in the review form.

Never create the incident immediately after AI response.

---

# Attachments

If the existing incident form supports attachments, keep that support.

If not already available in the review flow, suggest to the user:

```text
Puedes adjuntar una foto para ayudar al equipo técnico.
```

Do not implement complex attachment changes unless the existing form already supports them cleanly.

---

# Response Contract

Do not break the existing chat response contract.

The chat can include:

```ts
incidentDraft
actions
```

from Sprint 1.2a.

Extend frontend behavior only to react to these fields.

---

# Visual Label Improvements

User-facing intent labels should not show technical values.

Map:

```text
maintenance_incident -> Incidencia de mantenimiento
urgent_incident -> Incidencia urgente
invoice_question -> Consulta de factura
contract_question -> Consulta de contrato
document_request -> Solicitud de documento
support_request -> Soporte
general_chat -> Consulta general
```

Map priorities:

```text
Low -> Baja
Medium -> Media
High -> Alta
Critical -> Crítica
```

---

# Error Handling

If incident creation fails:

- show a clear user-friendly error
- preserve draft values
- allow retry
- do not lose the conversation

Do not expose raw Business Central errors to the tenant.

Server-side logs may include technical error details.

---

# Security

Do not trust frontend tenant/customer/company identifiers.

Use existing server-side authenticated context and existing incident creation logic.

Do not allow the AI draft to override protected fields like:

- company id
- customer no
- contract no
- property ownership scope
- tenant identity

The draft is only content assistance.

---

# Testing Requirements

## Test 1 — Maintenance Draft Review

Chat message:

```text
Tengo humedad en el baño
```

Expected:

- intent = maintenance_incident
- incident draft visible
- action `Crear incidencia`
- clicking action opens review UI
- draft fields pre-filled
- user can edit
- no incident created until confirmation

## Test 2 — Urgent Draft Review

Chat message:

```text
Se está filtrando agua al vecino de abajo
```

Expected:

- intent = urgent_incident
- priority = High or Critical depending rules
- review UI opens
- urgency visible or reflected in description
- confirmation required

## Test 3 — Non-Incident

Chat message:

```text
No entiendo esta factura
```

Expected:

- no incident draft review
- no create incident action

## Test 4 — Submission

Create an incident from the review UI.

Expected:

- existing incident creation endpoint is used
- success message shown
- created incident appears in existing incident list if applicable

## Test 5 — Failure

Force the incident creation endpoint to fail.

Expected:

- draft remains visible
- user-friendly error
- retry possible

---

# Documentation Required

Create:

```text
docs/portal-ai-1.2b-incident-draft-review-create-flow.md
```

Include:

- summary
- files changed
- architecture
- user flow
- data mapping
- security notes
- testing instructions
- known limitations
- next recommended sprint

---

# Final Output From Codex

When finished, provide:

1. Files created
2. Files modified
3. Summary of implementation
4. How to test locally
5. Any assumptions made
6. Any TODOs left

---

# Final Goal

The target experience is:

```text
User reports issue
↓
AI detects incident
↓
AI prepares draft
↓
User reviews and edits
↓
User confirms
↓
Existing portal creates incident
```

This sprint must convert the AI assistant from conversational support into a controlled operational assistant.
