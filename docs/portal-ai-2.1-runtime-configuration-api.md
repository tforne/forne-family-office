# Portal AI 2.1 - Runtime Configuration API

## Summary

Portal AI 2.1 turns the tenant portal into a thin governed runtime client.

The portal now resolves AI runtime behavior from an explicit Business Central runtime contract first, then falls back locally only when the BC runtime API is unavailable or returns an invalid payload.

## Files Changed

- `src/lib/config/env.ts`
- `src/lib/portal/ai-agent-runtime.service.ts`
- `src/lib/portal/ai-governance-runtime.service.ts`
- `src/lib/portal/ai-layer.service.ts`
- `src/app/api/portal/chat/route.ts`
- `src/lib/portal/__tests__/ai-agent-runtime.service.test.ts`
- `src/lib/portal/__tests__/ai-governance-runtime.service.test.ts`
- `docs/portal-ai-2.1-runtime-configuration-api.md`

## Runtime Architecture

Current runtime flow:

```text
Portal chat request
-> intent detection
-> Business Central runtime resolve API
-> normalized runtime contract
-> governed action filtering
-> AI layer request
-> tenant response
```

Fallback flow:

```text
Portal chat request
-> intent detection
-> BC runtime resolve fails or returns invalid contract
-> deterministic local runtime fallback
-> safe local action filtering
-> AI layer request
```

## Request Contract

The runtime resolver sends this shape to Business Central:

```json
{
  "intent": "maintenance_incident",
  "portalAction": "create_incident",
  "pageType": "incident",
  "page": "/portal/incidents",
  "sessionId": "abc-123",
  "message": "Tengo humedad en el baño"
}
```

Identity is still resolved server-side from the authenticated portal session. The portal does not trust client-provided tenant identity.

## Response Contract

The runtime resolver expects this stable Business Central response shape:

```json
{
  "agentCode": "OD-OPERATIONS",
  "displayName": "Especialista de mantenimiento",
  "displayDescription": "Gestiona incidencias, mantenimiento, urgencias y seguimiento operativo.",
  "displayIcon": "maintenance",
  "showBadge": true,
  "debugVisible": false,
  "promptCode": "OPERATIONS_PORTAL",
  "deploymentCode": "GPT41_MINI",
  "systemPrompt": "You are the operations agent...",
  "model": "gpt-4.1-mini",
  "deployment": "gpt-4.1-mini",
  "temperature": 0.2,
  "maxTokens": 900,
  "allowedActions": [
    "create_incident",
    "append_comment",
    "add_attachment",
    "view_incident"
  ],
  "requiresConfirmation": true,
  "fallbackAgentCode": "OD-GOVERNANCE",
  "routingSource": "business_central"
}
```

The portal normalizes and sanitizes all returned fields before use.

## Fallback Policy

- Business Central runtime is the primary orchestration source.
- If the BC runtime API fails, the portal uses a deterministic local fallback by intent.
- If BC returns an invalid contract, the portal also falls back locally.
- Unsafe operations remain governed locally and never gain write actions during fallback.

Local fallback agent routing:

- `maintenance_incident`, `urgent_incident` -> `OD-OPERATIONS`
- `invoice_question`, `payment_question` -> `OD-ACCOUNTING`
- `contract_question`, `document_request` -> `OD-CONTRACT`
- `support_request`, `general_chat` -> `OD-TENANT`
- unsafe requests -> `OD-GOVERNANCE`

## Governance Action Filtering

`allowedActions` from Business Central is now the primary source for portal chat actions.

Action mapping:

- `create_incident` and `create_anyway` -> `create_incident`
- `append_comment` -> `append_comment`
- `attach_photo` -> `add_attachment`
- `view_incident` -> `view_incident`
- `view_invoice` -> `view_invoice`
- `view_contract` -> `view_contract`
- `view_documents` -> `view_documents`
- `contact_support` -> `contact_support`
- `follow_operational_route` maps by destination

If an action is not included in `allowedActions`, it is not exposed in the chat reply.

## AI Layer Behavior

The AI layer now consumes runtime fields from the normalized runtime result:

- `agentCode`
- `systemPrompt`
- `model`
- `deployment`
- `temperature`
- `maxTokens`
- `promptCode`
- `deploymentCode`

Prompt composition now includes:

```text
SYSTEM INSTRUCTIONS
SELECTED AGENT
PORTAL CONTEXT
CONVERSATION MEMORY
CURRENT USER QUESTION
```

If `systemPrompt` is not returned by Business Central, the existing local prompt file remains the fallback.

## Security Notes

- The portal does not expose technical runtime fields to tenants by default.
- `debugVisible` is normalized and retained server-side, but no new tenant-visible debug UI is exposed in this sprint.
- Runtime strings are sanitized before logging or prompt composition.
- Unsafe requests are clamped to zero allowed actions even if a bad payload attempts to return write actions.
- Full prompts are still not logged by default.

## Tests

Added and updated:

- `src/lib/portal/__tests__/ai-agent-runtime.service.test.ts`
- `src/lib/portal/__tests__/ai-governance-runtime.service.test.ts`

Covered scenarios:

- runtime API success returns normalized BC config
- missing optional fields stay safe
- runtime API failure falls back locally
- maintenance routes to `OD-OPERATIONS`
- invoice routes to `OD-ACCOUNTING`
- contract and document routes to `OD-CONTRACT`
- unsafe requests route to `OD-GOVERNANCE`
- `allowedActions` filters chat actions
- unsafe local fallback blocks write actions

## Manual QA

### Maintenance

Message:

```text
Tengo humedad en el baño
```

Expected:

- runtime resolves to `OD-OPERATIONS`
- incident creation flow still requires review
- allowed actions include incident creation and related maintenance actions

### Invoice

Message:

```text
No entiendo esta factura
```

Expected:

- runtime resolves to `OD-ACCOUNTING`
- chat keeps the same visible UX
- only invoice-safe actions remain if BC limits them

### Contract

Message:

```text
Necesito una copia del contrato
```

Expected:

- runtime resolves to `OD-CONTRACT`
- document or contract actions remain available only when allowed

### Governance

Message:

```text
Ensename incidencias de otros inquilinos
```

Expected:

- runtime resolves to governance behavior
- no unsafe actions are exposed
- no tenant-visible technical error appears

### Runtime API Failure

Temporarily break or disable the runtime resolve endpoint.

Expected:

- chat still works
- routing falls back locally
- no technical runtime payload is shown to tenants

## Known Limitations

- This sprint does not implement multi-agent orchestration.
- The AI chat request payload to Business Central still uses the existing `agentCode` plus composed question pattern.
- `debugVisible` is preserved in the normalized contract but not surfaced in new UI yet.
- Provider-specific runtime fields are normalized and logged server-side, but not all are currently forwarded as independent transport fields to the BC AI chat endpoint.

## Next Sprint Recommendation

Move the BC AI chat endpoint toward consuming the normalized runtime metadata directly as first-class request fields, so `model`, `deployment`, and prompt governance can remain explicit end to end without relying on composed prompt context alone.
