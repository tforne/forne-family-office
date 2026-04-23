import { env } from "@/lib/config/env";
import { bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import { mockIncidents } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import type { IncidentRequestDto } from "@/lib/dto/incident-request.dto";

export async function getIncidentRequests(): Promise<IncidentRequestDto[]> {
  if (env.useMockApi) {
    return mockIncidents.map((incident, index) => ({
      id: incident.id,
      entryNo: index + 1,
      requestId: incident.incidentId,
      incidentDate: incident.incidentDate,
      title: incident.title,
      description: incident.description,
      caseType: incident.caseType,
      priority: incident.priority,
      contractNo: incident.contractNo,
      fixedRealEstateNo: incident.fixedRealEstateNo,
      refDescription: incident.refDescription,
      contactName: incident.contactName,
      contactPhoneNo: incident.contactPhoneNo,
      contactEmail: incident.contactEmail,
      portalUserEmail: incident.contactEmail,
      source: "PORTAL",
      status: incident.stateCode,
      createdIncidentNo: incident.incidentId,
      errorMessage: null,
      createdAt: incident.createdOn,
      processedAt: incident.modifiedOn
    }));
  }

  const user = await resolvePortalUserContext();
  const readByField = async (field: "contactEmail" | "portalUserEmail") => {
    const payload = await bcGetForCompany<{ value?: IncidentRequestDto[] }>(
      { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
      bcEndpoints.incidentRequests,
      odataQuery({
        filter: eqFilter(field, user.email),
        orderBy: "createdAt desc"
      })
    );

    return unwrap(payload);
  };

  const [byContactEmail, byPortalUserEmail] = await Promise.all([
    readByField("contactEmail"),
    readByField("portalUserEmail")
  ]);
  const unique = new Map<string, IncidentRequestDto>();

  for (const request of [...byContactEmail, ...byPortalUserEmail]) {
    unique.set(request.id || request.requestId || String(request.entryNo), request);
  }

  return Array.from(unique.values()).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}
