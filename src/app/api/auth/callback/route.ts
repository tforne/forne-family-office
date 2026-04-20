import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateEntraIdToken } from "@/lib/auth/entra";
import { encodeSession, sessionCookieName } from "@/lib/auth/session";
import { env } from "@/lib/config/env";

export async function GET() {
  if (!env.entraAuthority || !env.entraClientId || !env.entraRedirectUri) {
    return NextResponse.json({ error: "Falta configuración de Entra." }, { status: 500 });
  }

  let url: URL;

  try {
    url = new URL(`${env.entraAuthority}/oauth2/v2.0/authorize`);
  } catch (error) {
    console.error("Invalid ENTRA_AUTHORITY:", env.entraAuthority, error);
    return NextResponse.json({ error: "ENTRA_AUTHORITY no es válida." }, { status: 500 });
  }

  url.searchParams.set("client_id", env.entraClientId);
  url.searchParams.set("response_type", "id_token");
  url.searchParams.set("redirect_uri", env.entraRedirectUri);
  url.searchParams.set("response_mode", "form_post");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("nonce", crypto.randomUUID());

  return NextResponse.redirect(url.toString());
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const error = form.get("error");
  const idToken = form.get("id_token");

  if (typeof error === "string" && error) {
    const errorUrl = new URL("/login", req.url);
    errorUrl.searchParams.set("error", error);
    return NextResponse.redirect(errorUrl, { status: 303 });
  }

  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Microsoft no devolvió id_token." }, { status: 400 });
  }

  try {
    const entraUser = await validateEntraIdToken(idToken);
    const response = NextResponse.redirect(new URL("/portal", req.url), { status: 303 });

    response.cookies.set(
      sessionCookieName,
      encodeSession({
        email: entraUser.email,
        externalUserId: entraUser.externalUserId,
        provider: "entra"
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
      }
    );

    return response;
  } catch (error) {
    console.error("Entra callback failed:", error);
    return NextResponse.json({ error: "No se pudo validar la respuesta de Microsoft." }, { status: 401 });
  }
}
