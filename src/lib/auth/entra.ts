import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { env } from "@/lib/config/env";

export async function validateEntraIdToken(idToken: string) {
  if (!env.entraClientId || !env.entraIssuer || !env.entraAuthority) {
    throw new Error("Falta configuración de Entra.");
  }

  const configRes = await fetch(`${env.entraAuthority}/v2.0/.well-known/openid-configuration`, { cache: "no-store" });
  if (!configRes.ok) throw new Error("No se pudo obtener la configuración OIDC.");
  const config = await configRes.json();

  if (!config.jwks_uri || typeof config.jwks_uri !== "string") {
    throw new Error("jwks_uri is missing from OIDC configuration");
  }

  let jwksUri: URL;
  try {
    jwksUri = new URL(config.jwks_uri);
  } catch (error) {
    throw new Error(`Invalid jwks_uri in OIDC configuration: ${config.jwks_uri}`);
  }

  const jwks = createRemoteJWKSet(jwksUri);
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: env.entraIssuer,
    audience: env.entraClientId
  });

  return {
    email: typeof payload.email === "string" ? payload.email : (typeof payload.preferred_username === "string" ? payload.preferred_username : ""),
    externalUserId: typeof payload.oid === "string" ? payload.oid : (typeof payload.sub === "string" ? payload.sub : "")
  };
}
