# AI Layer Integration Analysis

## 1. Executive Summary

The current tenant portal is already well positioned for OneData AI Layer integration because it has three important pieces in place:

- A protected private portal built with Next.js App Router.
- A server-side API layer under `src/app/api/*` that already acts as the trust boundary between browser and backend services.
- A reusable Business Central integration layer under `src/lib/bc/*` and `src/lib/portal/*`.

The current chat is not an AI chat. It is a contextual, rule-based assistant that calls `/api/portal/chat`, evaluates the current page and user message, and returns deterministic responses based on portal data such as invoices, incidents, notices, documents, and profile information. Chat state is stored only in client React state and is not persisted server-side or in Business Central.

Because the portal already avoids calling Business Central directly from the browser, the best evolution path is not to replace the portal architecture, but to introduce OneData AI Layer behind the existing server-side API pattern. The lowest-risk first step is to keep the current chat UI and replace or augment the logic inside `/api/portal/chat` so it can call `OD AI Portal Chat API` through a secure backend/proxy with tenant-aware context.

## 2. Current Portal Architecture

### Framework detected

- Next.js `14.2.15`
- React `18`
- TypeScript
- App Router structure under `src/app`
- Tailwind-based UI

### Frontend structure

Key frontend areas:

- Public site pages under `src/app/[locale]` and other public routes
- Private portal pages under `src/app/portal/*`
- Shared portal UI components under `src/components/portal/*`
- Chat UI in `src/components/portal/PortalChatLauncher.tsx`

The portal layout injects the chat globally from `src/app/portal/layout.tsx` when:

- The user is authenticated
- The portal user is valid in Business Central
- `CHAT_AVAILABLE=true`
- Content setting `chat-settings.json` has `enabled: true`

### Backend/API structure

The project has a built-in backend layer through Next.js route handlers:

- Portal APIs: `src/app/api/portal/*`
- Me/data APIs: `src/app/api/me/*`
- Auth APIs: `src/app/api/auth/*`
- BC diagnostics APIs: `src/app/api/bc/*`
- Incident/ticket actions: `src/app/api/incidents/contact/route.ts`

Business Central access is centralized in:

- `src/lib/bc/client.ts`
- `src/lib/bc/auth.ts`
- `src/lib/bc/endpoints.ts`
- `src/lib/bc/odata.ts`

Business domain services are centralized in:

- `src/lib/portal/*.service.ts`

This is a strong existing pattern and should be reused for AI Layer integration.

### Auth approach

Authentication is based on Microsoft Entra ID or demo mode:

- Session cookie: `ffo_portal_session`
- Session reader: `src/lib/auth/session.ts`
- Middleware protection: `middleware.ts`
- Entra login redirect: `src/app/api/auth/entra/route.ts`
- Entra callback and cookie creation: `src/app/api/auth/callback/route.ts`
- ID token validation: `src/lib/auth/entra.ts`

Important behavior:

- The portal protects `/portal/*` in middleware and again in server components/routes.
- The session cookie stores `email`, `externalUserId`, and `provider`.
- The app resolves the real portal user against Business Central after login.

### Chat implementation summary

The chat is currently a guided portal assistant, not an LLM integration.

Flow:

1. `PortalChatLauncher.tsx` renders the chat UI.
2. User messages are sent to `/api/portal/chat`.
3. `/api/portal/chat` calls `buildPortalChatReply()` from `src/lib/portal/chat-assistant.ts`.
4. `chat-assistant.ts` loads portal data through existing services like `getInvoices()`, `getIncidents()`, `getIncidentRequests()`, `getDocuments()`, `getTenantMyNotices()`, `getMe()`, `getContracts()`.
5. A deterministic response is returned with text, links, suggestions, and optional escalation.

### Incident flow summary

Incidents and related requests are already integrated with Business Central.

Key flow:

- Tenant opens incident from `src/components/portal/NewIncidentForm.tsx`
- Form posts multipart data to `src/app/api/incidents/contact/route.ts`
- Route validates fields and attachments
- Route calls `createIncident()` in `src/lib/portal/incident-create.service.ts`
- Service posts to Business Central writable endpoint, defaulting to `tenantIncidentRequests`
- Attachments are uploaded separately by `src/lib/portal/incident-attachment-sync.service.ts`
- A notification email is sent via Microsoft Graph mail helper
- Portal incident lists and details read from BC via `tenantIncidents`, `tenantIncidentRequests`, and `tenantIncidentComments`

## 3. Current Chat Assessment

### How the current chat works

The current chat is implemented in `src/components/portal/PortalChatLauncher.tsx`.

It provides:

- Floating chat launcher in the private portal
- Context-aware title and quick suggestions based on current route
- A message list with user and assistant roles
- Loading and error states
- Optional escalation button that sends the original message by email

The chat sends this payload to `/api/portal/chat`:

- `message`
- `page`
- `history`
- `pageContext`

`pageContext` is especially important. Several portal pages inject structured context via `PortalPageContext`, including:

- `src/app/portal/page.tsx`
- `src/app/portal/contracts/page.tsx`
- `src/app/portal/invoices/[id]/page.tsx`
- `src/app/portal/incidents/[id]/page.tsx`

This means the portal already has a lightweight mechanism to pass page-specific facts into the assistant without screen scraping.

### Where chat state is stored

Chat state is stored only in React client state inside `PortalChatLauncher.tsx`:

- `messages`
- `suggestions`
- `pending`
- `error`
- `sendingEscalationId`

There is no persistence in:

- Business Central
- database
- KV storage
- session storage
- local storage

Conversation history is short-lived and only sent as the last few messages in the request payload. A page reload resets the conversation.

### What backend/API the chat currently uses

The backend entrypoint is:

- `src/app/api/portal/chat/route.ts`

The current response engine is:

- `src/lib/portal/chat-assistant.ts`

This engine is rule-based and uses:

- route detection
- keyword matching
- recent user history
- page context
- real portal service calls

It does not call:

- Azure OpenAI
- OneData AI Layer
- Business Central AI APIs

### Strengths

- Good existing UX that should be preserved
- Secure pattern: browser talks to portal backend, not directly to BC
- Context-aware suggestions already exist
- Assistant already knows how to use tenant-scoped portal data
- Escalation to humans already exists
- Structured `pageContext` mechanism can be reused for AI prompts/context

### Limitations

- No true natural language understanding
- No persistent session or memory
- No AI-generated reasoning or summarization
- No incident drafting from conversation
- No use of property risk, suggested actions, or incident analysis
- No observability tied to AI interactions
- No agent selection or governance concepts yet

### Where AI can improve it

The current chat can evolve from a portal FAQ helper into a tenant-safe AI assistant by:

- Turning `/api/portal/chat` into an AI-backed orchestrator
- Passing tenant, contract, property, incident, and page context into AI requests
- Using existing BC services to enrich prompts and ground answers
- Offering next actions and incident creation based on conversation intent
- Gradually enabling AI features without changing the core UI shell

## 4. AI Integration Opportunities

### AI assistant inside current chat

Replace the deterministic reply engine behind `/api/portal/chat` with a BC AI Layer-backed flow. Preserve the current UI and progressively improve response quality.

### AI-guided incident creation

Use AI to:

- ask for missing incident details
- draft title and description
- suggest case type and priority
- propose whether attachments or insurance details are relevant

### Automatic incident classification

Before creating an incident, AI can classify:

- `Problem`
- `Request`
- `Question`

and suggest priority and routing.

### Insurance detection

The incident detail page already exposes insurance-related fields when available. AI can detect when a new issue likely involves insurance and prompt the tenant for missing insurer/claim context.

### Risk-aware answers

Use Property Risk API to enrich chat responses for:

- recurring property issues
- elevated risk assets
- patterns that justify escalation or preventive action

### Suggested next actions

Use Suggested Actions API to propose:

- schedule inspection
- escalate to property manager
- request missing documentation
- notify insurance
- convert to formal incident

### Property manager AI dashboard

Admin users already have a separate portal/admin area and broader visibility. AI widgets could be added there for:

- incident backlog prioritization
- risk summaries
- recommended actions
- exception monitoring

### Tenant self-service assistant

Beyond chat, AI can guide the tenant across:

- invoice questions
- document discovery
- notice interpretation
- incident follow-up
- contract-related questions

## 5. Recommended Integration Architecture

Recommended architecture:

```text
Tenant Portal Chat UI
↓
/api/portal/chat (Portal Backend / API Proxy)
↓
AI orchestration service in portal backend
↓
Business Central API
↓
OneData AI Layer
↓
Azure OpenAI
```

Recommended supporting pattern:

```text
Portal UI
↓
Portal API routes
↓
src/lib/portal/ai-layer.service.ts
↓
src/lib/bc/client.ts / BC custom API calls
↓
OneData AI Layer endpoints
```

Why this is the right fit here:

- The frontend should not call BC AI endpoints directly.
- BC credentials and scopes already live server-side.
- The portal already uses server-side proxies for BC.
- This preserves current architecture and minimizes security risk.
- It allows request enrichment with tenant context before sending to AI Layer.

## 6. Proposed API Client

The cleanest project-aligned addition would be:

```text
src/lib/portal/ai-layer.service.ts
```

Optionally supported by:

```text
src/lib/bc/ai-layer.ts
```

Suggested responsibilities:

- map portal user/session context to AI payloads
- resolve BC company and tenant context
- call BC custom AI endpoints through existing BC client patterns
- normalize responses for portal use
- centralize AI-related error handling

Suggested methods:

```ts
sendAIChatRequest()
getPropertyRisks()
getSuggestedActions()
getIncidentAnalyses()
```

Suggested `sendAIChatRequest()` input:

- `portalUserId`
- `sessionId`
- `agentCode`
- `question`
- `source`
- optional `page`
- optional `pageContext`
- optional `customerNo`
- optional `contractNo`
- optional `fixedRealEstateNo`
- optional `incidentId`

Suggested route usage:

- `/api/portal/chat` should call `sendAIChatRequest()`
- future admin or dashboard routes can call risk/action/analysis methods

## 7. Proposed UI Changes

The current UI is good enough for MVP and should be evolved, not replaced.

Suggested concrete changes:

- Keep the existing floating `PortalChatLauncher`
- Rename assistant label from static portal helper to `AI Assistant` or `Asistente AI`
- Preserve current suggestions row, but generate some suggestions dynamically from AI or intent rules
- Add clearer loading state for AI calls
- Add explicit AI error state with fallback to human escalation
- Add follow-up chips under AI responses
- Add `Create incident from conversation`
- Add `Escalate to property manager`
- Add agent selector only if business users really need multiple agent modes

Recommended initial UX approach:

- do not add a visible agent selector in MVP 1
- keep current visual shell and response bubbles
- introduce AI progressively behind the same chat control

Additional future widgets:

- Property risk summary card on contract/property pages
- Suggested action card on incident detail pages
- Manager dashboard block for risk and operational exceptions

## 8. First MVP Scope

### MVP 1

- connect existing chat to AI Chat API
- send user question
- pass tenant-safe context
- show AI response in current chat UI
- preserve existing chat UX
- log errors clearly
- keep escalation by email as fallback

### MVP 2

- incident creation assistant
- suggested answers
- prefill incident title, type, priority, and description
- add `Create incident from conversation`

### MVP 3

- risk widgets for manager and/or contract pages
- suggested actions widgets
- incident analysis enrichment on incident detail or admin workflows

## 9. Risks and Technical Considerations

### Authentication

AI calls should run server-side using the same portal authentication boundary already used for BC.

Important note: the current session cookie is base64-encoded JSON, not a signed server session. That is outside this AI scope, but it is a security consideration worth tightening before broader AI rollout.

### Permissions

AI routes must enforce:

- authenticated portal user
- resolved BC portal user
- tenant/company scoping
- admin-only access for manager widgets

### Tenant data isolation

This is the most important integration rule.

All AI requests should be grounded only with:

- the current resolved portal user
- the user’s BC company
- the user’s `customerNo`
- the specific contract/property/incident context currently in scope

Do not let the frontend send arbitrary company or customer identifiers that are trusted directly.

### Business Central API rate limits

AI orchestration may increase BC reads because grounding data may need:

- me/profile
- contracts
- incidents
- notices
- asset/property context

Caching or selective enrichment may be needed for performance.

### Azure OpenAI rate limits

Use AI Layer governance rather than calling the model directly from the portal. That aligns with the business goal and centralizes throttling, cost control, and policy.

### Response length

Tenant-facing answers should stay concise and actionable. The current UX expects short operational answers, not long reports.

### Frontend security

Do not place:

- BC access tokens
- AI Layer credentials
- API keys

in frontend code or client-exposed env vars.

### Auditability

OneData AI Layer observability and usage logging are a major advantage. The portal should pass stable metadata where possible:

- portal user id
- session id
- page
- source = `TenantPortal`
- maybe contract/property/incident reference ids

### Fallback behavior

If AI fails:

- keep current escalation by email
- optionally keep a rule-based fallback for a few high-value intents

## 10. Implementation Plan

### Sprint Portal AI 1: API client + chat connection

- Add AI Layer service module
- Add BC AI endpoint configuration
- Update `/api/portal/chat` to call AI Chat API
- Build request mapper from portal context to AI payload
- Normalize AI response into current `ChatReply` shape
- Add structured logging and graceful fallback

### Sprint Portal AI 2: Incident assistant

- Add intent detection for incident creation
- Add AI-generated draft title/description
- Suggest case type and priority
- Add `Create incident from conversation`
- Reuse existing `createIncident()` flow

### Sprint Portal AI 3: Risk widgets

- Add property risk service methods
- Add risk summary cards to contract/property/admin views
- Add manager-specific visibility rules

### Sprint Portal AI 4: Suggested actions workflow

- Add suggested actions retrieval
- Surface action recommendations in incidents/contracts/admin screens
- Add controlled escalation workflow to human operators

## 11. Files Reviewed

Key files and folders reviewed:

- `package.json`
- `README.md`
- `middleware.ts`
- `src/app/portal/layout.tsx`
- `src/components/portal/PortalChatLauncher.tsx`
- `src/components/portal/PortalPageContext.tsx`
- `src/components/portal/NewIncidentForm.tsx`
- `src/components/portal/IncidentContactForm.tsx`
- `src/app/api/portal/chat/route.ts`
- `src/app/api/portal/chat/escalate/route.ts`
- `src/app/api/incidents/contact/route.ts`
- `src/app/api/auth/entra/route.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/me/route.ts`
- `src/app/api/me/incidents/route.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/entra.ts`
- `src/lib/config/env.ts`
- `src/lib/bc/client.ts`
- `src/lib/bc/auth.ts`
- `src/lib/bc/endpoints.ts`
- `src/lib/bc/odata.ts`
- `src/lib/portal/chat-assistant.ts`
- `src/lib/portal/user-context.ts`
- `src/lib/portal/me.service.ts`
- `src/lib/portal/contracts.service.ts`
- `src/lib/portal/incidents.service.ts`
- `src/lib/portal/incident-requests.service.ts`
- `src/lib/portal/incident-create.service.ts`
- `src/lib/portal/incident-attachment-sync.service.ts`
- `src/lib/portal/incident-comments.service.ts`
- `src/lib/portal/admin-auth.ts`
- `src/lib/content/chat-settings.ts`
- `src/data/chat-settings.json`
- `src/app/portal/page.tsx`
- `src/app/portal/incidents/page.tsx`
- `src/app/portal/incidents/[id]/page.tsx`
- `src/app/portal/incident-requests/page.tsx`
- `src/app/portal/contracts/page.tsx`
- `src/app/portal/invoices/[id]/page.tsx`
- `docs/business-central-alta-incidencias.md`
- `docs/business-central-comentarios-incidencias.md`
- `docs/portal-admin-usuarios-diseno.md`
- `docs/business-central-al/*`

## 12. Recommended First Code Changes

Do not implement yet. Recommended first changes:

- Add `src/lib/portal/ai-layer.service.ts`
- Add AI endpoint constants/config for:
  - `aiChatRequests`
  - `propertyRisks`
  - `suggestedActions`
  - `incidentAnalyses`
- Refactor `/api/portal/chat/route.ts` to call AI Layer service instead of only `buildPortalChatReply()`
- Keep `PortalChatLauncher.tsx` response contract stable
- Introduce a generated `sessionId` for chat requests
- Map `resolvePortalUserContext()` output into AI payload fields
- Pass page-level context from `PortalPageContext` into AI request enrichment
- Add normalized AI response/error adapter back into current `ChatReply` shape
- Preserve `/api/portal/chat/escalate` as a fallback path
- Optionally keep `chat-assistant.ts` as fallback logic during rollout

## Final Recommendation

The first implementation should be to connect the existing chat to `OD AI Portal Chat API` through a secure backend/proxy, preserving the current portal UX and adding AI responses progressively.
