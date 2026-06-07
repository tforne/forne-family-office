# Portal AI 1.1.1 Fallback Diagnostics

## Root Cause Hypothesis

The most likely cause of the unexpected fallback was prompt overflow.

The Business Central AI request shape only exposes a single `question` field, and the likely receiving field is:

```text
OD AI Portal Chat Request.Question = Text[2048]
```

After Sprint Portal AI 1.1.1, the enriched payload started combining:

- system instructions
- portal context
- page context facts
- conversation memory
- current user question

That can easily push the final prompt over a safe BC payload size, which may cause:

- BC validation failure
- truncation before the AI layer processes the request correctly
- malformed downstream prompt behavior
- fallback to `buildPortalChatReply()`

## Files Changed

Modified:

- `src/app/api/portal/chat/route.ts`
- `src/lib/portal/ai-layer.service.ts`

Created:

- `docs/portal-ai-1.1.1-fallback-diagnostics.md`

## What Was Added

### 1. Explicit Diagnostics Logs

The chat route now logs:

- AI request start
- `sessionId`
- `page`
- `pageType`
- whether context was included
- whether memory was included
- fallback activation reason

The AI layer now logs:

- AI request start
- original prompt length
- final prompt length
- whether trimming happened
- whether memory survived trimming
- AI response status
- AI response error
- BC/AI request failure reason when the call throws

### 2. Prompt Length Control

`src/lib/portal/ai-layer.service.ts` now trims the enriched prompt with:

```ts
trimEnrichedPromptForBC()
```

Current safe limit:

```text
1800 characters
```

This keeps margin below a probable `Text[2048]` BC field limit.

## How Prompt Length Is Controlled

The trim order is intentionally conservative.

Always preserved:

- `CURRENT USER QUESTION`
- essential `PORTAL CONTEXT`

Trim order:

1. remove conversation memory first
2. shorten long portal/page context details
3. shorten the system prompt
4. fall back to a minimal system marker plus essential context

When shortening happens, the payload includes the marker:

```text
[Context shortened to fit Business Central API field]
```

This avoids silent mid-text clipping.

## How to Test

### 1. Type Check

```bash
npx tsc --noEmit
```

### 2. Build Check

```bash
npx next build
```

### 3. Functional Chat Checks

Test 1:

```text
Responde solamente: PORTAL OK
```

Expected:

- AI response is used
- no fallback
- BC status becomes `Completed`

Test 2:

```text
Tengo humedad en el baño
```

Expected:

- AI response is used
- operational real estate tone
- no deterministic fallback

Test 3:

First:

```text
Tengo humedad
```

Then:

```text
Ahora también huele mal
```

Expected:

- AI understands continuity
- no deterministic fallback
- logs show memory included when prompt size allows it

### 4. Log Checks

Look for:

```text
[api/portal/chat] AI request start
[portal-ai] AI request start
[portal-ai] AI response received
```

You should normally not see:

```text
[api/portal/chat] AI FALLBACK ACTIVATED
```

unless there is a real BC/Azure/API error.

Also verify:

- `finalQuestionLength` stays under `1800`
- `promptTrimmed` is `true` only when needed
- `memoryIncluded` may become `false` on long requests by design

## How to Check BC Table OD AI Portal Chat Request

In Business Central, review the AI request records for the session under the custom AI layer table/page associated with:

```text
OD AI Portal Chat Request
```

Check at least:

- `Session Id`
- `Portal User Id`
- `Question`
- `Status`
- `Error Message`
- response/output field if exposed

For the `PORTAL OK` test, confirm:

- the record exists
- `Question` is not excessively long
- `Status = Completed`

For failure cases, compare:

- application log `sessionId`
- BC record `Session Id`
- BC `Status`
- BC `Error Message`

## Logs to Look For

Important route log:

```text
[api/portal/chat] AI FALLBACK ACTIVATED
```

Important AI-layer logs:

```text
[portal-ai] AI request start
[portal-ai] AI request failed
[portal-ai] AI response received
```

The most useful fields during diagnosis are:

- `sessionId`
- `page`
- `pageType`
- `originalQuestionLength`
- `finalQuestionLength`
- `promptTrimmed`
- `memoryIncluded`
- `status`
- `error`

