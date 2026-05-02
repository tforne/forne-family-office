import { env } from "@/lib/config/env";
import { bcGetFromCustomApiForCompany } from "@/lib/bc/client";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import { resolvePortalUserContext } from "./user-context";
import type { TenantMyNoticeDto } from "@/lib/dto/tenant-my-notice.dto";

const tenantMyNoticeApi = {
  publisher: "onedata",
  group: "property",
  version: "v1.0"
} as const;

export async function getTenantMyNotices(): Promise<TenantMyNoticeDto[]> {
  if (env.useMockApi) return [];

  const user = await resolvePortalUserContext();
  const payload = await bcGetFromCustomApiForCompany<{ value?: TenantMyNoticeDto[] }>(
    {
      companyId: user.bcCompanyId,
      companyName: user.bcCompanyName
    },
    tenantMyNoticeApi,
    "tenantMyNotices",
    odataQuery({
      filter: eqFilter("customerNo", user.customerNo)
    })
  );

  return unwrap(payload)
    .filter((item) => item.showInPortal !== false && item.portalVisible !== false && item.isActive !== false)
    .sort((left, right) => {
      const leftTime = left.publishFrom ? new Date(left.publishFrom).getTime() : 0;
      const rightTime = right.publishFrom ? new Date(right.publishFrom).getTime() : 0;
      return rightTime - leftTime;
    });
}
