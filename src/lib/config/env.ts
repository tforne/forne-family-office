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
  useMockApi: process.env.USE_MOCK_API !== "false",
  useDemoLogin: process.env.USE_DEMO_LOGIN !== "false",
  appBaseUrl: normalizeUrl(process.env.APP_BASE_URL || "http://localhost:3000"),
  entraTenantId: process.env.ENTRA_TENANT_ID || "",
  entraClientId: process.env.ENTRA_CLIENT_ID || "",
  entraClientSecret: process.env.ENTRA_CLIENT_SECRET || "",
  entraAuthority:
    process.env.ENTRA_AUTHORITY ||
    (process.env.ENTRA_TENANT_ID ? `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}` : ""),
  entraIssuer:
    process.env.ENTRA_ISSUER ||
    (process.env.ENTRA_AUTHORITY
      ? `${normalizeUrl(process.env.ENTRA_AUTHORITY)}/v2.0`
      : process.env.ENTRA_TENANT_ID
      ? `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/v2.0`
      : ""),
  entraRedirectUri:
    process.env.ENTRA_REDIRECT_URI || `${normalizeUrl(process.env.APP_BASE_URL || "http://localhost:3000")}/api/auth/callback`,
  bcBaseUrl: process.env.BC_BASE_URL || "",
  bcTenantId: normalizeTenantId(process.env.BC_TENANT_ID || process.env.ENTRA_TENANT_ID || ""),
  bcEnvironment: process.env.BC_ENVIRONMENT || "",
  bcCompanyId: process.env.BC_COMPANY_ID || "",
  bcCompanyName: process.env.BC_COMPANY_NAME || "",
  bcScope: process.env.BC_SCOPE || "",
  bcApiPublisher: process.env.BC_API_PUBLISHER || "onedata",
  bcApiGroup: process.env.BC_API_GROUP || "tenantportal",
  bcApiVersion: process.env.BC_API_VERSION || "v1.0",
  bcProfileUsersEndpoint: process.env.BC_PROFILE_USERS_ENDPOINT || "",
  bcProfileUserEmailField: process.env.BC_PROFILE_USER_EMAIL_FIELD || "email",
  bcProfileUserCustomerNoField: process.env.BC_PROFILE_USER_CUSTOMER_NO_FIELD || "customerNo"
};
