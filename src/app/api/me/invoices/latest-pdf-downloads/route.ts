import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { getLatestInvoicesWithOfficialPdf } from "@/lib/portal/invoices.service";

export async function GET(req: Request) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Sesión no autenticada." }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || "3");
  const scan = Number(url.searchParams.get("scan") || "10");

  const invoices = await getLatestInvoicesWithOfficialPdf(
    Number.isFinite(limit) ? Math.max(1, Math.min(limit, 10)) : 3,
    Number.isFinite(scan) ? Math.max(1, Math.min(scan, 20)) : 10
  );

  return NextResponse.json({ invoices });
}
