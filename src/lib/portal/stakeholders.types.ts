export interface PortalStakeholder {
  entryNo: number;
  propertyNo: string;
  buildingNo?: string;
  stakeholderNo: string;
  stakeholderName: string;
  category: string;
  serviceTitle: string;
  portalDescription?: string;
  aiDescription?: string;
  aiKeywords?: string;
  whatsappNo?: string;
  whatsappHref?: string;
  bookingUrl?: string;
  tenantProfileFilter?: string;
  availableForAI: boolean;
  priorityScore?: number;
  defaultForCategory?: boolean;
  notes?: string;
}
