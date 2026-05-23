import type { DocumentDto } from "@/lib/dto/document.dto";

function hasValidReviewDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return false;

  return !Number.isNaN(Date.parse(value));
}

function normalizeReviewStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

export function getDocumentReviewLabel(document: DocumentDto) {
  if (document.missingMandatoryData) return "Incompleto";

  const normalized = normalizeReviewStatus(document.reviewStatus);

  if (["reviewed", "revisado", "completed", "complete", "done"].includes(normalized)) {
    return "Revisado";
  }

  if (["pending", "pendiente", "in review", "under review", "review", "revision"].includes(normalized)) {
    return "Pendiente";
  }

  if (hasValidReviewDate(document.lastReviewDate)) {
    return "Revisado";
  }

  return document.reviewStatus?.trim() || "Sin revisión";
}

export function isDocumentReviewed(document: DocumentDto) {
  return getDocumentReviewLabel(document) === "Revisado";
}
