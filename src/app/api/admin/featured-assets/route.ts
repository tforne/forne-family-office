import { NextResponse } from "next/server";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import {
  listFeaturedAssets,
  saveFeaturedAssets,
  type FeaturedAsset
} from "@/lib/content/featured-assets";

export async function GET() {
  try {
    await getPortalAdminSession();
    return NextResponse.json(await listFeaturedAssets());
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json({ error: "No autorizado." }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    await getPortalAdminSession();
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? (body.items as FeaturedAsset[]) : null;

    if (!items) {
      return NextResponse.json({ error: "Formato inválido para los activos destacados." }, { status: 400 });
    }

    const saved = await saveFeaturedAssets(items);
    return NextResponse.json({ ok: true, items: saved });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      const status = error.message === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json({ error: "No autorizado." }, { status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron guardar los activos destacados." },
      { status: 500 }
    );
  }
}
