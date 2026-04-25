import { assertClientSecretLooksValid, explainInvalidClientSecret } from "@/lib/auth/client-secret";
import { readServerEnv } from "@/lib/config/server-env";

const defaultMailbox = "office@forne.family";

function required(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`Falta configuración de correo: ${name}`);
  }

  return value.trim();
}

function mailConfig() {
  const graphClientSecret = readServerEnv("GRAPH_CLIENT_SECRET");
  const entraClientSecret = readServerEnv("ENTRA_CLIENT_SECRET");
  const config = {
    tenantId: required("GRAPH_TENANT_ID o ENTRA_TENANT_ID", readServerEnv("GRAPH_TENANT_ID") || readServerEnv("ENTRA_TENANT_ID")),
    clientId: required("GRAPH_CLIENT_ID o ENTRA_CLIENT_ID", readServerEnv("GRAPH_CLIENT_ID") || readServerEnv("ENTRA_CLIENT_ID")),
    clientSecret: required("GRAPH_CLIENT_SECRET o ENTRA_CLIENT_SECRET", graphClientSecret || entraClientSecret),
    fromUser: (readServerEnv("MAIL_FROM_USER") || defaultMailbox).trim(),
    to: (readServerEnv("MAIL_TO") || defaultMailbox).trim()
  };

  assertClientSecretLooksValid(config.clientSecret, graphClientSecret ? "GRAPH_CLIENT_SECRET" : "ENTRA_CLIENT_SECRET");

  return config;
}

async function getGraphAccessToken() {
  const config = mailConfig();
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const res = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      explainInvalidClientSecret(
        res.status,
        text,
        config.clientId,
        readServerEnv("GRAPH_CLIENT_SECRET") ? "GRAPH_CLIENT_SECRET" : "ENTRA_CLIENT_SECRET"
      ) || `OAuth Graph error ${res.status}: ${text}`
    );
  }

  const payload = await res.json();
  return String(payload.access_token || "");
}

export async function sendIncidentEmail({
  subject,
  text
}: {
  subject: string;
  text: string;
}) {
  const config = mailConfig();
  const token = await getGraphAccessToken();

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.fromUser)}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: "Text",
          content: text
        },
        toRecipients: [
          {
            emailAddress: {
              address: config.to
            }
          }
        ]
      },
      saveToSentItems: true
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph sendMail error ${res.status}: ${text}`);
  }
}
