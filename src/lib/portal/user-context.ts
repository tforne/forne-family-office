import { getPortalSession } from "@/lib/auth/session";
import { env } from "@/lib/config/env";
import { mockMe } from "@/lib/mock/data";
import { bcGet, bcGetForCompany, type BusinessCentralCompanyRef } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";

type TenantProfileDto = {
  id?: string;
  no?: string;
  name?: string;
  email?: string;
};

type TenantProfileUserDto = Record<string, string | number | boolean | null | undefined>;
type ResolvedProfileUser = {
  profile: TenantProfileDto;
  company: BusinessCentralCompanyRef;
};

function getStringField(record: TenantProfileUserDto, field: string) {
  const value = record[field];
  return typeof value === "string" ? value : "";
}

function getBooleanField(record: TenantProfileUserDto, field: string) {
  const value = record[field];
  return typeof value === "boolean" ? value : false;
}

function companyFromProfileUser(profileUser?: TenantProfileUserDto): BusinessCentralCompanyRef {
  if (!profileUser) return {};

  return {
    companyId: getStringField(profileUser, "bcCompanyId") || getStringField(profileUser, "companyId"),
    companyName:
      getStringField(profileUser, "bcCompanyName") ||
      getStringField(profileUser, "companyName") ||
      getStringField(profileUser, "company")
  };
}

function hasCompanyRef(company: BusinessCentralCompanyRef) {
  return Boolean(company.companyId || company.companyName);
}

async function findTenantProfileByCustomerNo(customerNo: string, company: BusinessCentralCompanyRef = {}) {
  const query = odataQuery({
    filter: eqFilter("no", customerNo),
    top: 1
  });
  const payload = hasCompanyRef(company)
    ? await bcGetForCompany<{ value?: TenantProfileDto[] }>(company, bcEndpoints.me, query)
    : await bcGet<{ value?: TenantProfileDto[] }>(bcEndpoints.me, query);

  return unwrap<TenantProfileDto>(payload)[0];
}

async function findProfileUserByField(field: string, value: string) {
  if (!env.bcProfileUsersEndpoint) return undefined;

  const payload = await bcGet<{ value?: TenantProfileUserDto[] }>(
    env.bcProfileUsersEndpoint,
    odataQuery({
      filter: eqFilter(field, value),
      top: 1
    })
  );

  return unwrap<TenantProfileUserDto>(payload)[0];
}

async function findProfileUserFallback(field: string, value: string) {
  if (!env.bcProfileUsersEndpoint) return undefined;

  const allUsersPayload = await bcGet<{ value?: TenantProfileUserDto[] }>(
    env.bcProfileUsersEndpoint,
    odataQuery({ top: 100 })
  );

  return unwrap<TenantProfileUserDto>(allUsersPayload).find(
    (item) => getStringField(item, field).toLowerCase() === value.toLowerCase()
  );
}

async function findTenantProfileViaProfileUser(email: string, externalUserId: string): Promise<ResolvedProfileUser | undefined> {
  if (!env.bcProfileUsersEndpoint) return undefined;

  const emailField = env.bcProfileUserEmailField;
  const externalUserIdField = env.bcProfileUserExternalUserIdField;
  const customerNoField = env.bcProfileUserCustomerNoField;
  let profileUser: TenantProfileUserDto | undefined;

  if (externalUserId) {
    profileUser =
      (await findProfileUserByField(externalUserIdField, externalUserId)) ||
      (await findProfileUserFallback(externalUserIdField, externalUserId));
  }

  if (!profileUser && email) {
    profileUser =
      (await findProfileUserByField(emailField, email)) ||
      (await findProfileUserFallback(emailField, email));
  }

  const customerNo = profileUser ? getStringField(profileUser, customerNoField) : "";
  if (!customerNo) return undefined;
  if (profileUser && getBooleanField(profileUser, "blocked")) throw new Error("PORTAL_USER_BLOCKED");
  if (profileUser && !getBooleanField(profileUser, "portalEnabled")) throw new Error("PORTAL_USER_DISABLED");

  const company = companyFromProfileUser(profileUser);
  const profile = await findTenantProfileByCustomerNo(customerNo, company);
  return profile ? { profile, company } : undefined;
}

export async function resolvePortalUserContext() {
  const session = await getPortalSession();
  if (!session.isAuthenticated) throw new Error("UNAUTHORIZED");

  if (env.useMockApi) {
    return {
      email: session.email || mockMe.email,
      externalUserId: session.externalUserId || mockMe.userId,
      customerNo: mockMe.customerNo,
      customerName: mockMe.customerName,
      portalEnabled: mockMe.portalEnabled,
      bcCompanyId: env.bcCompanyId,
      bcCompanyName: env.bcCompanyName
    };
  }

  const email = session.email || "";
  const externalUserId = session.externalUserId || "";
  const profileFromUser = email || externalUserId ? await findTenantProfileViaProfileUser(email, externalUserId) : undefined;
  const filter = email ? eqFilter("email", email) : "";

  if (!filter && !profileFromUser) throw new Error("SESSION_MISSING_USER");

  let profile: TenantProfileDto | undefined = profileFromUser?.profile;
  const company = profileFromUser?.company || {};

  if (!profile && filter) {
    const payload = await bcGet<{ value?: TenantProfileDto[] }>(
      bcEndpoints.me,
      odataQuery({
        filter,
        top: 1
      })
    );
    profile = unwrap<TenantProfileDto>(payload)[0];
  }

  if (!profile && email) {
    const allProfilesPayload = await bcGet<{ value?: TenantProfileDto[] }>(
      bcEndpoints.me,
      odataQuery({ top: 100 })
    );
    profile = unwrap<TenantProfileDto>(allProfilesPayload).find(
      (item) => item.email?.toLowerCase() === email.toLowerCase()
    );
  }

  if (!profile) throw new Error(`PORTAL_USER_NOT_FOUND: ${session.email}`);
  if (!profile.no) throw new Error("PORTAL_USER_MISSING_CUSTOMER");

  return {
    email: profile.email || session.email || "",
    externalUserId: session.externalUserId || profile.id || "",
    customerNo: profile.no,
    customerName: profile.name || profile.no,
    portalEnabled: true,
    bcCompanyId: company.companyId || env.bcCompanyId,
    bcCompanyName: company.companyName || env.bcCompanyName
  };
}
