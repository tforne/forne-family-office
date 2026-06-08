import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { PortalDuplicateIncidentDetection, PortalDuplicateIncidentMatch } from "@/lib/portal/chat-assistant";
import type { IntentDetectionResult } from "@/lib/portal/intent-detector.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "";
  return value;
}

function isOpenIncident(incident: IncidentDto) {
  return incident.stateCode === "Active" && !cleanDate(incident.resolutionDate);
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 4 && !["tengo", "problema", "incidencia", "casa", "piso", "portal"].includes(token));
}

function keywordSignals(message: string) {
  const normalized = normalizeText(message);
  return [
    normalized.includes("humedad") ? "humedad" : "",
    normalized.includes("fuga") || normalized.includes("filtrando agua") ? "agua" : "",
    normalized.includes("electric") ? "electricidad" : "",
    normalized.includes("humo") || normalized.includes("incendio") ? "humo" : "",
    normalized.includes("olor") ? "olor" : "",
    normalized.includes("bano") ? "baño" : "",
    normalized.includes("cocina") ? "cocina" : "",
    normalized.includes("techo") ? "techo" : "",
    normalized.includes("vecino") ? "vecino" : ""
  ].filter(Boolean);
}

function overlapRatio(source: string[], target: string[]) {
  if (source.length === 0 || target.length === 0) return 0;
  const targetSet = new Set(target);
  const matches = source.filter((token) => targetSet.has(token)).length;
  return matches / Math.max(source.length, 1);
}

function similarityReason(match: PortalDuplicateIncidentMatch) {
  if (match.reason.includes("mismo inmueble")) return match.reason;
  if (match.similarity >= 0.8) return "Coincide con una incidencia muy parecida ya registrada.";
  if (match.similarity >= 0.65) return "Parece relacionada con una incidencia abierta del mismo entorno.";
  return match.reason;
}

export function detectDuplicateIncidents(
  message: string,
  incidents: IncidentDto[],
  context?: PortalAIContext,
  intent?: IntentDetectionResult
): PortalDuplicateIncidentDetection {
  const incidentIntent = intent?.intent === "maintenance_incident" || intent?.intent === "urgent_incident";
  if (!incidentIntent || !message.trim()) {
    return {
      isPotentialDuplicate: false,
      confidence: 0.2,
      summary: "No se ha evaluado duplicidad porque la consulta no parece una incidencia operativa.",
      matches: []
    };
  }

  const normalizedMessage = normalizeText(message);
  const messageTokens = tokenize(message);
  const messageSignals = keywordSignals(message);
  const propertyNo = context?.property?.fixedRealEstateNo || "";
  const contractNo = context?.contract?.contractNo || "";
  const repeatedComplaint = /\b(otra vez|sigue igual|de nuevo|todavia|todavía)\b/.test(normalizedMessage);

  const matches = incidents
    .map((incident) => {
      const incidentText = [incident.title, incident.description || "", incident.refDescription || ""].join(" ");
      const incidentTokens = tokenize(incidentText);
      const tokenOverlap = overlapRatio(messageTokens, incidentTokens);
      const signalOverlap = overlapRatio(messageSignals, keywordSignals(incidentText));
      const sameProperty = Boolean(propertyNo && incident.fixedRealEstateNo && incident.fixedRealEstateNo === propertyNo);
      const sameContract = Boolean(contractNo && incident.contractNo && incident.contractNo === contractNo);
      const explicitDifferentProperty = Boolean(
        propertyNo &&
          incident.fixedRealEstateNo &&
          incident.fixedRealEstateNo !== propertyNo
      );
      const explicitDifferentContract = Boolean(
        contractNo &&
          incident.contractNo &&
          incident.contractNo !== contractNo
      );
      const openIncident = isOpenIncident(incident);
      const closedIncident = !openIncident;

      let similarity = tokenOverlap * 0.5 + signalOverlap * 0.2;
      if (sameProperty) similarity += 0.2;
      if (sameContract) similarity += 0.1;
      if (openIncident) similarity += 0.08;
      if (repeatedComplaint && openIncident && (sameProperty || sameContract)) similarity += 0.12;
      if (normalizedMessage.includes(normalizeText(incident.title || ""))) similarity += 0.12;
      if (explicitDifferentProperty) similarity -= 0.25;
      if (explicitDifferentContract) similarity -= 0.15;
      if (closedIncident) similarity -= 0.32;
      if (!sameProperty && !sameContract && tokenOverlap < 0.55) similarity -= 0.12;
      if (closedIncident && !repeatedComplaint) similarity = Math.min(similarity, 0.59);

      const reasonParts = [
        sameProperty ? "mismo inmueble" : "",
        sameContract ? "mismo contrato" : "",
        explicitDifferentProperty ? "otro inmueble" : "",
        tokenOverlap >= 0.45 ? "descripción parecida" : "",
        signalOverlap >= 0.5 ? "mismas señales operativas" : "",
        openIncident ? "incidencia todavía abierta" : "",
        repeatedComplaint && openIncident ? "el mensaje indica que el problema continúa" : ""
      ].filter(Boolean);

      return {
        id: incident.id,
        incidentId: incident.incidentId,
        title: incident.title || incident.incidentId || "Incidencia existente",
        status: incident.stateCode || incident.statusCode || undefined,
        priority: incident.priority || undefined,
        incidentDate: incident.incidentDate,
        similarity: Number(Math.max(0, Math.min(0.99, similarity)).toFixed(2)),
        reason: reasonParts.length > 0 ? reasonParts.join(", ") : "coincidencia parcial detectada",
        href: `/portal/incidents/${encodeURIComponent(incident.id || incident.incidentId)}`
      } satisfies PortalDuplicateIncidentMatch;
    })
    .filter((incident) => incident.similarity >= 0.5)
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, 3)
    .map((match) => ({
      ...match,
      reason: similarityReason(match)
    }));

  if (matches.length === 0) {
    return {
      isPotentialDuplicate: false,
      confidence: 0.28,
      summary: "No se detectan incidencias similares dentro del historial operativo visible de este inquilino.",
      matches: []
    };
  }

  const confidence = Number(matches[0].similarity.toFixed(2));
  const isPotentialDuplicate = confidence >= 0.65;
  const summary = isPotentialDuplicate
    ? `Parece que ya hay una incidencia parecida abierta. Te recomendamos revisarla antes de crear una nueva.`
    : `Hay antecedentes relacionados en el historial, pero no parecen una duplicidad clara.`;

  return {
    isPotentialDuplicate,
    confidence,
    summary,
    matches
  };
}
