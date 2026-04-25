import { readServerEnv } from "@/lib/config/server-env";

function normalizeTenantId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const lastSegment = url.pathname.split("/").filter(Boolean).at(-1);
    return lastSegment || trimmed;
  } catch {
    return trimmed;
  }
}

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

export const env = {
  useMockApi: readServerEnv("USE_MOCK_API") !== "false",
  useDemoLogin: readServerEnv("USE_DEMO_LOGIN") !== "false",
  appBaseUrl: normalizeUrl(readServerEnv("APP_BASE_URL") || "http://localhost:3000"),
  entraTenantId: readServerEnv("ENTRA_TENANT_ID"),
  entraClientId: readServerEnv("ENTRA_CLIENT_ID"),
  entraClientSecret: readServerEnv("ENTRA_CLIENT_SECRET"),
  entraAuthority:
    readServerEnv("ENTRA_AUTHORITY") ||
    (readServerEnv("ENTRA_TENANT_ID") ? `https://login.microsoftonline.com/${readServerEnv("ENTRA_TENANT_ID")}` : ""),
  entraIssuer:
    readServerEnv("ENTRA_ISSUER") ||
    (readServerEnv("ENTRA_AUTHORITY")
      ? `${normalizeUrl(readServerEnv("ENTRA_AUTHORITY"))}/v2.0`
      : readServerEnv("ENTRA_TENANT_ID")
      ? `https://login.microsoftonline.com/${readServerEnv("ENTRA_TENANT_ID")}/v2.0`
      : ""),
  entraRedirectUri:
    readServerEnv("ENTRA_REDIRECT_URI") || `${normalizeUrl(readServerEnv("APP_BASE_URL") || "http://localhost:3000")}/api/auth/callback`,
  graphScope: readServerEnv("GRAPH_SCOPE") || "https://graph.microsoft.com/.default",
  graphInviteRedirectUrl:
    readServerEnv("GRAPH_INVITE_REDIRECT_URL") || `${normalizeUrl(readServerEnv("APP_BASE_URL") || "http://localhost:3000")}/login`,
  bcBaseUrl: readServerEnv("BC_BASE_URL"),
  bcTenantId: normalizeTenantId(readServerEnv("BC_TENANT_ID") || readServerEnv("ENTRA_TENANT_ID") || ""),
  bcEnvironment: readServerEnv("BC_ENVIRONMENT"),
  bcCompanyId: readServerEnv("BC_COMPANY_ID"),
  bcCompanyName: readServerEnv("BC_COMPANY_NAME"),
  bcScope: readServerEnv("BC_SCOPE"),
  bcApiPublisher: readServerEnv("BC_API_PUBLISHER") || "onedata",
  bcApiGroup: readServerEnv("BC_API_GROUP") || "tenantportal",
  bcApiVersion: readServerEnv("BC_API_VERSION") || "v1.0",
  bcCreateIncidentsEndpoint: readServerEnv("BC_CREATE_INCIDENTS_ENDPOINT"),
  bcIncidentCommentsEndpoint: readServerEnv("BC_INCIDENT_COMMENTS_ENDPOINT") || "tenantIncidentComments",
  bcProfileUsersEndpoint: readServerEnv("BC_PROFILE_USERS_ENDPOINT"),
  bcProfileUserEmailField: readServerEnv("BC_PROFILE_USER_EMAIL_FIELD") || "email",
  bcProfileUserCustomerNoField: readServerEnv("BC_PROFILE_USER_CUSTOMER_NO_FIELD") || "customerNo",
  bcProfileUserExternalUserIdField: readServerEnv("BC_PROFILE_USER_EXTERNAL_USER_ID_FIELD") || "externalUserId",
  bcTenantPortalUsersEndpoint: readServerEnv("BC_TENANT_PORTAL_USERS_ENDPOINT") || "tenantPortalUsers",
  portalAdminEmails: readServerEnv("PORTAL_ADMIN_EMAILS")
};
