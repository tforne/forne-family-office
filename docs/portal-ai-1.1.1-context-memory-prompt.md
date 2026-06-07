# Portal AI 1.1.1: Context, Memory, and Prompt Enrichment

## Summary of Changes

Sprint Portal AI 1.1.1 improves the existing tenant portal chat without changing the frontend UX.

The implementation adds:

- a server-side portal AI context builder
- compact conversation memory formatting and sanitization
- a real estate system prompt for OneData tenant assistance
- enriched AI payload composition before sending requests to the Business Central AI Layer
- preserved deterministic fallback behavior when AI is unavailable

The browser still calls `/api/portal/chat`, and all AI and Business Central access remains server-side.

## Files Changed

Created:

- `src/lib/portal/portal-ai-context-builder.ts`
- `src/lib/portal/conversation-memory.service.ts`
- `src/prompts/tenant-assistant.system.txt`
- `docs/portal-ai-1.1.1-context-memory-prompt.md`

Modified:

- `src/app/api/portal/chat/route.ts`
- `src/lib/portal/ai-layer.service.ts`

## Architecture

The updated request flow is:

```text
PortalChatLauncher.tsx
↓
/api/portal/chat
↓
buildConversationMemory()
↓
buildPortalAIContext()
↓
sendAIChatRequest()
↓
Business Central OneData AI Layer API
```

If the AI call fails, the route falls back to:

```text
buildPortalChatReply()
```

## Implementation Notes

### 1. Portal AI Context Builder

`src/lib/portal/portal-ai-context-builder.ts` resolves trusted tenant context server-side using existing portal services and auth patterns.

It currently collects and normalizes:

- portal page path
- inferred page type
- locale when present
- authenticated portal user identity
- customer reference
- Business Central company reference
- current incident context when the user is on an incident detail page
- current contract/property hints from existing contract data
- page-context facts from the frontend as non-trusted hints
- operational hints for prompt grounding

It outputs a compact `PORTAL CONTEXT:` block intended for prompt enrichment.

### 2. Conversation Memory

`src/lib/portal/conversation-memory.service.ts`:

- keeps only valid `user` and `assistant` messages
- removes empty entries
- trims each message to 500 characters
- limits memory to the last 6 messages
- formats memory into a compact `CONVERSATION MEMORY:` block

### 3. Real Estate System Prompt

`src/prompts/tenant-assistant.system.txt` contains the tenant-assistant instruction set with:

- operational real-estate tone
- language alignment
- urgency detection guidance
- incident-aware next-step guidance
- anti-hallucination and anti-overclaim rules

### 4. AI Payload Enrichment

`src/lib/portal/ai-layer.service.ts` now composes the AI request as:

```text
SYSTEM INSTRUCTIONS:
...

PORTAL CONTEXT:
...

CONVERSATION MEMORY:
...

CURRENT USER QUESTION:
...
```

This enriched text is sent through the existing BC custom API payload using the single `question` field.

### 5. Fallback Preservation

`src/app/api/portal/chat/route.ts` still catches AI failures and logs fallback usage server-side before calling the deterministic assistant.

Tenant-facing error responses avoid exposing raw technical BC/Azure details.

## Local Testing Instructions

### Type Check

Run:

```bash
npx tsc --noEmit
```

### Functional Tests

1. Test 1: Portal connectivity

Message:

```text
Responde solamente: PORTAL OK
```

Expected:

```text
PORTAL OK
```

2. Test 2: Maintenance issue tone

Message:

```text
Tengo humedad en el baño
```

Expected:

- calm operational response
- maintenance-oriented tone
- suggestion to open or update an incident
- mention of photos/attachments when useful

3. Test 3: Conversation memory

First:

```text
Tengo humedad
```

Then:

```text
Ahora también huele mal
```

Expected:

- the second answer reflects the same ongoing issue
- urgency/support language is stronger than in the first response

4. Test 4: Incident page context

Open an incident detail page and ask:

```text
¿De qué trata esta incidencia?
```

Expected:

- the response uses incident/page context when available
- if context is incomplete, the assistant explains what it can infer

5. Test 5: AI fallback

Simulate an AI failure by pointing the BC AI endpoint to an invalid target or by forcing an AI-layer error.

Expected:

- `/api/portal/chat` still returns a valid chat reply
- deterministic fallback is used
- no raw Azure/BC technical error is shown to the tenant

## Known Limitations

- Conversation memory is still request-scoped and browser-driven, not persisted server-side.
- Locale is only used when present in the request or page context; there is no deeper i18n negotiation yet.
- Contract/property enrichment is intentionally lightweight and based on existing portal services.
- The AI suggestions remain deterministic and page/intent based; the AI does not generate UI actions yet.
- The current frontend does not explicitly send `pageType` or `locale`, so those values are inferred or defaulted server-side.

## Next Recommended Sprint

Recommended next sprint:

- add server-side conversation persistence by `sessionId`
- improve context enrichment for invoice detail pages and property-specific pages
- add observability around AI latency, fallback rate, and prompt composition quality
- add controlled incident-drafting assistance without changing the current chat shell

