import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { buildPortalChatReply } from "@/lib/portal/chat-assistant";

export async function POST(request: Request) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      message?: unknown;
      page?: unknown;
    };

    const message = typeof payload.message === "string" ? payload.message : "";
    const page = typeof payload.page === "string" && payload.page.startsWith("/portal") ? payload.page : "/portal";
    const reply = await buildPortalChatReply(page, message);

    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar la consulta del chat.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
