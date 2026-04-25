import { env } from "@/lib/config/env";
import { assertClientSecretLooksValid, explainInvalidClientSecret } from "@/lib/auth/client-secret";

let graphTokenCache: { token: string; expiresAt: number } | null = null;

function requireGraphConfig() {
  const missing = [
    ["ENTRA_TENANT_ID", env.entraTenantId],
    ["ENTRA_CLIENT_ID", env.entraClientId],
    ["ENTRA_CLIENT_SECRET", env.entraClientSecret],
    ["GRAPH_SCOPE", env.graphScope]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Falta configuración de Microsoft Graph: ${missing.join(", ")}`);
  }

  assertClientSecretLooksValid(env.entraClientSecret, "ENTRA_CLIENT_SECRET");
}

async function getGraphAccessToken() {
  if (graphTokenCache && graphTokenCache.expiresAt > Date.now() + 60000) {
    return graphTokenCache.token;
  }

  requireGraphConfig();

  const tokenEndpoint = `https://login.microsoftonline.com/${env.entraTenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: env.entraClientId,
    client_secret: env.entraClientSecret,
    scope: env.graphScope,
    grant_type: "client_credentials"
  });

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(explainInvalidClientSecret(res.status, text, env.entraClientId, "ENTRA_CLIENT_SECRET") || `OAuth Graph error ${res.status}: ${text}`);
  }

  const json = await res.json();
  graphTokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + Number(json.expires_in || 3600) * 1000
  };

  return graphTokenCache.token;
}

export type InvitePortalUserInput = {
  email: string;
  displayName?: string;
};

export type InvitedPortalUser = {
  externalUserId: string;
  email: string;
  inviteRedeemUrl?: string;
};

export async function invitePortalUser(input: InvitePortalUserInput): Promise<InvitedPortalUser> {
  if (env.useMockApi) {
    return {
      externalUserId: `mock-${input.email}`,
      email: input.email,
      inviteRedeemUrl: env.graphInviteRedirectUrl
    };
  }

  const token = await getGraphAccessToken();
  const res = await fetch("https://graph.microsoft.com/v1.0/invitations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      invitedUserEmailAddress: input.email,
      invitedUserDisplayName: input.displayName || input.email,
      inviteRedirectUrl: env.graphInviteRedirectUrl,
      sendInvitationMessage: true
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft Graph invitation error ${res.status}: ${text}`);
  }

  const payload = await res.json();
  const externalUserId = payload.invitedUser?.id || payload.invitedUser?.userPrincipalName || "";

  if (!externalUserId) {
    throw new Error("Microsoft Graph no devolvió identificador del usuario invitado.");
  }

  return {
    externalUserId,
    email: input.email,
    inviteRedeemUrl: payload.inviteRedeemUrl
  };
}
