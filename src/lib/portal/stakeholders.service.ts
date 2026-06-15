import { env } from "@/lib/config/env";
import { bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { inFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import { mockStakeholders } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import type { PortalStakeholder } from "./stakeholders.types";

type RawStakeholder = Record<string, unknown>;

function escapedRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeText(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coerceString(record: RawStakeholder, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const sanitized = sanitizeText(value);
      if (sanitized) return sanitized;
    }
  }

  return undefined;
}

function coerceNumber(record: RawStakeholder, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return undefined;
}

function coerceBoolean(record: RawStakeholder, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "yes" || normalized === "1") return true;
      if (normalized === "false" || normalized === "no" || normalized === "0") return false;
    }
    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }
  }

  return false;
}

function hasAnyValue(record: RawStakeholder, keys: string[]) {
  return keys.some((key) => typeof record[key] !== "undefined" && record[key] !== null && `${record[key]}`.trim() !== "");
}

function normalizeWhatsappNumber(value: string | undefined) {
  if (!value) return undefined;

  const digits = value.replace(/[^\d]/g, "");
  return digits || undefined;
}

function normalizePhoneNumber(value: string | undefined) {
  if (!value) return undefined;

  const sanitized = value.replace(/[^\d+()\-\s]/g, "").trim();
  return sanitized || undefined;
}

function buildPhoneHref(value: string | undefined) {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return undefined;

  const telValue = normalized.replace(/[^\d+]/g, "");
  return telValue ? `tel:${telValue}` : undefined;
}

function normalizeEmail(value: string | undefined) {
  if (!value) return undefined;

  const sanitized = value.trim().toLowerCase();
  if (!sanitized.includes("@")) return undefined;
  return sanitized;
}

function buildEmailHref(value: string | undefined) {
  const normalized = normalizeEmail(value);
  return normalized ? `mailto:${normalized}` : undefined;
}

function normalizeExternalUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function buildWhatsappHref(value: string | undefined) {
  const normalized = normalizeWhatsappNumber(value);
  return normalized ? `https://wa.me/${normalized}` : undefined;
}

export function isMissingBusinessCentralEndpointError(message: string, endpoint: string) {
  const normalizedMessage = message.trim();
  if (!normalizedMessage || !endpoint.trim()) return false;

  const endpointPattern = new RegExp(`(^|[^a-z0-9])${escapedRegExp(endpoint)}([^a-z0-9]|$)`, "i");

  return (
    endpointPattern.test(normalizedMessage) &&
    (normalizedMessage.includes("404") ||
      normalizedMessage.includes("BadRequest_NotFound") ||
      normalizedMessage.includes("No HTTP resource was found") ||
      normalizedMessage.includes("does not exist"))
  );
}

function toRecord(value: unknown): RawStakeholder | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RawStakeholder) : null;
}

function sortStakeholders(left: PortalStakeholder, right: PortalStakeholder) {
  const priorityDiff = (right.priorityScore || 0) - (left.priorityScore || 0);
  if (priorityDiff !== 0) return priorityDiff;

  const defaultDiff = Number(Boolean(right.defaultForCategory)) - Number(Boolean(left.defaultForCategory));
  if (defaultDiff !== 0) return defaultDiff;

  return left.serviceTitle.localeCompare(right.serviceTitle, "es", { sensitivity: "base" });
}

function normalizeReference(value: string | null | undefined) {
  return sanitizeText(value);
}

function matchesReference(value: string | null | undefined, references: string[]) {
  const normalized = normalizeReference(value);
  return Boolean(normalized && references.includes(normalized));
}

export function buildStakeholderReferenceCandidates(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map(normalizeReference).filter(Boolean)));
}

export function normalizePortalStakeholders(values: unknown[]): PortalStakeholder[] {
  const deduped = new Map<string, PortalStakeholder>();

  values.forEach((value, index) => {
    const record = toRecord(value);
    if (!record) return;

    const propertyNo = coerceString(record, [
      "propertyNo",
      "propertyNo.",
      "Property No.",
      "propertyNumber",
      "propertyCode",
      "property",
      "fixedRealEstateNo",
      "realEstateNo",
      "assetNo",
      "assetNumber",
      "freNo",
      "no"
    ]);
    const stakeholderNo =
      coerceString(record, [
        "stakeholderNo",
        "stakeholderNo.",
        "Stakeholder No.",
        "providerNo",
        "vendorNo",
        "supplierNo",
        "contactNo",
        "contactNumber",
        "code",
        "no"
      ]) || "";
    const category =
      coerceString(record, [
        "category",
        "serviceCategory",
        "stakeholderCategory",
        "stakeholderCategoryName",
        "categoryName"
      ]) || "Servicio";
    const stakeholderName =
      coerceString(record, [
        "stakeholderName",
        "providerName",
        "vendorName",
        "supplierName",
        "contactName",
        "displayName",
        "name"
      ]) ||
      stakeholderNo ||
      `Proveedor ${index + 1}`;
    const serviceTitle =
      coerceString(record, ["serviceTitle", "serviceName", "portalTitle", "title", "description"]) ||
      (category && category !== "Undefined" ? category : "") ||
      stakeholderName ||
      `Servicio ${index + 1}`;

    if (!propertyNo) return;
    if (
      hasAnyValue(record, ["active", "enabled", "isActive", "Active"]) &&
      coerceBoolean(record, ["active", "enabled", "isActive", "Active"]) === false
    ) {
      return;
    }
    if (
      hasAnyValue(record, [
        "portalVisible",
        "portalvisible",
        "portal_Visible",
        "visibleInPortal",
        "tenantVisible",
        "Portal Visible"
      ]) &&
      coerceBoolean(record, [
        "portalVisible",
        "portalvisible",
        "portal_Visible",
        "visibleInPortal",
        "tenantVisible",
        "Portal Visible"
      ]) === false
    ) {
      return;
    }

    const phoneNo = coerceString(record, [
      "phoneNo",
      "phone",
      "telephone",
      "mobilePhoneNo",
      "mobilePhone",
      "contactPhoneNo",
      "contactPhone"
    ]);
    const email = coerceString(record, ["email", "eMail", "contactEmail", "mail"]);
    const whatsappNo = coerceString(record, [
      "whatsappNo",
      "whatsAppNo",
      "whatsapp",
      "mobilePhoneNo",
      "mobilePhone",
      "phoneNo",
      "phone"
    ]);
    const bookingUrl = normalizeExternalUrl(coerceString(record, ["bookingUrl", "externalUrl", "contactUrl", "url"]));
    const stakeholder: PortalStakeholder = {
      entryNo: coerceNumber(record, ["entryNo", "lineNo", "id"]) || index + 1,
      propertyNo,
      buildingNo: coerceString(record, ["buildingNo", "buildingNo.", "Building No.", "buildingCode"]),
      stakeholderNo,
      stakeholderName,
      category,
      serviceTitle,
      portalDescription: coerceString(record, ["portalDescription", "description", "serviceDescription", "notes"]),
      aiDescription: coerceString(record, ["aiDescription"]),
      aiKeywords: coerceString(record, ["aiKeywords"]),
      phoneNo: normalizePhoneNumber(phoneNo),
      phoneHref: buildPhoneHref(phoneNo),
      email: normalizeEmail(email),
      emailHref: buildEmailHref(email),
      whatsappNo: normalizeWhatsappNumber(whatsappNo),
      whatsappHref: buildWhatsappHref(whatsappNo),
      bookingUrl,
      tenantProfileFilter: coerceString(record, ["tenantProfileFilter"]),
      availableForAI: coerceBoolean(record, ["availableForAI", "availableForAi", "Available for AI"]),
      priorityScore: coerceNumber(record, ["priorityScore"]),
      defaultForCategory: coerceBoolean(record, ["defaultForCategory"]),
      notes: coerceString(record, ["notes", "internalNotes", "portalNotes"])
    };

    const key = `${stakeholder.propertyNo.toLowerCase()}::${stakeholder.serviceTitle.toLowerCase()}::${stakeholder.stakeholderName.toLowerCase()}`;
    if (!deduped.has(key)) {
      deduped.set(key, stakeholder);
    }
  });

  return Array.from(deduped.values()).sort(sortStakeholders);
}

function filterStakeholdersByReferences(stakeholders: PortalStakeholder[], references: string[]) {
  if (references.length === 0) return [];

  return stakeholders.filter(
    (stakeholder) =>
      matchesReference(stakeholder.propertyNo, references) || matchesReference(stakeholder.buildingNo, references)
  );
}

export function buildStakeholdersAIContext(stakeholders: PortalStakeholder[]) {
  const visibleForAI = stakeholders
    .filter(
      (stakeholder) =>
        stakeholder.availableForAI &&
        Boolean(sanitizeText(stakeholder.aiDescription || stakeholder.portalDescription || ""))
    )
    .sort(sortStakeholders)
    .slice(0, 10);

  if (visibleForAI.length === 0) {
    return "AVAILABLE PROPERTY SERVICES:\n- No AI-available services visible for this property.";
  }

  const lines = ["AVAILABLE PROPERTY SERVICES:", ""];

  visibleForAI.forEach((stakeholder) => {
    lines.push(`- Service: ${stakeholder.serviceTitle}`);
    lines.push(`  Category: ${stakeholder.category}`);
    lines.push(`  Provider: ${stakeholder.stakeholderName}`);
    if (stakeholder.aiDescription || stakeholder.portalDescription) {
      lines.push(`  Description: ${stakeholder.aiDescription || stakeholder.portalDescription}`);
    }
    if (stakeholder.aiKeywords) {
      lines.push(`  Keywords: ${stakeholder.aiKeywords}`);
    }
    lines.push("");
  });

  const context = lines.join("\n").trim();
  return context.length <= 5000 ? context : `${context.slice(0, 4997).trimEnd()}...`;
}

export async function getPortalStakeholders(
  propertyReference: string,
  alternativeReferences: Array<string | null | undefined> = []
): Promise<PortalStakeholder[]> {
  const references = buildStakeholderReferenceCandidates([propertyReference, ...alternativeReferences]);
  if (references.length === 0) {
    throw new Error("Se necesita una referencia válida para consultar servicios.");
  }

  if (env.useMockApi) {
    return normalizePortalStakeholders(mockStakeholders).filter((item) => references.includes(item.propertyNo));
  }

  const user = await resolvePortalUserContext();
  const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };
  const candidateFields = ["propertyNo", "fixedRealEstateNo", "assetNo", "freNo", "no"];
  let lastCompatibilityError: Error | null = null;

  for (const field of candidateFields) {
    try {
      const payload = await bcGetForCompany<{ value?: RawStakeholder[] }>(
        company,
        bcEndpoints.stakeholders,
        odataQuery({
          filter: inFilter(field, references),
          orderBy: "priorityScore desc,serviceTitle asc"
        })
      );

      const normalized = normalizePortalStakeholders(unwrap(payload));
      if (normalized.length > 0) {
        return normalized;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (isMissingBusinessCentralEndpointError(message, bcEndpoints.stakeholders)) {
        console.warn(
          `[portal/stakeholders] Business Central endpoint "${bcEndpoints.stakeholders}" is not available. Returning no visible services.`,
          error
        );
        return [];
      }

      if (
        message.includes("404") ||
        message.includes("Could not find a property named") ||
        message.includes("BadRequest")
      ) {
        lastCompatibilityError = error instanceof Error ? error : new Error(String(error));
        continue;
      }

      throw error;
    }
  }

  if (lastCompatibilityError) {
    console.warn("[portal/stakeholders] No compatible stakeholder filter field found in Business Central.", lastCompatibilityError);
  }

  try {
    const fallbackPayload = await bcGetForCompany<{ value?: RawStakeholder[] }>(
      company,
      bcEndpoints.stakeholders,
      odataQuery({
        orderBy: "priorityScore desc,serviceTitle asc",
        top: 200
      })
    );

    return filterStakeholdersByReferences(normalizePortalStakeholders(unwrap(fallbackPayload)), references);
  } catch (error) {
    console.warn("[portal/stakeholders] Fallback stakeholder load without filter failed.", error);
  }

  try {
    const minimalFallbackPayload = await bcGetForCompany<{ value?: RawStakeholder[] }>(company, bcEndpoints.stakeholders);
    return filterStakeholdersByReferences(normalizePortalStakeholders(unwrap(minimalFallbackPayload)), references);
  } catch (error) {
    console.warn("[portal/stakeholders] Minimal fallback stakeholder load failed.", error);
  }

  return [];
}
