import type {
  AssetDto,
  MeDto,
  ContractDto,
  ContractLineDto,
  InvoiceDto,
  IncidentDto,
  DocumentDto,
  InvoiceLineDto,
  EquipmentDto
} from "@/lib/dto";
import type { PortalStakeholder } from "@/lib/portal/stakeholders.types";

export const mockMe: MeDto = {
  userId: "external-demo-user",
  email: "tenant@example.com",
  customerNo: "C0001",
  customerName: "Cliente Demo",
  paymentMethods: ["Transferencia bancaria", "Domiciliación"],
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

export const mockAssets: AssetDto[] = [
  {
    id: "asset-1",
    number: "RE-001",
    description: "Vivienda Barcelona",
    description2: "Piso exterior con balcón",
    type: "Activo",
    assetType: "Residencial",
    status: "Alquilado",
    propertyNo: "PROP-001",
    propertyDescription: "Finca Barcelona Centro",
    address: "Calle Major, 66",
    address2: "Local 1",
    city: "Barcelona",
    postCode: "08001",
    county: "Barcelona",
    countryRegionCode: "ES",
    streetName: "Calle Major",
    streetNumber: "66",
    floor: "1ª",
    composedAddress: "Calle Major, 66, 1ª",
    googleUrl: "https://maps.google.com/?q=Calle+Major+66+Barcelona",
    yearOfConstruction: 2004,
    builtAreaM2: 92,
    commercialDescription: "Activo orientado a alquiler residencial con buena luz natural y distribución funcional.",
    cadastralReference: "1234567DF3813C0001AB",
    cadastralUrl: "https://www.sedecatastro.gob.es/",
    cadastralAssetValue: 118000,
    cadastralConstructionValue: 82300,
    totalCadastralAssetValue: 118000,
    totalCadastralConstructionValue: 82300,
    ownerName: "Forné Family Office",
    lastRentalPrice: 1000,
    minimumRentalPrice: 950,
    lastContractPrice: 1000,
    referencePriceMin: 910,
    referencePriceMax: 1080,
    salesPrice: 320000,
    minimumSalesPrice: 300000,
    managed: true,
    acquired: true,
    blocked: false,
    underMaintenance: false,
    insured: true,
    hasComments: true,
    image: null,
    lastDateModified: "2026-04-20"
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

export const mockEquipment: EquipmentDto[] = [
  {
    id: "eq-1",
    freNo: "RE-001",
    lineNo: 10000,
    quantity: 2,
    description: "Mando a distancia del garaje",
    serialNo: "GAR-2401-A",
    modelNo: "LiftMaster 2C",
    acquisitionDate: "2025-03-15",
    acquisitionCost: 85,
    equipmentWarrantyPeriod: "24 meses",
    needMaintenance: false,
    maintenanceContractNo: null
  },
  {
    id: "eq-2",
    freNo: "RE-001",
    lineNo: 20000,
    quantity: 1,
    description: "Termostato inteligente",
    serialNo: "TH-99381",
    modelNo: "Nest E",
    acquisitionDate: "2024-11-08",
    acquisitionCost: 219,
    equipmentWarrantyPeriod: "36 meses",
    needMaintenance: true,
    maintenanceContractNo: "MC-TERM-001"
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

export const mockContractLines: ContractLineDto[] = [
  {
    id: "cl-1",
    contractNo: "CONT-0001",
    lineNo: 10000,
    description: "Renta base mensual",
    quantity: 1,
    unitPrice: 750,
    amount: 750,
    amountIncludingVat: 750,
    currencyCode: "EUR"
  },
  {
    id: "cl-2",
    contractNo: "CONT-0001",
    lineNo: 20000,
    description: "Repercusión de gastos comunes",
    quantity: 1,
    unitPrice: 45,
    amount: 45,
    amountIncludingVat: 45,
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
    insuranceCompanyName: "Forne Seguros",
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
    downloadAllowed: false,
    missingMandatoryData: false,
    companyName: null
  }
];

export const mockStakeholders: PortalStakeholder[] = [
  {
    entryNo: 1,
    propertyNo: "PROP-001",
    buildingNo: "BCN-001",
    stakeholderNo: "STK-001",
    stakeholderName: "Clean BCN",
    category: "Limpieza",
    serviceTitle: "Limpieza premium",
    portalDescription: "Servicio de limpieza puntual o recurrente para vivienda.",
    aiDescription: "Servicio de limpieza premium para vivienda con coordinación directa.",
    aiKeywords: "limpieza,hogar,mantenimiento",
    whatsappNo: "34600111222",
    whatsappHref: "https://wa.me/34600111222",
    bookingUrl: "https://clean-bcn.example.com/reservas",
    availableForAI: true,
    priorityScore: 90,
    defaultForCategory: true,
    notes: "Disponible de lunes a sábado."
  },
  {
    entryNo: 2,
    propertyNo: "PROP-001",
    buildingNo: "BCN-001",
    stakeholderNo: "STK-002",
    stakeholderName: "Fontanería Costa",
    category: "Mantenimiento",
    serviceTitle: "Soporte de fontanería",
    portalDescription: "Atención para fugas, grifería y pequeñas reparaciones.",
    aiDescription: "Proveedor de fontanería para incidencias habituales del inmueble.",
    aiKeywords: "fontaneria,fuga,agua",
    whatsappNo: "34 611-22-33-44",
    whatsappHref: "https://wa.me/34611223344",
    bookingUrl: "https://fontaneria-costa.example.com/contacto",
    availableForAI: true,
    priorityScore: 80,
    defaultForCategory: true,
    notes: "Priorizar para incidencias de agua."
  },
  {
    entryNo: 3,
    propertyNo: "PROP-001",
    buildingNo: "BCN-001",
    stakeholderNo: "STK-003",
    stakeholderName: "Seguros Forné",
    category: "Seguro",
    serviceTitle: "Orientación de siniestros",
    portalDescription: "Canal de apoyo para consultas relacionadas con cobertura.",
    aiDescription: "Orientación inicial para incidencias que puedan requerir seguro.",
    aiKeywords: "seguro,siniestro,cobertura",
    bookingUrl: "https://seguros.example.com/portal",
    availableForAI: false,
    priorityScore: 60,
    defaultForCategory: false,
    notes: "No usar como acción automática."
  }
];
