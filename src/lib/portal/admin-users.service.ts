import { env } from "@/lib/config/env";
import { bcGet, bcPatch, bcPost } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, orFilters, unwrap } from "@/lib/bc/odata";
import type { CreatePortalUserInput, PortalUserDto } from "@/lib/dto/portal-user.dto";

type PortalUserPayload = { value?: PortalUserDto[] };

const mockPortalUsers: PortalUserDto[] = [
  {
    id: "demo-portal-user",
    entryNo: 1,
    externalUserId: "demo-user-001",
    email: "tenant@example.com",
    customerNo: "C00001",
    portalEnabled: true,
    blocked: false,
    lastLoginDateTime: new Date().toISOString(),
    languageCode: "ESP",
    createdAt: new Date().toISOString(),
    bcCompanyName: "Demo",
    invitationStatus: "Accepted",
    invitationSentAt: new Date().toISOString(),
    invitationAcceptedAt: new Date().toISOString(),
    invitationExpiresAt: "",
    lastInvitationError: "",
    lastSyncStatus: "Ok",
    lastSyncError: "",
    updatedAt: new Date().toISOString(),
    updatedBy: "demo"
  }
];

function endpoint() {
  return env.bcTenantPortalUsersEndpoint || bcEndpoints.tenantPortalUsers;
}

function normalizePortalUser(user: Partial<PortalUserDto>): PortalUserDto {
  return {
    id: user.id || "",
    entryNo: user.entryNo,
    externalUserId: user.externalUserId || "",
    email: user.email || "",
    customerNo: user.customerNo || "",
    portalEnabled: Boolean(user.portalEnabled),
    blocked: Boolean(user.blocked),
    lastLoginDateTime: user.lastLoginDateTime || "",
    languageCode: user.languageCode || "",
    createdAt: user.createdAt || "",
    bcCompanyName: user.bcCompanyName || "",
    invitationStatus: user.invitationStatus || "",
    invitationSentAt: user.invitationSentAt || "",
    invitationAcceptedAt: user.invitationAcceptedAt || "",
    invitationExpiresAt: user.invitationExpiresAt || "",
    lastInvitationError: user.lastInvitationError || "",
    lastSyncStatus: user.lastSyncStatus || "",
    lastSyncError: user.lastSyncError || "",
    updatedAt: user.updatedAt || "",
    updatedBy: user.updatedBy || ""
  };
}

export async function listPortalUsers(search?: string): Promise<PortalUserDto[]> {
  if (env.useMockApi) return mockPortalUsers;

  const trimmed = search?.trim();
  const filter = trimmed
    ? orFilters(
        eqFilter("email", trimmed),
        eqFilter("customerNo", trimmed),
        eqFilter("externalUserId", trimmed)
      )
    : undefined;

  const payload = await bcGet<PortalUserPayload>(
    endpoint(),
    odataQuery({
      filter,
      orderBy: "createdAt desc",
      top: 100
    })
  );

  return unwrap(payload).map(normalizePortalUser);
}

export async function createPortalUser(input: CreatePortalUserInput) {
  if (env.useMockApi) return normalizePortalUser({ ...mockPortalUsers[0], ...input });

  return bcPost<PortalUserDto>(endpoint(), {
    externalUserId: input.externalUserId,
    email: input.email,
    customerNo: input.customerNo,
    portalEnabled: true,
    blocked: false,
    languageCode: input.languageCode || "",
    bcCompanyName: input.bcCompanyName || env.bcCompanyName,
    invitationStatus: input.invitationStatus || "Pending",
    invitationSentAt: input.invitationSentAt || "",
    lastInvitationError: input.lastInvitationError || "",
    lastSyncStatus: input.lastSyncStatus || "Ok",
    lastSyncError: input.lastSyncError || ""
  });
}

export async function updatePortalUser(id: string, patch: Partial<PortalUserDto>) {
  if (env.useMockApi) return normalizePortalUser({ ...mockPortalUsers[0], ...patch, id });

  return bcPatch<PortalUserDto>(`${endpoint()}(${id})`, patch);
}
