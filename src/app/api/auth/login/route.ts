import { NextRequest, NextResponse } from "next/server";
import { encodeSession, sessionCookieName } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "tenant@example.com";
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, encodeSession({ email, provider: "demo" }), {
    httpOnly: true, sameSite: "lax", path: "/"
  });
  return response;
}
