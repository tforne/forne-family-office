import { env } from "@/lib/config/env";
import { mockMe } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import type { MeDto } from "@/lib/dto/me.dto";

export async function getMe(): Promise<MeDto> {
  if (env.useMockApi) return mockMe;
  const user = await resolvePortalUserContext();
  return {
    userId: user.externalUserId,
    email: user.email,
    customerNo: user.customerNo,
    customerName: user.customerName,
    paymentMethods: user.paymentMethods,
    portalEnabled: user.portalEnabled,
    bcCompanyId: user.bcCompanyId,
    bcCompanyName: user.bcCompanyName
  };
}
