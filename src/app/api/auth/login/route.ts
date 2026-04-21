import { NextRequest, NextResponse } from "next/server";
import { encodeSession, sessionCookieName } from "@/lib/auth/session";
import { env } from "@/lib/config/env";

export async function POST(req: NextRequest) {
  if (!env.useDemoLogin) {
    return NextResponse.json({ error: "El acceso demo no está disponible." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "tenant@example.com";
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, encodeSession({ email, provider: "demo" }), {
    httpOnly: true, sameSite: "lax", path: "/"
  });
  return response;
}
