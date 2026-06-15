import "server-only";

import { getMe } from "@/lib/portal/me.service";
import { getContracts } from "@/lib/portal/contracts.service";
import { getIncidentById, getIncidents } from "@/lib/portal/incidents.service";
import { getAssets } from "@/lib/portal/assets.service";
import { matchStakeholdersForRecommendation } from "@/lib/portal/service-recommendation.service";
import {
  buildStakeholdersAIContext,
  buildStakeholderReferenceCandidates,
  getPortalStakeholders
} from "@/lib/portal/stakeholders.service";
import { resolvePortalUserContext } from "@/lib/portal/user-context";
import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { ContractDto } from "@/lib/dto/contract.dto";
import type { PortalPageContext, PortalPropertyOperationalIntelligence } from "@/lib/portal/chat-assistant";

export type PortalAIPageType =
  | "home"
  | "incident"
  | "incidents"
  | "invoice"
  | "contract"
  | "services"
  | "documents"
  | "profile"
  | "unknown";

export interface PortalAIContextInput {
  message: string;
  page?: string;
  pageType?: string;
  pageContext?: unknown;
  sessionId?: string;
  locale?: string;
  history?: unknown;
}

export interface PortalAIContext {
  sessionId?: string;
  page?: string;
  pageType: PortalAIPageType;
  locale?: string;
  company?: {
    bcCompanyId?: string;
    bcCompanyName?: string;
  };
  tenant?: {
    portalUserId?: string;
    email?: string;
    displayName?: string;
    customerNo?: string;
    contactNo?: string;
  };
  incident?: {
    id?: string;
    title?: string;
    status?: string;
    priority?: string;
    fixedRealEstateNo?: string;
  };
  contract?: {
    contractNo?: string;
  };
  property?: {
    fixedRealEstateNo?: string;
  };
  services?: {
    propertyNo?: string;
    serviceCount?: number;
    aiContext?: string;
    requestedCategory?: string;
    matchedSignals?: string[];
    matchedStakeholders?: Array<{
      entryNo: number;
      serviceTitle: string;
      stakeholderName: string;
      category: string;
      portalDescription?: string;
      whatsappHref?: string;
      bookingUrl?: string;
    }>;
  };
  propertyOperationalIntelligence?: PortalPropertyOperationalIntelligence;
  operationalHints: string[];
  compactText: string;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function trimText(value: string, maxLength: number) {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function parseLocale(input: PortalAIContextInput) {
  if (typeof input.locale === "string" && input.locale.trim()) {
    return input.locale.trim().slice(0, 12);
  }

  const pageContext = input.pageContext;
  if (pageContext && typeof pageContext === "object" && typeof (pageContext as { locale?: unknown }).locale === "string") {
    return trimText((pageContext as { locale: string }).locale, 12);
  }

  return undefined;
}

function normalizePage(page: string | undefined) {
  if (!page || !page.startsWith("/portal")) return "/portal";
  return page;
}

function resolvePageType(page: string, explicitPageType?: string): PortalAIPageType {
  const normalizedExplicit = typeof explicitPageType === "string" ? explicitPageType.trim().toLowerCase() : "";
  const allowedExplicit: PortalAIPageType[] = ["home", "incident", "incidents", "invoice", "contract", "services", "documents", "profile", "unknown"];
  if (allowedExplicit.includes(normalizedExplicit as PortalAIPageType)) {
    return normalizedExplicit as PortalAIPageType;
  }

  if (page === "/portal") return "home";
  if (/^\/portal\/incidents\/[^/]+$/.test(page)) return "incident";
  if (page.startsWith("/portal/incidents")) return "incidents";
  if (page.startsWith("/portal/invoices")) return "invoice";
  if (page.startsWith("/portal/contracts")) return "contract";
  if (page.startsWith("/portal/services")) return "services";
  if (page.startsWith("/portal/documents")) return "documents";
  if (page.startsWith("/portal/profile")) return "profile";
  return "unknown";
}

function sanitizePageContext(rawPageContext: unknown): PortalPageContext {
  if (!rawPageContext || typeof rawPageContext !== "object") return {};

  const pageContext = rawPageContext as {
    pageTitle?: unknown;
    pageSummary?: unknown;
    pageEyebrow?: unknown;
    visibleFacts?: unknown;
    visibleSections?: unknown;
    visibleUpdates?: unknown;
  };

  return {
    pageTitle: typeof pageContext.pageTitle === "string" ? trimText(pageContext.pageTitle, 160) : undefined,
    pageSummary: typeof pageContext.pageSummary === "string" ? trimText(pageContext.pageSummary, 260) : undefined,
    pageEyebrow: typeof pageContext.pageEyebrow === "string" ? trimText(pageContext.pageEyebrow, 80) : undefined,
    visibleFacts: Array.isArray(pageContext.visibleFacts)
      ? pageContext.visibleFacts
          .filter(
            (item): item is { label?: unknown; value?: unknown; helper?: unknown } =>
              Boolean(item) && typeof item === "object" && typeof item.label === "string" && typeof item.value === "string"
          )
          .map((item) => ({
            label: trimText(item.label as string, 80),
            value: trimText(item.value as string, 160),
            helper: typeof item.helper === "string" ? trimText(item.helper, 120) : undefined
          }))
          .slice(0, 6)
      : undefined,
    visibleSections: Array.isArray(pageContext.visibleSections)
      ? pageContext.visibleSections
          .filter(
            (item): item is { title?: unknown; summary?: unknown } =>
              Boolean(item) && typeof item === "object" && typeof item.title === "string" && typeof item.summary === "string"
          )
          .map((item) => ({
            title: trimText(item.title as string, 80),
            summary: trimText(item.summary as string, 180)
          }))
          .slice(0, 4)
      : undefined,
    visibleUpdates: Array.isArray(pageContext.visibleUpdates)
      ? pageContext.visibleUpdates
          .filter(
            (item): item is { date?: unknown; text?: unknown } =>
              Boolean(item) &&
              typeof item === "object" &&
              typeof item.text === "string" &&
              (typeof item.date === "undefined" || typeof item.date === "string")
          )
          .map((item) => ({
            date: typeof item.date === "string" ? trimText(item.date, 40) : undefined,
            text: trimText(item.text as string, 180)
          }))
          .slice(0, 3)
      : undefined
  };
}

function pageIdFromPath(page: string, prefix: string) {
  const match = page.match(new RegExp(`^${prefix}/([^/]+)$`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function cleanDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "";
  return value;
}

function isOpenIncident(incident: IncidentDto) {
  return incident.stateCode === "Active" && !cleanDate(incident.resolutionDate);
}

function buildPropertyOperationalIntelligence(
  propertyNo: string | undefined,
  contractNo: string | undefined,
  contracts: ContractDto[],
  incidents: IncidentDto[]
): PortalPropertyOperationalIntelligence | undefined {
  if (!propertyNo && !contractNo) return undefined;

  const relatedIncidents = incidents.filter(
    (incident) =>
      (propertyNo && incident.fixedRealEstateNo === propertyNo) ||
      (contractNo && incident.contractNo === contractNo)
  );
  const openIncidents = relatedIncidents.filter(isOpenIncident);
  const latestIncident = relatedIncidents[0];
  const relatedContract =
    contracts.find((contract) => contract.fixedRealEstateNo === propertyNo || contract.contractNo === contractNo) || contracts[0];
  const propertyLabel =
    relatedContract?.fixedRealEstateDescription ||
    relatedContract?.description ||
    latestIncident?.refDescription ||
    propertyNo;
  const operationalStatus =
    openIncidents.length >= 2 ? "high_attention" : openIncidents.length === 1 ? "active_attention" : "stable";

  const summary =
    operationalStatus === "high_attention"
      ? `El inmueble tiene ${openIncidents.length} incidencia(s) abierta(s) y requiere atención operativa alta.`
      : operationalStatus === "active_attention"
        ? `El inmueble ya tiene una incidencia abierta en seguimiento.`
        : `No hay incidencias abiertas visibles para este inmueble.`;

  return {
    fixedRealEstateNo: propertyNo,
    propertyLabel,
    relatedContractNo: relatedContract?.contractNo || contractNo,
    openIncidentCount: openIncidents.length,
    totalIncidentCount: relatedIncidents.length,
    recentIncidentTitle: latestIncident?.title || undefined,
    operationalStatus,
    summary
  };
}

function buildOperationalHints(page: string, pageType: PortalAIPageType, message: string, context: PortalAIContext) {
  const hints: string[] = [];
  const normalizedMessage = normalizeWhitespace(message).toLowerCase();

  if (pageType === "incident") {
    hints.push("User is asking from an incident page");
    hints.push("User may need operational support for an existing incident");
  } else if (pageType === "incidents") {
    hints.push("User is asking from the incidents section");
  } else if (pageType === "invoice") {
    hints.push("User is asking from an invoice-related page");
  } else if (pageType === "contract") {
    hints.push("User is asking from a contract or property dossier page");
  } else if (pageType === "services") {
    hints.push("User is asking from the property services section");
  } else if (pageType === "documents") {
    hints.push("User is asking from the documents section");
  } else if (pageType === "profile") {
    hints.push("User is asking from the profile section");
  } else if (page === "/portal") {
    hints.push("User is asking from the portal home page");
  }

  if (context.incident?.id) {
    hints.push("Current incident context is available");
  }

  if (context.property?.fixedRealEstateNo) {
    hints.push("Current property reference is available");
  }

  if (context.propertyOperationalIntelligence?.openIncidentCount) {
    hints.push(`Property has ${context.propertyOperationalIntelligence.openIncidentCount} open incidents`);
  }

  if (context.services?.requestedCategory) {
    hints.push(`User is asking about property services in category ${context.services.requestedCategory}`);
  }

  if (context.services?.matchedStakeholders?.length) {
    hints.push(`There are ${context.services.matchedStakeholders.length} matching visible services for this request`);
  }

  if (/\b(urgente|urgencia|agua|humedad|fuga|incendio|olor a gas|smoke|flood)\b/.test(normalizedMessage)) {
    hints.push("Possible maintenance urgency detected from the user message");
  }

  return Array.from(new Set(hints)).slice(0, 6);
}

function buildCompactContextText(context: PortalAIContext, pageContext: PortalPageContext) {
  const lines = [
    "PORTAL CONTEXT:",
    `- Page: ${context.page || "/portal"}`,
    `- Page Type: ${context.pageType}`,
    `- Locale: ${context.locale || "es"}`,
    `- Tenant: ${context.tenant?.displayName || "current authenticated portal user"}${context.tenant?.customerNo ? ` (customer ${context.tenant.customerNo})` : ""}`
  ];

  if (context.tenant?.email) {
    lines.push(`- Tenant Email: ${context.tenant.email}`);
  }

  if (context.incident?.id) {
    lines.push(
      `- Incident: ${[context.incident.id, context.incident.title, context.incident.status].filter(Boolean).join(" | ")}`
    );
  }

  if (context.contract?.contractNo) {
    lines.push(`- Contract: ${context.contract.contractNo}`);
  }

  if (context.property?.fixedRealEstateNo) {
    lines.push(`- Property: ${context.property.fixedRealEstateNo}`);
  }

  if (context.services?.propertyNo) {
    lines.push(`- Services Property Reference: ${context.services.propertyNo}`);
  }

  if (typeof context.services?.serviceCount === "number") {
    lines.push(`- Visible Services: ${context.services.serviceCount}`);
  }

  if (context.services?.requestedCategory) {
    lines.push(`- Requested Service Category: ${context.services.requestedCategory}`);
  }

  if (context.services?.matchedStakeholders?.length) {
    lines.push(
      `- Matching Services: ${context.services.matchedStakeholders
        .map((stakeholder) => `${stakeholder.serviceTitle} (${stakeholder.stakeholderName})`)
        .join(" | ")}`
    );
  }

  if (context.propertyOperationalIntelligence) {
    lines.push(`- Property Intelligence: ${context.propertyOperationalIntelligence.summary}`);
  }

  if (context.services?.aiContext) {
    lines.push(context.services.aiContext);
  }

  if (context.services) {
    lines.push("- Service Recommendation Safety: Recommend only stakeholders listed in AVAILABLE PROPERTY SERVICES or Matching Services. If none match, say so clearly and do not invent providers, phones, or booking links.");
  }

  if (pageContext.pageTitle) {
    lines.push(`- Visible Title: ${pageContext.pageTitle}`);
  }

  if (pageContext.pageSummary) {
    lines.push(`- Visible Summary: ${pageContext.pageSummary}`);
  }

  const visibleFacts = (pageContext.visibleFacts || []).slice(0, 4);
  if (visibleFacts.length) {
    lines.push(`- Visible Facts: ${visibleFacts.map((fact) => `${fact.label}: ${fact.value}`).join(" | ")}`);
  }

  const visibleUpdates = (pageContext.visibleUpdates || []).slice(0, 2);
  if (visibleUpdates.length) {
    lines.push(`- Visible Updates: ${visibleUpdates.map((update) => `${update.date ? `${update.date}: ` : ""}${update.text}`).join(" | ")}`);
  }

  lines.push("- Operational hints:");
  for (const hint of context.operationalHints) {
    lines.push(`  - ${hint}`);
  }

  return lines.join("\n");
}

export async function buildPortalAIContext(input: PortalAIContextInput): Promise<PortalAIContext> {
  const page = normalizePage(input.page);
  const pageType = resolvePageType(page, input.pageType);
  const pageContext = sanitizePageContext(input.pageContext);
  const [user, me] = await Promise.all([resolvePortalUserContext(), getMe()]);

  const context: PortalAIContext = {
    sessionId: typeof input.sessionId === "string" ? trimText(input.sessionId, 120) : undefined,
    page,
    pageType,
    locale: parseLocale(input) || "es",
    company: {
      bcCompanyId: user.bcCompanyId,
      bcCompanyName: user.bcCompanyName
    },
    tenant: {
      portalUserId: user.externalUserId || user.customerNo || user.email,
      email: me.email || user.email,
      displayName: me.customerName || user.customerName,
      customerNo: me.customerNo || user.customerNo
    },
    operationalHints: [],
    compactText: ""
  };

  const incidentId = pageIdFromPath(page, "/portal/incidents");
  if (incidentId) {
    const incident = await getIncidentById(incidentId).catch(() => undefined);
    if (incident) {
      context.incident = {
        id: incident.incidentId || incident.id,
        title: incident.title || undefined,
        status: incident.statusCode || incident.stateCode || undefined,
        priority: incident.priority || undefined,
        fixedRealEstateNo: incident.fixedRealEstateNo || undefined
      };

      if (incident.contractNo) {
        context.contract = { contractNo: incident.contractNo };
      }

      if (incident.fixedRealEstateNo) {
        context.property = { fixedRealEstateNo: incident.fixedRealEstateNo };
      }
    }
  }

  const [contracts, incidents] = await Promise.all([getContracts().catch(() => []), getIncidents().catch(() => [])]);

  if (!context.contract || !context.property) {
    const currentContractId = pageIdFromPath(page, "/portal/contracts");
    const contractMatch =
      contracts.find((contract) => contract.id === currentContractId || contract.contractNo === currentContractId) ||
      contracts.find((contract) => pageType === "invoice" && contract.customerNo === context.tenant?.customerNo) ||
      contracts[0];

    if (contractMatch) {
      context.contract = context.contract || { contractNo: contractMatch.contractNo || undefined };
      if (!context.property && contractMatch.fixedRealEstateNo) {
        context.property = { fixedRealEstateNo: contractMatch.fixedRealEstateNo };
      }
    }
  }

  context.propertyOperationalIntelligence = buildPropertyOperationalIntelligence(
    context.property?.fixedRealEstateNo,
    context.contract?.contractNo,
    contracts,
    incidents
  );

  const assets = await getAssets().catch(() => []);
  const stakeholderReferences = buildStakeholderReferenceCandidates([
    assets.find((asset) => asset.number === context.property?.fixedRealEstateNo)?.propertyNo,
    assets.find((asset) => asset.number === context.property?.fixedRealEstateNo)?.number,
    assets.find((asset) => asset.propertyNo === context.property?.fixedRealEstateNo)?.propertyNo,
    context.property?.fixedRealEstateNo
  ]);

  if (stakeholderReferences.length) {
    const stakeholders = await getPortalStakeholders(
      stakeholderReferences[0],
      stakeholderReferences.slice(1)
    ).catch(() => []);
    const serviceRecommendation = matchStakeholdersForRecommendation(input.message, stakeholders);
    context.services = {
      propertyNo: stakeholderReferences[0],
      serviceCount: stakeholders.length,
      aiContext: buildStakeholdersAIContext(stakeholders),
      requestedCategory: serviceRecommendation.requestedCategory,
      matchedSignals: serviceRecommendation.matchedSignals,
      matchedStakeholders: serviceRecommendation.matchedStakeholders.map((stakeholder) => ({
        entryNo: stakeholder.entryNo,
        serviceTitle: stakeholder.serviceTitle,
        stakeholderName: stakeholder.stakeholderName,
        category: stakeholder.category,
        portalDescription: stakeholder.portalDescription,
        whatsappHref: stakeholder.whatsappHref,
        bookingUrl: stakeholder.bookingUrl
      }))
    };
  }

  context.operationalHints = buildOperationalHints(page, pageType, input.message, context);
  context.compactText = buildCompactContextText(context, pageContext);

  return context;
}
