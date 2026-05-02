import { env } from "@/lib/config/env";
import { bcPatchCustomApiForCompany } from "@/lib/bc/client";
import { resolvePortalUserContext } from "./user-context";

const tenantMyNoticeApi = {
  publisher: "onedata",
  group: "property",
  version: "v1.0"
} as const;

export async function markTenantMyNoticeAsRead(noticeId: string, lineNo: number) {
  if (env.useMockApi) return { ok: true };

  const user = await resolvePortalUserContext();
  const company = {
    companyId: user.bcCompanyId,
    companyName: user.bcCompanyName
  };
  const body = {
    readInPortal: true,
    readDateTime: new Date().toISOString()
  };
  const paths = [
    `tenantMyNotices(noticeId=${noticeId},lineNo=${lineNo})`,
    `tenantMyNotices(${noticeId},${lineNo})`
  ];

  let lastError: unknown;

  for (const path of paths) {
    try {
      return await bcPatchCustomApiForCompany(company, tenantMyNoticeApi, path, body);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No se pudo marcar el aviso como leído.");
}
