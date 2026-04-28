import type { MeDto, ContractDto, InvoiceDto, IncidentDto, DocumentDto, InvoiceLineDto } from "@/lib/dto";

export const mockMe: MeDto = {
  userId: "external-demo-user",
  email: "tenant@example.com",
  customerNo: "C0001",
  customerName: "Cliente Demo",
  portalEnabled: true,
  bcCompanyId: "demo-company-id",
  bcCompanyName: "Demo"
};

export const mockContracts: ContractDto[] = [
  {
    id: "1",
    contractNo: "CONT-0001",
    description: "Contrato vivienda Barcelona",
    status: "Signed",
    customerNo: "C0001",
    customerName: "Cliente Demo",
    fixedRealEstateNo: "RE-001",
    fixedRealEstateDescription: "Vivienda Barcelona",
    startingDate: null,
    expirationDate: null,
    contractDate: null,
    invoicePeriod: null,
    nextInvoiceDate: null,
    annualAmount: null,
    amountPerPeriod: null,
    amountRentalDeposit: null,
    email: "tenant@example.com",
    phoneNo: null
  }
];

export const mockInvoices: InvoiceDto[] = [
  {
    id: "1",
    invoiceNo: "FV-2026-001",
    billToCustomerNo: "C0001",
    sellToCustomerNo: null,
    postingDate: null,
    documentDate: null,
    dueDate: null,
    currencyCode: null,
    amountIncludingVat: 1000,
    remainingAmount: 0
  }
];

export const mockInvoiceLines: InvoiceLineDto[] = [
  {
    id: "1-1",
    invoiceId: "1",
    invoiceNo: "FV-2026-001",
    lineNo: 10000,
    description: "Renta mensual vivienda",
    quantity: 1,
    unitPrice: 850,
    amount: 850,
    amountIncludingVat: 850,
    vatPercent: 0,
    currencyCode: "EUR"
  },
  {
    id: "1-2",
    invoiceId: "1",
    invoiceNo: "FV-2026-001",
    lineNo: 20000,
    description: "Gastos repercutidos",
    quantity: 1,
    unitPrice: 150,
    amount: 150,
    amountIncludingVat: 150,
    vatPercent: 0,
    currencyCode: "EUR"
  }
];

export const mockIncidents: IncidentDto[] = [
  {
    id: "1",
    incidentId: "INC-001",
    incidentDate: null,
    title: "Revisión de persiana",
    description: null,
    refDescription: null,
    caseType: null,
    priority: null,
    stateCode: "Active",
    statusCode: null,
    contractNo: null,
    fixedRealEstateNo: null,
    contactName: "Cliente Demo",
    contactPhoneNo: null,
    contactEmail: "tenant@example.com",
    createdOn: null,
    modifiedOn: null,
    followupBy: null,
    expectedResolutionDate: null,
    resolutionDate: null,
    insurancePolicyNo: "SEG-DEMO-001",
    insurancePolicyDescription: "Seguro multirriesgo vivienda",
    notifyInsurance: true,
    insuranceNotified: false,
    insuranceNotificationDate: null,
    insuranceClaimNo: null,
    insuranceStatus: "Pendiente",
    insuranceEmail: "seguro@example.com",
    insurancePhoneNo: null,
    insuranceNotes: "Pendiente de confirmar apertura de siniestro."
  }
];

export const mockDocuments: DocumentDto[] = [
  {
    id: "1",
    no: "DOC-001",
    description: "Contrato firmado",
    documentTypeCode: null,
    category: null,
    status: "Active",
    reviewStatus: null,
    confidentialLevel: null,
    riskLevel: null,
    sourceTableId: null,
    sourceNo: "C0001",
    attachmentFileName: null,
    fileUrl: null,
    issueDate: null,
    expirationDate: null,
    renewalDate: null,
    lastReviewDate: null,
    nextReviewDate: null,
    notes: null,
    hasAttachment: false,
    hasLinks: false,
    missingMandatoryData: false,
    companyName: null
  }
];
