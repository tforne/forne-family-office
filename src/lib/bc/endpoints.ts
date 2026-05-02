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
  documents: "tenantDocuments",
  tenantPortalUsers: env.bcTenantPortalUsersEndpoint,
  tenantPortalConfigurations: env.bcTenantPortalConfigurationEndpoint
};
