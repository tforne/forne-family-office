export interface IncidentRequestDto {
  id: string;
  entryNo: number | null;
  requestId: string | null;
  incidentDate: string | null;
  title: string;
  description: string | null;
  caseType: string | null;
  priority: string | null;
  contractNo: string | null;
  fixedRealEstateNo: string | null;
  refDescription: string | null;
  contactName: string | null;
  contactPhoneNo: string | null;
  contactEmail: string | null;
  portalUserEmail: string | null;
  source: string | null;
  status: string | null;
  createdIncidentNo: string | null;
  errorMessage: string | null;
  createdAt: string | null;
  processedAt: string | null;
}
