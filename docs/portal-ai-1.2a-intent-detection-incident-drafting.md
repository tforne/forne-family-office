# Portal AI 1.2a

## Overview

Sprint Portal AI 1.2a adds a deterministic operational layer on top of the existing portal chat flow:

```text
PortalChatLauncher.tsx
  -> /api/portal/chat
  -> ai-layer.service.ts
  -> Business Central AI Layer
```

The portal now detects intent, estimates urgency, prepares incident drafts for operational maintenance cases, and returns suggested portal actions.

The implementation does not:

- create incidents automatically
- execute Business Central write operations
- bypass user confirmation
- redesign the portal chat UI

## Architecture

### Request flow

1. The frontend sends the user message to `/api/portal/chat`.
2. The route runs deterministic intent detection with `detectPortalIntent(message)`.
3. The route builds portal context as before.
4. The route builds an incident draft with `buildIncidentDraft(...)` when the detected intent is incident-related.
5. The route calls the AI layer.
6. If the AI layer fails, the route falls back to `buildPortalChatReply(...)`.
7. In both paths, the route enriches the final `reply` payload with:
   - `intent`
   - `incidentDraft`
   - `actions`

### New services

- `src/lib/portal/intent-detector.service.ts`
- `src/lib/portal/incident-draft.service.ts`

## Intent Detection Rules

The detector is deterministic and rule-based. It does not make a second AI call.

### Supported intents

- `maintenance_incident`
- `urgent_incident`
- `invoice_question`
- `contract_question`
- `document_request`
- `support_request`
- `general_chat`

### Main signal examples

- `humedad`, `filtracion`, `averia`, `mal olor` -> `maintenance_incident`
- `fuga agua`, `filtrando agua`, `vecino de abajo`, `electricidad`, `humo`, `gas` -> `urgent_incident`
- `factura`, `recibo`, `cobro`, `vencimiento` -> `invoice_question`
- `contrato`, `clausula`, `fianza`, `renovacion` -> `contract_question`
- `copia`, `documento`, `archivo`, `pdf` -> `document_request`
- `soporte`, `ayuda`, `contactar`, `no funciona` -> `support_request`

### Priority rule

Explicit document requests such as `Necesito una copia del contrato` are forced to `document_request` even if the message also contains `contrato`.

## Urgency Rules

Urgency is also deterministic.

### Signals

- `humo`, `incendio`, `gas`, `electricidad`, `cortocircuito` -> `critical`
- `fuga de agua`, `filtrando agua`, `vecino de abajo`, `vecino afectado`, `urgente` -> `high`
- `humedad`, `moho`, `filtracion`, `gotea`, `mal olor` -> `medium`
- invoice, contract, and document queries default to `low`

### Output example

```json
{
  "intent": "urgent_incident",
  "confidence": 0.96,
  "urgency": "high",
  "matchedSignals": ["filtrando agua", "vecino de abajo", "fuga agua", "vecino afectado"]
}
```

## Incident Draft Generation

Drafts are only returned for:

- `maintenance_incident`
- `urgent_incident`

Non-incident intents return `null`.

### Draft shape

```ts
interface IncidentDraft {
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  urgency: "low" | "medium" | "high" | "critical";
  description: string;
  suggestedNextStep?: string;
}
```

### Example

Input:

```text
Tengo humedad en el baño y ahora también huele mal
```

Output:

```json
{
  "title": "Humedad y mal olor en baño",
  "category": "Maintenance",
  "priority": "Medium",
  "urgency": "medium",
  "description": "El inquilino informa de humedad persistente y mal olor en el baño. Posible filtración o problema de ventilación.",
  "suggestedNextStep": "Revisar posible filtración y solicitar fotografías."
}
```

## Response Payload

The existing response contract is preserved and safely extended.

```json
{
  "reply": {
    "answer": "...",
    "links": [],
    "suggestions": [],
    "canEscalate": false,
    "intent": {
      "type": "maintenance_incident",
      "confidence": 0.92,
      "urgency": "medium",
      "matchedSignals": ["humedad", "baño"]
    },
    "incidentDraft": {
      "title": "Humedad en baño",
      "category": "Maintenance",
      "priority": "Medium",
      "urgency": "medium",
      "description": "...",
      "suggestedNextStep": "..."
    },
    "actions": [
      {
        "type": "create_incident",
        "label": "Crear incidencia",
        "payload": {
          "intent": "maintenance_incident",
          "urgency": "medium",
          "confidence": 0.92,
          "requiresConfirmation": true
        }
      }
    ]
  }
}
```

## Operational Actions

Actions are deterministic and non-destructive.

### Incident intents

- `create_incident`
- `attach_photo`

### Invoice questions

- `view_invoice`

### Support requests

- `contact_support`

### Document requests

- `view_documents`

### Contract questions

- `view_contract`

The frontend renders the actions as lightweight buttons. They may navigate the user or provide chat guidance, but they do not create incidents automatically.

## Frontend Behavior

`PortalChatLauncher.tsx` was updated minimally to render:

- incident draft preview inside assistant messages
- intent metadata chips
- suggested action buttons

No redesign was introduced.

## Fallback Behavior

Fallback remains intact.

If the Business Central AI layer fails:

1. `buildPortalChatReply(...)` still returns the chat answer.
2. deterministic intent detection still runs
3. deterministic urgency detection still runs
4. incident draft generation still runs
5. action generation still runs

This means operational enrichment is available even when the AI response falls back.

## Local Testing

### Run the app

```bash
npm run build
npm run dev
```

### Manual chat tests

Open any portal page with the chat launcher and test these messages:

1. `Tengo humedad en el baño`
   - expected intent: `maintenance_incident`
   - expected urgency: `medium`
   - expected incident draft: yes
   - expected actions: `Crear incidencia`, `Adjuntar foto`

2. `Se está filtrando agua al vecino de abajo`
   - expected intent: `urgent_incident`
   - expected urgency: `high`
   - expected incident draft: yes
   - expected priority: `High`

3. `No entiendo esta factura`
   - expected intent: `invoice_question`
   - expected incident draft: no
   - expected actions: `Ver factura`

4. `Necesito una copia del contrato`
   - expected intent: `document_request`
   - expected incident draft: no

### Fallback simulation

Trigger an AI failure condition in the existing environment, for example by making the BC AI layer unavailable or forcing the request into the existing fallback path.

Expected behavior:

- the endpoint still returns `reply.answer`
- `reply.intent` is still present
- `reply.actions` are still present
- `reply.incidentDraft` is still present for incident messages

## Known Limitations

- intent detection is keyword-based and may miss nuanced phrasing
- category output is currently fixed to `Maintenance` for incident drafts
- action buttons do not yet submit a formal incident creation workflow
- the frontend currently shows technical intent labels such as `maintenance_incident`
- there is no dedicated automated test suite for these rules yet

## Next Sprint Recommendation

Suggested next step for Portal AI 1.2b:

- add automated tests for intent and draft rules
- map draft categories to a richer incident taxonomy
- connect action buttons to a dedicated draft review flow
- add hybrid AI plus rules classification for higher recall
- prepare a validated user-confirmation flow before any write operation is enabled
