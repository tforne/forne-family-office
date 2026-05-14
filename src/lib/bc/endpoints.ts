import { env } from "@/lib/config/env";

export const bcEndpoints = {
  assets: env.bcAssetsEndpoint,
  me: "tenantProfiles",
  contracts: "tenantContracts",
  invoices: "tenantInvoices",
  invoiceLines: "tenantInvoiceLines",
  incidents: "tenantIncidents",
  incidentRequests: "tenantIncidentRequests",
  incidentComments: "tenantIncidentComments",
  documents: env.bcDocumentsEndpoint,
  documentFiles: env.bcDocumentFilesEndpoint,
  tenantPortalUsers: env.bcTenantPortalUsersEndpoint,
  tenantPortalConfigurations: env.bcTenantPortalConfigurationEndpoint
};
