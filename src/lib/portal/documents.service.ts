import { env } from "@/lib/config/env";
import { mockDocuments } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { DocumentDto } from "@/lib/dto/document.dto";

export async function getDocuments(): Promise<DocumentDto[]> {
  if (env.useMockApi) return mockDocuments;
  const user = await resolvePortalUserContext();
  const payload = await bcGetForCompany<{ value?: DocumentDto[] }>(
    { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
    bcEndpoints.documents,
    odataQuery({
      filter: eqFilter("sourceNo", user.customerNo),
      orderBy: "issueDate desc"
    })
  );
  return unwrap(payload);
}
