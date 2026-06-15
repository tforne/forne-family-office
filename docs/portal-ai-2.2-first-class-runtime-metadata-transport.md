# Portal AI 2.2 - First-Class Runtime Metadata Transport

## Summary

Portal AI 2.2 transports resolved runtime metadata as explicit Business Central AI chat request fields instead of relying only on prompt composition.

The portal now:

- resolves runtime in the existing governed flow
- propagates runtime metadata into the AI layer request builder
- sends preferred first-class metadata fields when supported
- retries once with the legacy payload shape if the Business Central endpoint rejects the extra fields
- keeps the existing chat fallback behavior intact

## Files Changed

- `src/lib/portal/ai-layer.service.ts`
- `src/app/api/portal/chat/route.ts`
- `src/lib/portal/__tests__/ai-layer.service.test.ts`

## Architecture

```text
/api/portal/chat
-> resolvePortalAgentRuntime(...)
-> sendAIChatRequest(...)
-> buildPortalAIRuntimeMetadata(...)
-> buildPortalAIChatRequestPayload(...)
-> Business Central aiChatRequests
   - preferred payload with runtime metadata
   - legacy payload fallback on compatibility rejection
```

## Runtime Metadata Model

Structured metadata now includes, when available:

- `agentCode`
- `promptCode`
- `deploymentCode`
- `model`
- `deployment`
- `temperature`
- `maxTokens`
- `runtimeSource`
- `fallbackAgentCode`

`runtimeSource` is derived as:

- `business_central` for BC-resolved runtime
- `local_fallback` for governed local fallback runtime
- `governance_override` for unsafe/governance-routed execution

## Payload Strategy

Preferred payload:

```json
{
  "portalUserId": "tenant-1",
  "sessionId": "session-1",
  "agentCode": "OD-OPERATIONS",
  "question": "...",
  "source": "TenantPortal",
  "promptCode": "OPERATIONS_PORTAL",
  "deploymentCode": "GPT41_MINI",
  "model": "gpt-4.1-mini",
  "deployment": "gpt-4.1-mini",
  "temperature": 0.2,
  "maxTokens": 900,
  "runtimeSource": "business_central",
  "fallbackAgentCode": "OD-GOVERNANCE"
}
```

Compatible fallback payload:

```json
{
  "portalUserId": "tenant-1",
  "sessionId": "session-1",
  "agentCode": "OD-OPERATIONS",
  "question": "...",
  "source": "TenantPortal"
}
```

## Compatibility Notes

- The portal attempts the preferred payload first.
- If Business Central rejects the structured fields with a compatibility-style request error, the portal retries once with the legacy payload.
- Prompt composition is preserved so runtime metadata is no longer the only carrier, but existing behavior stays stable.

## Logging

Server-side logs now include:

- resolved runtime metadata in `/api/portal/chat`
- whether first-class metadata was attempted
- whether compatibility fallback was used

Full prompts are still not logged.

## Tests

`src/lib/portal/__tests__/ai-layer.service.test.ts` covers:

- runtime metadata mapping
- preferred payload construction
- structured transport success
- structured transport fallback to legacy payload
- safe metadata transport for local fallback runtime

## Manual QA

1. Send a maintenance message such as `Tengo humedad en el baño`.
2. Confirm logs show `agentCode`, `promptCode`, `deploymentCode`, and `runtimeSource`.
3. Verify chat still returns a normal answer.
4. If testing against an older BC endpoint, confirm the portal retries with the legacy payload and still returns a response.
5. Disable the runtime API or force local fallback and confirm `runtimeSource = local_fallback`.

## Known Limitations

- The portal can only confirm transport compatibility based on request rejection behavior from the current BC endpoint.
- This sprint does not guarantee BC consumes every metadata field internally; it only ensures the portal transports them when possible.

## Next Recommendation

Teach the BC AI endpoint to persist and expose the structured runtime metadata directly so transport no longer needs a compatibility retry for older payload contracts.
