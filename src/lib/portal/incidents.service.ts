import { env } from "@/lib/config/env";
import { mockIncidents } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { isCurrentPortalAdmin } from "./admin-auth";
import { bcGet, bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { IncidentDto } from "@/lib/dto/incident.dto";

export async function getIncidents(): Promise<IncidentDto[]> {
  const isAdmin = await isCurrentPortalAdmin();

  if (env.useMockApi) {
    return isAdmin ? mockIncidents.filter((incident) => incident.stateCode === "Active") : mockIncidents;
  }

  if (isAdmin) {
    const payload = await bcGet<{ value?: IncidentDto[] }>(
      bcEndpoints.incidents,
      odataQuery({
        filter: eqFilter("stateCode", "Active"),
        orderBy: "incidentDate desc"
      })
    );

    return unwrap(payload);
  }

  const user = await resolvePortalUserContext();
  const filter = eqFilter("customerNo", user.customerNo);

  const payload = await bcGetForCompany<{ value?: IncidentDto[] }>(
    { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
    bcEndpoints.incidents,
    odataQuery({
      filter,
      orderBy: "incidentDate desc"
    })
  );
  return unwrap(payload);
}
