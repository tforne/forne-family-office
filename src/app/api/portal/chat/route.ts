import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { buildPortalChatReply, type PortalChatHistoryItem, type PortalPageContext } from "@/lib/portal/chat-assistant";

export async function POST(request: Request) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      message?: unknown;
      page?: unknown;
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
    const rawPageContext = payload.pageContext;
    const pageContext: PortalPageContext =
      rawPageContext && typeof rawPageContext === "object"
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
    const reply = await buildPortalChatReply(page, message, history, pageContext);

    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar la consulta del chat.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
