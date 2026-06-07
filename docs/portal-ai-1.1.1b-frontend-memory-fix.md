# Portal AI 1.1.1b: Frontend Memory Fix

## Problem

The backend already supported conversation memory, but follow-up chat messages could still behave like a brand-new conversation.

Example:

```text
User: Tengo humedad en el baño
User: Ahora también huele mal
```

Expected:

- the second message is understood as part of the same issue

Observed bad behavior:

- the assistant could fall back to a generic answer such as "Todavía no entiendo esa consulta..."

## Root Cause

`PortalChatLauncher.tsx` was already sending a `history` field, but the frontend history payload was built inline and loosely.

This sprint makes that payload explicit and stable by:

- normalizing message content
- limiting history to the last 6 messages
- excluding the welcome message
- sending only `{ role, content }`
- trimming each history message to 500 characters

## Files Changed

Modified:

- `src/components/portal/PortalChatLauncher.tsx`
- `src/app/api/portal/chat/route.ts`

Created:

- `docs/portal-ai-1.1.1b-frontend-memory-fix.md`

## Payload Before / After

### Before

History was being assembled inline in the submit flow.

### After

History is now built through a dedicated helper:

```ts
buildHistoryForAI(messages)
```

The request payload sent to `/api/portal/chat` includes:

```json
{
  "message": "...",
  "page": "/portal/...",
  "pageContext": { "...": "..." },
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

## What Changed

### Frontend

`src/components/portal/PortalChatLauncher.tsx` now:

- builds a normalized `history` payload through a helper
- keeps only the last 6 conversation messages
- trims content to 500 characters
- excludes the welcome message
- avoids sending technical/UI-only structure

### Backend

`src/app/api/portal/chat/route.ts` already accepted `history`, so no structural backend change was needed.

The route now also logs:

- `historyCount`
- `sessionId`

This helps confirm that the backend really receives prior messages.

## How To Test

### Test 1: Memory continuity

Ask:

```text
Tengo humedad en el baño
```

Then ask:

```text
Ahora también huele mal
```

Expected:

- the second answer references humidity or the previous issue
- `historyCount > 0` in backend logs

### Test 2: Fresh chat

Reload the page or start a fresh chat and ask:

```text
Ahora también huele mal
```

Expected:

- the assistant may ask what issue it refers to
- this is acceptable because there is no prior history

### Test 3: Network payload

Open browser DevTools, inspect `/api/portal/chat`, and confirm the request body includes:

```json
"history": [...]
```

### Test 4: Limit

Send many messages and confirm:

- only the last 6 messages are sent
- each item contains only `role` and `content`

## Known Limitations

- History is still browser-session memory only and resets on reload.
- The synthetic per-page assistant message is still allowed in history if it is part of the recent conversation state.
- This sprint does not add server-side persistence.

