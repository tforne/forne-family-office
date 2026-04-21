import { env } from "@/lib/config/env";

let cache: { token: string; expiresAt: number } | null = null;

function isPlaceholderSecret(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "pega_aqui_el_secret_nuevo" ||
    normalized === "your-client-secret" ||
    normalized === "client-secret" ||
    normalized.includes("pega_aqui") ||
    normalized.includes("replace")
  );
}

function requireBusinessCentralAuthConfig() {
  const missing = [
    ["ENTRA_TENANT_ID", env.entraTenantId],
    ["ENTRA_CLIENT_ID", env.entraClientId],
    ["ENTRA_CLIENT_SECRET", env.entraClientSecret],
    ["BC_SCOPE", env.bcScope]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Falta configuración OAuth para Business Central: ${missing.join(", ")}`);
  }

  if (isPlaceholderSecret(env.entraClientSecret)) {
    throw new Error("ENTRA_CLIENT_SECRET contiene un valor de ejemplo. Crea un client secret real en Azure y configuralo como variable de usuario, variable del hosting o en .env.local.");
  }
}

export async function getBusinessCentralAccessToken() {
  if (cache && cache.expiresAt > Date.now() + 60000) return cache.token;

  requireBusinessCentralAuthConfig();

  const tokenEndpoint = `https://login.microsoftonline.com/${env.entraTenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: env.entraClientId,
    client_secret: env.entraClientSecret,
    scope: env.bcScope,
    grant_type: "client_credentials"
  });

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth BC error ${res.status}: ${text}`);
  }
  const json = await res.json();
  cache = { token: json.access_token, expiresAt: Date.now() + Number(json.expires_in || 3600) * 1000 };
  return cache.token;
}
