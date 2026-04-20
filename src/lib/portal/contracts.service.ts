import { env } from "@/lib/config/env";
import { mockContracts } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { ContractDto } from "@/lib/dto/contract.dto";

export async function getContracts(): Promise<ContractDto[]> {
  if (env.useMockApi) return mockContracts;
  const user = await resolvePortalUserContext();
  const payload = await bcGet<{ value?: ContractDto[] }>(
    bcEndpoints.contracts,
    odataQuery({
      filter: eqFilter("customerNo", user.customerNo),
      orderBy: "contractNo desc"
    })
  );
  return unwrap(payload);
}
