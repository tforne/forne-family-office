import type { PortalIncidentDraft } from "@/lib/portal/chat-assistant";
import type { IntentDetectionResult } from "@/lib/portal/intent-detector.service";

export interface IncidentDraft extends PortalIncidentDraft {}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toPriority(urgency: IntentDetectionResult["urgency"]): IncidentDraft["priority"] {
  switch (urgency) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    default:
      return "Low";
  }
}

function pickLocation(normalizedMessage: string) {
  if (normalizedMessage.includes("bano")) return "baño";
  if (normalizedMessage.includes("cocina")) return "cocina";
  if (normalizedMessage.includes("salon")) return "salón";
  if (normalizedMessage.includes("dormitorio")) return "dormitorio";
  if (normalizedMessage.includes("techo")) return "techo";
  if (normalizedMessage.includes("pared")) return "pared";
  if (normalizedMessage.includes("vecino")) return "vivienda colindante";
  return "";
}

function buildTitle(message: string, normalizedMessage: string, urgency: NonNullable<IntentDetectionResult["urgency"]>) {
  const location = pickLocation(normalizedMessage);

  if (normalizedMessage.includes("humedad") && normalizedMessage.includes("mal olor")) {
    return location ? `Humedad y mal olor en ${location}` : "Humedad y mal olor";
  }

  if (normalizedMessage.includes("fuga") || normalizedMessage.includes("filtrando agua")) {
    if (normalizedMessage.includes("vecino")) return "Filtración de agua a vecino";
    return location ? `Fuga de agua en ${location}` : "Fuga de agua";
  }

  if (normalizedMessage.includes("electricidad") || normalizedMessage.includes("cortocircuito")) {
    return location ? `Incidencia eléctrica en ${location}` : "Incidencia eléctrica";
  }

  if (normalizedMessage.includes("humo") || normalizedMessage.includes("incendio")) {
    return "Presencia de humo o riesgo de incendio";
  }

  if (normalizedMessage.includes("humedad")) {
    return location ? `Humedad en ${location}` : "Humedad en inmueble";
  }

  return urgency === "high" || urgency === "critical" ? "Incidencia urgente reportada" : "Incidencia de mantenimiento reportada";
}

function buildDescription(message: string, normalizedMessage: string) {
  if (normalizedMessage.includes("humedad") && normalizedMessage.includes("mal olor")) {
    return "El inquilino informa de humedad persistente y mal olor en el baño. Posible filtración o problema de ventilación.";
  }

  if (normalizedMessage.includes("filtrando agua") || (normalizedMessage.includes("fuga") && normalizedMessage.includes("vecino"))) {
    return "El inquilino informa de una filtración de agua que está afectando a otra vivienda. La incidencia requiere revisión prioritaria para contener daños y verificar el alcance.";
  }

  if (normalizedMessage.includes("electricidad") || normalizedMessage.includes("cortocircuito")) {
    return "El inquilino informa de un problema eléctrico con posible riesgo operativo. Es necesario revisar la instalación y valorar medidas de seguridad inmediatas.";
  }

  if (normalizedMessage.includes("humo") || normalizedMessage.includes("incendio")) {
    return "El inquilino informa de humo o riesgo de incendio en el inmueble. La situación debe tratarse como incidencia crítica hasta confirmar el origen.";
  }

  if (normalizedMessage.includes("humedad")) {
    return "El inquilino informa de humedad en el inmueble. Puede estar relacionada con una filtración, condensación o problema de ventilación y requiere revisión.";
  }

  return `El inquilino reporta la siguiente incidencia: ${message.trim()}`;
}

function buildSuggestedNextStep(normalizedMessage: string, urgency: NonNullable<IntentDetectionResult["urgency"]>) {
  if (normalizedMessage.includes("filtrando agua") || normalizedMessage.includes("fuga")) {
    return "Revisar posible fuga, contener daños y solicitar fotografías.";
  }

  if (normalizedMessage.includes("electricidad") || normalizedMessage.includes("cortocircuito")) {
    return "Coordinar revisión eléctrica urgente y confirmar si es seguro mantener el suministro.";
  }

  if (normalizedMessage.includes("humo") || normalizedMessage.includes("incendio") || normalizedMessage.includes("gas")) {
    return "Contactar soporte urgente y verificar medidas inmediatas de seguridad antes de continuar.";
  }

  if (normalizedMessage.includes("humedad") || normalizedMessage.includes("mal olor")) {
    return "Revisar posible filtración y solicitar fotografías.";
  }

  if (urgency === "high" || urgency === "critical") {
    return "Solicitar validación del usuario y escalar la revisión con prioridad alta.";
  }

  return "Solicitar más contexto operativo y documentar la incidencia con fotos si están disponibles.";
}

export function buildIncidentDraft(
  message: string,
  _context?: unknown,
  intent?: IntentDetectionResult
): IncidentDraft | null {
  const normalizedMessage = normalizeText(message);
  const incidentIntent = intent?.intent === "maintenance_incident" || intent?.intent === "urgent_incident";

  if (!message.trim() || !incidentIntent) {
    return null;
  }

  const urgency = intent?.urgency || "medium";

  return {
    title: buildTitle(message, normalizedMessage, urgency),
    category: "Maintenance",
    priority: toPriority(urgency),
    urgency,
    description: buildDescription(message, normalizedMessage),
    suggestedNextStep: buildSuggestedNextStep(normalizedMessage, urgency)
  };
}
