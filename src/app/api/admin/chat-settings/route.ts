import { NextResponse } from "next/server";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { saveChatSettings } from "@/lib/content/chat-settings";

export async function PUT(request: Request) {
  try {
    await getPortalAdminSession();
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = code === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "No autorizado." }, { status });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as { enabled?: unknown };
    const settings = await saveChatSettings({
      enabled: payload.enabled === true
    });

    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la configuración del chat.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
