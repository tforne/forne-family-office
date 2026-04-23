import { env } from "@/lib/config/env";
import { getBusinessCentralAccessToken } from "./auth";

type CompanyPayload = {
  value?: Array<{
    id?: string;
    name?: string;
    displayName?: string;
  }>;
};

let companyIdCache: string | null = null;
const companyIdCacheByKey = new Map<string, string>();

export type BusinessCentralCompanyRef = {
  companyId?: string;
  companyName?: string;
};

function requireBusinessCentralBaseConfig() {
  const missing = [
    ["BC_BASE_URL", env.bcBaseUrl],
    ["BC_TENANT_ID", env.bcTenantId],
    ["BC_ENVIRONMENT", env.bcEnvironment],
    ["BC_API_PUBLISHER", env.bcApiPublisher],
    ["BC_API_GROUP", env.bcApiGroup],
    ["BC_API_VERSION", env.bcApiVersion]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Falta configuración de Business Central: ${missing.join(", ")}`);
  }
}

function requireBusinessCentralConfig() {
  requireBusinessCentralBaseConfig();
  if (!env.bcCompanyId && !env.bcCompanyName) {
    throw new Error("Falta configuración de Business Central: BC_COMPANY_ID o BC_COMPANY_NAME");
  }
}

function isGuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function baseApiUrl() {
  return `${env.bcBaseUrl}/${env.bcTenantId}/${env.bcEnvironment}/api`;
}

async function bcFetchJson<T>(url: string): Promise<T> {
  const token = await getBusinessCentralAccessToken();

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Business Central error ${res.status} (${url}): ${text}`);
  }

  return res.json();
}

async function bcSendJson<T>(url: string, method: "POST" | "PATCH", body: unknown): Promise<T> {
  const token = await getBusinessCentralAccessToken();

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(method === "PATCH" ? { "If-Match": "*" } : {})
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Business Central error ${res.status} (${url}): ${text}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

async function bcFetchText(url: string): Promise<string> {
  const token = await getBusinessCentralAccessToken();

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/xml,text/xml,text/plain" },
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Business Central error ${res.status} (${url}): ${text}`);
  }

  return res.text();
}

export function getBusinessCentralCompaniesUrl() {
  return `${baseApiUrl()}/v2.0/companies`;
}

export function getBusinessCentralCustomApiUrl() {
  return `${baseApiUrl()}/${env.bcApiPublisher}/${env.bcApiGroup}/${env.bcApiVersion}`;
}

export async function getBusinessCentralMetadata() {
  requireBusinessCentralBaseConfig();
  return bcFetchText(`${getBusinessCentralCustomApiUrl()}/$metadata`);
}

export async function getBusinessCentralCompanies() {
  requireBusinessCentralBaseConfig();
  const payload = await bcFetchJson<CompanyPayload>(getBusinessCentralCompaniesUrl());
  return payload.value || [];
}

async function resolveCompanyId(company?: BusinessCentralCompanyRef) {
  const configuredCompanyId = company?.companyId?.trim() || env.bcCompanyId;
  const configuredCompanyName = company?.companyName?.trim() || env.bcCompanyName;
  const configured = (configuredCompanyName || configuredCompanyId).trim();

  if (!company && companyIdCache) return companyIdCache;
  if (!configured) throw new Error("Falta configuración de Business Central: BC_COMPANY_ID o BC_COMPANY_NAME");
  if (isGuid(configuredCompanyId)) {
    if (!company) companyIdCache = configuredCompanyId;
    return configuredCompanyId;
  }

  const cacheKey = configured.toLowerCase();
  const cached = companyIdCacheByKey.get(cacheKey);
  if (cached) return cached;

  const companies = await getBusinessCentralCompanies();
  const configuredLower = configured.toLowerCase();
  const match = companies.find((companyItem) => {
    const id = companyItem.id?.toLowerCase();
    const name = companyItem.name?.toLowerCase();
    const displayName = companyItem.displayName?.toLowerCase();
    return configuredLower === id || configuredLower === name || configuredLower === displayName;
  });

  if (!match?.id) {
    const available = companies
      .map((companyItem) => companyItem.displayName || companyItem.name || companyItem.id)
      .filter(Boolean)
      .join(", ");
    throw new Error(`No se encontró la compañía de Business Central "${configured}". Compañías disponibles: ${available || "ninguna"}`);
  }

  companyIdCacheByKey.set(cacheKey, match.id);
  if (!company) companyIdCache = match.id;
  return match.id;
}

async function resolveDefaultCompanyId() {
  if (companyIdCache) return companyIdCache;

  if (env.bcCompanyId && isGuid(env.bcCompanyId)) {
    companyIdCache = env.bcCompanyId;
    return companyIdCache;
  }

  const companies = await getBusinessCentralCompanies();
  const configured = (env.bcCompanyName || env.bcCompanyId).trim().toLowerCase();
  const match = companies.find((company) => {
    const id = company.id?.toLowerCase();
    const name = company.name?.toLowerCase();
    const displayName = company.displayName?.toLowerCase();
    return configured === id || configured === name || configured === displayName;
  });

  if (!match?.id) {
    const available = companies
      .map((company) => company.displayName || company.name || company.id)
      .filter(Boolean)
      .join(", ");
    throw new Error(`No se encontró la compañía de Business Central "${env.bcCompanyName || env.bcCompanyId}". Compañías disponibles: ${available || "ninguna"}`);
  }

  companyIdCache = match.id;
  return companyIdCache;
}

export async function bcGet<T = unknown>(path: string, query?: string): Promise<T> {
  requireBusinessCentralConfig();

  const companyId = await resolveDefaultCompanyId();
  const url = `${baseApiUrl()}/${env.bcApiPublisher}/${env.bcApiGroup}/${env.bcApiVersion}/companies(${companyId})/${path}${query ? `?${query}` : ""}`;

  return bcFetchJson<T>(url);
}

export async function bcGetForCompany<T = unknown>(company: BusinessCentralCompanyRef, path: string, query?: string): Promise<T> {
  requireBusinessCentralBaseConfig();

  const companyId = await resolveCompanyId(company);
  const url = `${baseApiUrl()}/${env.bcApiPublisher}/${env.bcApiGroup}/${env.bcApiVersion}/companies(${companyId})/${path}${query ? `?${query}` : ""}`;

  return bcFetchJson<T>(url);
}

export async function bcPost<T = unknown>(path: string, body: unknown): Promise<T> {
  requireBusinessCentralConfig();

  const companyId = await resolveDefaultCompanyId();
  const url = `${baseApiUrl()}/${env.bcApiPublisher}/${env.bcApiGroup}/${env.bcApiVersion}/companies(${companyId})/${path}`;

  return bcSendJson<T>(url, "POST", body);
}

export async function bcPostForCompany<T = unknown>(company: BusinessCentralCompanyRef, path: string, body: unknown): Promise<T> {
  requireBusinessCentralBaseConfig();

  const companyId = await resolveCompanyId(company);
  const url = `${baseApiUrl()}/${env.bcApiPublisher}/${env.bcApiGroup}/${env.bcApiVersion}/companies(${companyId})/${path}`;

  return bcSendJson<T>(url, "POST", body);
}

export async function bcPatch<T = unknown>(path: string, body: unknown): Promise<T> {
  requireBusinessCentralConfig();

  const companyId = await resolveDefaultCompanyId();
  const url = `${baseApiUrl()}/${env.bcApiPublisher}/${env.bcApiGroup}/${env.bcApiVersion}/companies(${companyId})/${path}`;

  return bcSendJson<T>(url, "PATCH", body);
}
