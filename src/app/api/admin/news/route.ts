import { NextResponse } from "next/server";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { listNewsItems, saveNewsItems, type NewsItem } from "@/lib/content/news";

export async function GET() {
  try {
    await getPortalAdminSession();
    return NextResponse.json(await listNewsItems());
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json({ error: "No autorizado." }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    await getPortalAdminSession();
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? (body.items as NewsItem[]) : null;

    if (!items) {
      return NextResponse.json({ error: "Formato inválido para las noticias." }, { status: 400 });
    }

    const saved = await saveNewsItems(items);
    return NextResponse.json({ ok: true, items: saved });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      const status = error.message === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json({ error: "No autorizado." }, { status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron guardar las noticias." },
      { status: 500 }
    );
  }
}
