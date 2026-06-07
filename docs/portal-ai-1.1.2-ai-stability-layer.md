# Portal AI 1.1.2: AI Stability Layer

## Summary

Sprint Portal AI 1.1.2 improves the resilience of the tenant portal AI chat without changing the frontend UX.

This sprint adds:

- retry with exponential backoff
- retryable 429 / rate-limit handling
- 15-second timeout control
- 15-second in-memory cache for successful AI responses
- prompt length stability under 1800 characters
- preserved deterministic fallback behavior

## Root Cause

The AI integration was working, but Azure OpenAI could intermittently throttle requests through the OneData AI Layer and Business Central path.

Typical failure patterns include:

- `Too Many Requests`
- `too_many_requests`
- `429`
- transient network resets
- request timeout

Without a stability layer, those transient failures could trigger fallback too early even though a short retry would likely succeed.

## Files Changed

Created:

- `src/lib/portal/ai-response-cache.ts`
- `src/lib/portal/ai-retry.ts`
- `docs/portal-ai-1.1.2-ai-stability-layer.md`

Modified:

- `src/lib/portal/ai-layer.service.ts`
- `src/app/api/portal/chat/route.ts`

## Retry / Backoff Strategy

Retry logic is implemented in `src/lib/portal/ai-retry.ts`.

Retry schedule:

```text
Attempt 1: immediate
Attempt 2: wait 1000ms + jitter
Attempt 3: wait 2000ms + jitter
Attempt 4: wait 4000ms + jitter
Then fallback
```

Jitter range:

```text
0–250ms
```

Retryable errors include messages containing:

- `Too Many Requests`
- `too_many_requests`
- `429`
- `rate limit`
- `ECONNRESET`
- `ETIMEDOUT`
- `fetch failed`
- `timeout`

Validation and authentication-style errors are not retried.

## Timeout Strategy

The AI request timeout is now:

```text
15000ms
```

If a timeout happens:

- it is logged server-side
- the retry layer may retry if attempts remain
- the UI still receives a normal chat response through fallback if all attempts fail

## Cache Strategy

Successful AI responses are cached in-memory for:

```text
15 seconds
```

Cache key includes:

- `sessionId`
- `agentCode`
- hash of the final trimmed AI prompt

Only successful AI answers are cached.
Errors are never cached.

## Prompt Stability

Sprint 1.1.1 prompt trimming is preserved and extended.

Current guarantees:

- `finalQuestionLength <= 1800`
- `CURRENT USER QUESTION` is always preserved
- essential `PORTAL CONTEXT` is always preserved

Trim order:

1. conversation memory
2. long portal/page context details
3. system prompt details

The enriched prompt also adds:

```text
Keep the response concise. Maximum 120 words unless the user asks for detail.
```

## Logging

The following server logs were added or expanded:

- AI request start
- cache hit / miss
- attempt number
- retryable true / false
- retry delay
- timeout
- sessionId
- finalQuestionLength
- AI response received
- fallback activated

Useful log markers:

- `[api/portal/chat] AI request start`
- `[portal-ai] AI request start`
- `[portal-ai] AI cache hit`
- `[portal-ai] AI cache miss`
- `[portal-ai] AI attempt start`
- `[portal-ai] AI attempt failed`
- `[portal-ai] AI timeout`
- `[portal-ai] AI response received`
- `[api/portal/chat] AI FALLBACK ACTIVATED`

## Local Testing Instructions

### 1. Type Check

```bash
npx tsc --noEmit
```

### 2. Build Check

```bash
npx next build
```

### 3. Functional Tests

Test 1:

```text
Responde solamente: PORTAL OK
```

Expected:

- AI response is used
- no fallback
- BC record status `Completed`

Test 2:

```text
Tengo humedad en el baño
```

Expected:

- AI response is used
- operational tone
- no raw technical error shown

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
- no deterministic fallback if AI succeeds

Test 4:

Simulate a transient AI error containing:

```text
Too Many Requests
```

Expected:

- retries happen
- logs show attempts and retry delays
- fallback only after all retries fail

Test 5:

Send the same message twice within 15 seconds.

Expected:

- second call uses cache
- logs show cache hit
- no duplicate BC AI call if cache is hit

## Known Limitations

- The cache is in-memory only, so it resets on server restart or across multiple server instances.
- Retryability is based on error-message pattern matching because BC/AI-layer errors are normalized before reaching the portal.
- The deterministic fallback text is unchanged in this sprint.
- There is still no persistent server-side conversation memory store.

## Next Recommended Sprint

- add shared/distributed cache if the deployment runs multiple instances
- add structured metrics for retry rate, timeout rate, cache hit rate, and fallback rate
- improve fallback messaging for overload scenarios while preserving the same UI contract
- add safer correlation IDs across portal logs and BC AI records

