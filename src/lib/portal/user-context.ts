import { getPortalSession } from "@/lib/auth/session";
import { env } from "@/lib/config/env";
import { mockMe } from "@/lib/mock/data";
import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";

type TenantProfileDto = {
  id?: string;
  no?: string;
  name?: string;
  email?: string;
};

type TenantProfileUserDto = Record<string, string | number | boolean | null | undefined>;

function getStringField(record: TenantProfileUserDto, field: string) {
  const value = record[field];
  return typeof value === "string" ? value : "";
}

function getBooleanField(record: TenantProfileUserDto, field: string) {
  const value = record[field];
  return typeof value === "boolean" ? value : false;
}

async function findTenantProfileByCustomerNo(customerNo: string) {
  const payload = await bcGet<{ value?: TenantProfileDto[] }>(
    bcEndpoints.me,
    odataQuery({
      filter: eqFilter("no", customerNo),
      top: 1
    })
  );

  return unwrap<TenantProfileDto>(payload)[0];
}

async function findTenantProfileViaProfileUser(email: string) {
  if (!env.bcProfileUsersEndpoint) return undefined;

  const emailField = env.bcProfileUserEmailField;
  const customerNoField = env.bcProfileUserCustomerNoField;
  const payload = await bcGet<{ value?: TenantProfileUserDto[] }>(
    env.bcProfileUsersEndpoint,
    odataQuery({
      filter: eqFilter(emailField, email),
      top: 1
    })
  );
  let profileUser: TenantProfileUserDto | undefined = unwrap<TenantProfileUserDto>(payload)[0];

  if (!profileUser) {
    const allUsersPayload = await bcGet<{ value?: TenantProfileUserDto[] }>(
      env.bcProfileUsersEndpoint,
      odataQuery({ top: 100 })
    );
    profileUser = unwrap<TenantProfileUserDto>(allUsersPayload).find(
      (item) => getStringField(item, emailField).toLowerCase() === email.toLowerCase()
    );
  }

  const customerNo = profileUser ? getStringField(profileUser, customerNoField) : "";
  if (!customerNo) return undefined;
  if (profileUser && getBooleanField(profileUser, "blocked")) throw new Error("PORTAL_USER_BLOCKED");
  if (profileUser && !getBooleanField(profileUser, "portalEnabled")) throw new Error("PORTAL_USER_DISABLED");

  return findTenantProfileByCustomerNo(customerNo);
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
      portalEnabled: mockMe.portalEnabled
    };
  }

  const email = session.email || "";
  const profileFromUser = email ? await findTenantProfileViaProfileUser(email) : undefined;
  const filter = email ? eqFilter("email", email) : "";

  if (!filter && !profileFromUser) throw new Error("SESSION_MISSING_USER");

  let profile: TenantProfileDto | undefined = profileFromUser;

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
    portalEnabled: true
  };
}
