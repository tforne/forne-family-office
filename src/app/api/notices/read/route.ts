import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortalSession } from "@/lib/auth/session";
import { markTenantMyNoticeAsRead } from "@/lib/portal/tenant-my-notices-write.service";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Sesión no autenticada." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const noticeId = clean(body.noticeId);
  const lineNo = typeof body.lineNo === "number" ? body.lineNo : Number(body.lineNo);

  if (!noticeId || !Number.isInteger(lineNo) || lineNo <= 0) {
    return NextResponse.json({ error: "Faltan datos del aviso." }, { status: 400 });
  }

  try {
    await markTenantMyNoticeAsRead(noticeId, lineNo);
    revalidatePath("/portal");
    revalidatePath("/portal/notices");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mark notice as read failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo marcar el aviso como leído." },
      { status: 500 }
    );
  }
}
