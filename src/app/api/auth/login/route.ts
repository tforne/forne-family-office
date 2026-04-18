import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth/session";
export async function POST(_req: NextRequest) { const response = NextResponse.json({ ok: true }); response.cookies.set(sessionCookieName, "demo-authenticated", { httpOnly: true, sameSite: "lax", path: "/" }); return response; }
