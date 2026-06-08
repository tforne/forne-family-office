import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { buildPortalChatReply, type PortalChatHistoryItem, type PortalChatReply, type PortalPageContext } from "@/lib/portal/chat-assistant";
import { sendAIChatRequest } from "@/lib/portal/ai-layer.service";
import { buildConversationMemory } from "@/lib/portal/conversation-memory.service";
import { detectDuplicateIncidents } from "@/lib/portal/duplicate-incident-detector.service";
import { detectOperationalEscalation } from "@/lib/portal/escalation-detector.service";
import { buildIncidentDraft } from "@/lib/portal/incident-draft.service";
import { buildIncidentOperationalSummary } from "@/lib/portal/incident-summary.service";
import { buildPortalActions, detectPortalIntent, toPortalIntentMetadata } from "@/lib/portal/intent-detector.service";
import { buildOperationalRouting, buildOperationalRoutingActions } from "@/lib/portal/operational-routing.service";
import { buildPortalAIContext } from "@/lib/portal/portal-ai-context-builder";
import { getIncidents } from "@/lib/portal/incidents.service";

const chatSessionCookieName = "ffo_portal_chat_session";

function parsePageContext(rawPageContext: unknown): PortalPageContext {
  return rawPageContext && typeof rawPageContext === "object"
    ? {
        pageTitle: typeof (rawPageContext as { pageTitle?: unknown }).pageTitle === "string" ? (rawPageContext as { pageTitle?: string }).pageTitle : undefined,
        pageSummary: typeof (rawPageContext as { pageSummary?: unknown }).pageSummary === "string" ? (rawPageContext as { pageSummary?: string }).pageSummary : undefined,
        pageEyebrow: typeof (rawPageContext as { pageEyebrow?: unknown }).pageEyebrow === "string" ? (rawPageContext as { pageEyebrow?: string }).pageEyebrow : undefined,
        visibleFacts: Array.isArray((rawPageContext as { visibleFacts?: unknown }).visibleFacts)
          ? (rawPageContext as { visibleFacts?: Array<{ label?: unknown; value?: unknown; helper?: unknown }> }).visibleFacts
              ?.filter(
                (item): item is { label: string; value: string; helper?: string } =>
                  Boolean(item) && typeof item.label === "string" && typeof item.value === "string"
              )
              .slice(0, 10)
          : undefined,
        visibleSections: Array.isArray((rawPageContext as { visibleSections?: unknown }).visibleSections)
          ? (rawPageContext as { visibleSections?: Array<{ title?: unknown; summary?: unknown }> }).visibleSections
              ?.filter(
                (item): item is { title: string; summary: string } =>
                  Boolean(item) && typeof item.title === "string" && typeof item.summary === "string"
              )
              .slice(0, 8)
          : undefined,
        visibleUpdates: Array.isArray((rawPageContext as { visibleUpdates?: unknown }).visibleUpdates)
          ? (rawPageContext as { visibleUpdates?: Array<{ date?: unknown; text?: unknown }> }).visibleUpdates
              ?.filter(
                (item): item is { date?: string; text: string } =>
                  Boolean(item) && typeof item.text === "string" && (!item.date || typeof item.date === "string")
              )
              .slice(0, 5)
          : undefined
      }
    : {};
}

export async function POST(request: Request) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      message?: unknown;
      page?: unknown;
      pageType?: unknown;
      sessionId?: unknown;
      locale?: unknown;
      history?: unknown;
      pageContext?: unknown;
    };

    const message = typeof payload.message === "string" ? payload.message : "";
    const page = typeof payload.page === "string" && payload.page.startsWith("/portal") ? payload.page : "/portal";
    const history = Array.isArray(payload.history)
      ? payload.history
          .filter((item): item is PortalChatHistoryItem => {
            if (!item || typeof item !== "object") return false;
            const candidate = item as { role?: unknown; content?: unknown };
            return (candidate.role === "assistant" || candidate.role === "user") && typeof candidate.content === "string";
          })
          .slice(-6)
      : [];
    const pageType = typeof payload.pageType === "string" ? payload.pageType : undefined;
    const locale = typeof payload.locale === "string" ? payload.locale : undefined;
    const pageContext = parsePageContext(payload.pageContext);
    const cookieStore = await cookies();
    const sessionId =
      (typeof payload.sessionId === "string" && payload.sessionId.trim()) ||
      cookieStore.get(chatSessionCookieName)?.value ||
      crypto.randomUUID();
    const conversationMemory = buildConversationMemory(history);
    const intentResult = detectPortalIntent(message);
    const portalContext = await buildPortalAIContext({
      message,
      page,
      pageType,
      pageContext,
      sessionId,
      locale,
      history
    });
    const incidents = await getIncidents().catch(() => []);
    const incidentDraft = buildIncidentDraft(message, portalContext, intentResult);
    const duplicateIncident = detectDuplicateIncidents(message, incidents, portalContext, intentResult);
    const escalation = detectOperationalEscalation(message, intentResult, duplicateIncident, portalContext);
    const routing = buildOperationalRouting(intentResult, duplicateIncident, escalation, portalContext);
    const operationalSummary = buildIncidentOperationalSummary(
      message,
      intentResult,
      portalContext,
      duplicateIncident,
      escalation
    );
    const baseActions = buildPortalActions(intentResult, incidentDraft);
    const actions = [
      ...baseActions.filter((action) => !(duplicateIncident.isPotentialDuplicate && action.type === "create_incident")),
      ...buildOperationalRoutingActions(routing, duplicateIncident, {
        message,
        incidentDraft
      })
    ];

    const enrichReply = (reply: PortalChatReply): PortalChatReply => ({
      ...reply,
      intent: toPortalIntentMetadata(intentResult),
      incidentDraft,
      actions,
      duplicateIncident,
      escalation,
      routing,
      operationalSummary,
      propertyOperationalIntelligence: portalContext.propertyOperationalIntelligence,
      canEscalate: reply.canEscalate || escalation.shouldEscalate
    });

    console.info("[api/portal/chat] AI request start", {
      sessionId,
      page,
      pageType: portalContext.pageType,
      historyCount: history.length,
      contextIncluded: Boolean(portalContext.compactText),
      memoryIncluded: conversationMemory.length > 0,
      intent: intentResult.intent,
      urgency: intentResult.urgency,
      duplicateDetected: duplicateIncident.isPotentialDuplicate,
      escalationLevel: escalation.level
    });

    try {
      const reply = await sendAIChatRequest({
        message,
        sessionId,
        portalContext,
        conversationMemory
      });
      console.info("[api/portal/chat] AI response delivered", {
        sessionId,
        page,
        pageType: portalContext.pageType,
        source: "ai"
      });
      const response = NextResponse.json({ reply: enrichReply(reply) });
      response.cookies.set(chatSessionCookieName, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
      });
      return response;
    } catch (aiError) {
      console.error("[api/portal/chat] AI FALLBACK ACTIVATED", {
        sessionId,
        page,
        pageType: portalContext.pageType,
        reason: aiError instanceof Error ? aiError.message : String(aiError)
      });
    }

    const reply = await buildPortalChatReply(page, message, history, pageContext);
    console.info("[api/portal/chat] AI response delivered", {
      sessionId,
      page,
      pageType: portalContext.pageType,
      source: "fallback",
      intent: intentResult.intent,
      urgency: intentResult.urgency
    });
    const response = NextResponse.json({ reply: enrichReply(reply) });
    response.cookies.set(chatSessionCookieName, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });
    return response;
  } catch (error) {
    console.error("[api/portal/chat] Request failed.", error);
    return NextResponse.json({ error: "No se pudo procesar la consulta del chat." }, { status: 500 });
  }
}
