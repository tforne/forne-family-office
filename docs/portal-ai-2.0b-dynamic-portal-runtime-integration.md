# Portal AI 2.0b Dynamic Portal Runtime Integration

## Summary

Portal AI now keeps the same tenant-facing assistant experience while resolving the internal AI runtime dynamically before each AI request.

The portal still sends chat traffic through:

```text
/api/portal/chat
```

But the server-side AI path now resolves:

```text
intent
-> runtime operation
-> Business Central runtime configuration when available
-> safe local governed fallback
-> OneData AI Layer chat request
```

This preserves the existing deterministic fallback path and keeps Business Central as the preferred source of runtime governance.

## Files Changed

### Created

- `src/lib/portal/ai-agent-runtime.service.ts`
- `src/lib/portal/__tests__/ai-agent-runtime.service.test.ts`
- `docs/portal-ai-2.0b-dynamic-portal-runtime-integration.md`

### Modified

- `src/lib/portal/ai-layer.service.ts`
- `src/app/api/portal/chat/route.ts`

## Architecture

### Visible flow

The visible portal assistant does not change:

```text
Portal chat UI
-> /api/portal/chat
-> reply payload used by PortalChatLauncher
```

### Internal runtime flow

The AI branch now behaves like this:

```text
/api/portal/chat
-> intent detection
-> portal AI context build
-> resolvePortalAgentRuntime()
-> sendAIChatRequest()
-> OneData AI Layer / aiChatRequests
-> deterministic portal fallback if AI fails
```

## Runtime Resolution Model

`src/lib/portal/ai-agent-runtime.service.ts` adds a governed runtime resolver with two layers:

### 1. Business Central first

The resolver reads tenant portal configuration records from Business Central and looks for runtime-style fields when they are present, such as:

- `agentCode`
- `promptCode`
- `deploymentCode`
- `operation`
- `routeKey`
- `portalAction`
- default flags

If Business Central provides a matching runtime record, the portal uses that agent and logs the resolution metadata.

### 2. Safe local fallback

If Business Central runtime configuration is missing, unreadable, disabled, or does not contain a usable AI runtime record, the portal falls back locally with a deterministic mapping:

- `maintenance_incident`, `urgent_incident` -> `OD-OPERATIONS`
- `invoice_question`, `payment_question` -> `OD-ACCOUNTING`
- `contract_question`, `document_request` -> `OD-CONTRACT`
- `support_request`, `general_chat` -> `OD-TENANT`
- unsafe governance requests -> `OD-GOVERNANCE`

Unsafe examples include:

- delete-data style requests
- permission bypass requests
- cross-tenant data requests
- obviously unsafe access or credential requests

## Backward Compatibility

The following behaviors are intentionally preserved:

- the chat UI and `/api/portal/chat` response shape
- deterministic `buildPortalChatReply()` fallback
- existing intent detection and operational routing
- current AI endpoint contract using `agentCode`
- no new autonomous actions
- no visible agent selector

## Security Notes

- Runtime resolution happens server-side only.
- Business Central remains the preferred governance source.
- Unsafe or cross-tenant style prompts route to `OD-GOVERNANCE` locally even if no BC runtime config is available.
- The portal does not invent runtime config if BC does not expose a usable record.
- When AI is unavailable, the route still falls back to the existing deterministic assistant.

## Tests

Unit coverage was added for:

- operations fallback to the correct local governed agent
- payment-style invoice questions resolve to accounting
- unsafe requests resolve to governance
- Business Central runtime configuration overrides local fallback when it provides an explicit agent
- disabled BC runtime records are ignored safely
- BC default runtime records can be used when no exact route match exists

## How To Test Locally

### Safe fallback path

Use:

```env
USE_MOCK_API=true
CHAT_AVAILABLE=true
```

Expected:

- portal chat still works
- AI path is skipped
- deterministic assistant still answers normally

### Dynamic AI runtime path

Use real Business Central + AI settings and keep:

```env
USE_MOCK_API=false
CHAT_AVAILABLE=true
```

Expected:

- portal chat still behaves as one assistant
- server logs show dynamic runtime resolution
- AI requests use the resolved `agentCode`
- if BC runtime config is unavailable, local governed fallback is logged and used
- if AI itself fails, deterministic fallback still answers

## Known Limitations

- The checked-in Business Central portal configuration API does not yet guarantee dedicated AI runtime fields; the resolver reads them only when they are available.
- `promptCode` and `deploymentCode` are resolved for governance metadata and observability, but the current portal-to-BC chat payload remains backward compatible and still sends only the supported chat fields.
- There is not yet route-level test coverage around `/api/portal/chat` runtime logging or live BC runtime resolution.

## Recommended Next Step

Expose dedicated runtime-governance fields in the Business Central configuration API so the portal can consume explicit AI routing policy without relying on optional field discovery.
