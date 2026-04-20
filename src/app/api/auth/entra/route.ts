import { NextResponse } from "next/server";
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