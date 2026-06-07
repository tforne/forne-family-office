# Portal AI Chat Integration

## Summary

Sprint Portal AI 1 is implemented with an AI-first backend flow that preserves the existing chat UI and response contract.

The browser still calls:

```text
/api/portal/chat
```

The route now:

1. validates the portal session
2. parses page, history, and page context
3. reuses or generates a server-side chat `sessionId`
4. calls `src/lib/portal/ai-layer.service.ts`
5. falls back to `src/lib/portal/chat-assistant.ts` if the AI request fails, times out, or returns an unusable response

No Business Central credentials or AI secrets are exposed to the frontend.

## Files Changed

- `src/lib/portal/ai-layer.service.ts`
- `src/app/api/portal/chat/route.ts`
- `src/lib/bc/client.ts`
- `docs/portal-ai-chat-integration.md`

## Implementation Notes

### AI service

`src/lib/portal/ai-layer.service.ts` adds a server-only AI integration layer that:

- resolves the current portal user via existing tenant context logic
- calls Business Central custom API `api/onedata/ai/v1.0/.../aiChatRequests`
- sends:
  - `portalUserId`
  - `sessionId`
  - `agentCode`
  - `question`
  - `source`
- uses `OD-GOVERNANCE` as the default agent
- enriches the `question` with:
  - current page
  - page title/summary
  - visible facts
  - visible sections
  - visible updates
  - recent chat history

### Route behavior

`src/app/api/portal/chat/route.ts` now:

- keeps the existing request and response shape used by `PortalChatLauncher.tsx`
- stores the chat `sessionId` in an `httpOnly` cookie: `ffo_portal_chat_session`
- tries AI first
- falls back to `buildPortalChatReply()` if AI fails

### BC client extension

`src/lib/bc/client.ts` now includes `bcPostCustomApiForCompany()` so AI calls follow the same authenticated BC server-side pattern as the rest of the portal.

## How To Test Locally

### 1. Fallback mode

This is the safest first check.

Use:

```env
USE_MOCK_API=true
USE_DEMO_LOGIN=true
CHAT_AVAILABLE=true
```

Expected result:

- The chat still works in the existing UI.
- `/api/portal/chat` attempts AI, then falls back automatically.
- Responses still come from the deterministic assistant.

What to verify:

- open `/portal`
- open the chat
- ask questions such as:
  - `Resume mi situacion actual`
  - `Tengo facturas pendientes`
  - `Quiero abrir una incidencia`
- confirm the UI behaves exactly as before

### 2. Real AI integration mode

Use real portal and BC settings:

```env
USE_MOCK_API=false
USE_DEMO_LOGIN=false
CHAT_AVAILABLE=true
ENTRA_TENANT_ID=...
ENTRA_CLIENT_ID=...
ENTRA_CLIENT_SECRET=...
BC_BASE_URL=https://api.businesscentral.dynamics.com/v2.0
BC_TENANT_ID=...
BC_ENVIRONMENT=Production
BC_COMPANY_ID=... or BC_COMPANY_NAME=...
BC_SCOPE=https://api.businesscentral.dynamics.com/.default
```

Assumption:

- Business Central publishes `api/onedata/ai/v1.0/companies({companyId})/aiChatRequests`

Expected result:

- the same portal chat UI remains unchanged
- the backend sends the AI request through Business Central
- AI response is mapped back to the existing `ChatReply` shape

What to verify:

- sign in through Entra
- open a private portal page such as `/portal`, `/portal/invoices`, or `/portal/incidents`
- send a question
- confirm the response returns successfully
- confirm the suggestions row still renders
- confirm links still render

### 3. AI failure path

To verify resilience:

- temporarily break BC AI availability or use a configuration where AI endpoint is missing
- keep the portal otherwise functional

Expected result:

- `/api/portal/chat` logs a warning server-side
- the user still receives a valid response from the deterministic assistant
- no UI breakage occurs

## Verification Performed

TypeScript verification completed successfully with:

```text
npx tsc --noEmit
```

## Important Non-Goals Preserved

The following were not implemented in this sprint:

- incident creation assistant
- dashboard widgets
- suggested actions UI
- streaming
- websockets
- agent selector
- visual redesign

Existing chat behavior was not deleted. The deterministic assistant remains as the active fallback path.
