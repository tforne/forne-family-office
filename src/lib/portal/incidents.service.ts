import { env } from "@/lib/config/env";
import { mockIncidents } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, orFilters, odataQuery, unwrap } from "@/lib/bc/odata";
import type { IncidentDto } from "@/lib/dto/incident.dto";

export async function getIncidents(): Promise<IncidentDto[]> {
  if (env.useMockApi) return mockIncidents;
  const user = await resolvePortalUserContext();
  const filter = orFilters(
    eqFilter("contactEmail", user.email),
    eqFilter("contactEmail", user.customerNo)
  );

  const payload = await bcGet<{ value?: IncidentDto[] }>(
    bcEndpoints.incidents,
    odataQuery({
      filter,
      orderBy: "incidentDate desc"
    })
  );
  return unwrap(payload);
}
