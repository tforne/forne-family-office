import { env } from "@/lib/config/env";
import { bcPost } from "@/lib/bc/client";
import { resolvePortalUserContext } from "./user-context";
import type { IncidentDto } from "@/lib/dto/incident.dto";

export type CreateIncidentInput = {
  title: string;
  description: string;
  caseType?: string;
  priority?: string;
  contractNo?: string;
  fixedRealEstateNo?: string;
  refDescription?: string;
  contactPhoneNo?: string;
};

type BusinessCentralIncidentRequest = Partial<IncidentDto> & {
  requestId?: string;
  entryNo?: number;
  status?: string;
  createdIncidentNo?: string;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function createIncident(input: CreateIncidentInput): Promise<IncidentDto> {
  const user = await resolvePortalUserContext();
  const endpoint = env.bcCreateIncidentsEndpoint || "tenantIncidentRequests";
  const incidentDate = todayIsoDate();

  const payload = {
    incidentDate,
    title: input.title,
    description: input.description,
    caseType: input.caseType || "Problem",
    priority: input.priority || "Normal",
    contractNo: input.contractNo || "",
    fixedRealEstateNo: input.fixedRealEstateNo || "",
    refDescription: input.refDescription || "",
    contactName: user.customerName,
    contactPhoneNo: input.contactPhoneNo || "",
    contactEmail: user.email || user.customerNo,
    portalUserEmail: user.email || ""
  };

  if (env.useMockApi) {
    return {
      id: `mock-${Date.now()}`,
      incidentId: "Pendiente",
      incidentDate,
      title: payload.title,
      description: payload.description,
      refDescription: payload.refDescription,
      caseType: payload.caseType,
      priority: payload.priority,
      stateCode: "Active",
      statusCode: "New",
      contractNo: payload.contractNo,
      fixedRealEstateNo: payload.fixedRealEstateNo,
      contactName: payload.contactName,
      contactPhoneNo: payload.contactPhoneNo,
      contactEmail: payload.contactEmail,
      createdOn: new Date().toISOString(),
      modifiedOn: null,
      followupBy: null,
      expectedResolutionDate: null,
      resolutionDate: null
    };
  }

  const created = await bcPost<BusinessCentralIncidentRequest>(endpoint, payload);

  return {
    id: created.id || created.requestId || String(created.entryNo || ""),
    incidentId: created.incidentId || created.createdIncidentNo || created.requestId || "Pendiente",
    incidentDate: created.incidentDate || incidentDate,
    title: created.title || payload.title,
    description: created.description || payload.description,
    refDescription: created.refDescription || payload.refDescription,
    caseType: created.caseType || payload.caseType,
    priority: created.priority || payload.priority,
    stateCode: created.stateCode || created.status || "New",
    statusCode: created.statusCode || created.status || "New",
    contractNo: created.contractNo || payload.contractNo,
    fixedRealEstateNo: created.fixedRealEstateNo || payload.fixedRealEstateNo,
    contactName: created.contactName || payload.contactName,
    contactPhoneNo: created.contactPhoneNo || payload.contactPhoneNo,
    contactEmail: created.contactEmail || payload.contactEmail,
    createdOn: created.createdOn || new Date().toISOString(),
    modifiedOn: created.modifiedOn || null,
    followupBy: created.followupBy || null,
    expectedResolutionDate: created.expectedResolutionDate || null,
    resolutionDate: created.resolutionDate || null
  };
}
