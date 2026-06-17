import { env } from "@/lib/config/env";

export const bcEndpoints = {
  assets: env.bcAssetsEndpoint,
  stakeholders: env.bcStakeholdersEndpoint,
  me: "tenantProfiles",
  contracts: "tenantContracts",
  contractLines: env.bcContractLinesEndpoint,
  invoices: "tenantInvoices",
  invoiceLines: "tenantInvoiceLines",
  incidents: "tenantIncidents",
  incidentRequests: "tenantIncidentRequests",
  incidentRequestAttachments: env.bcIncidentRequestAttachmentsEndpoint,
  incidentComments: "tenantIncidentComments",
  documents: env.bcDocumentsEndpoint,
  documentFiles: env.bcDocumentFilesEndpoint,
  mediaAssets: env.bcMediaAssetsEndpoint,
  mediaFiles: env.bcMediaFilesEndpoint,
  tenantPortalUsers: env.bcTenantPortalUsersEndpoint,
  tenantPortalConfigurations: env.bcTenantPortalConfigurationEndpoint
};
