import type { PortalEscalationWarning } from "@/lib/portal/chat-assistant";
import type { PortalDuplicateIncidentDetection } from "@/lib/portal/chat-assistant";
import type { IntentDetectionResult } from "@/lib/portal/intent-detector.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectOperationalEscalation(
  message: string,
  intent?: IntentDetectionResult,
  duplicateIncident?: PortalDuplicateIncidentDetection,
  context?: PortalAIContext
): PortalEscalationWarning {
  const normalizedMessage = normalizeText(message);
  const reasons: string[] = [];
  let level: PortalEscalationWarning["level"] = "none";

  const isIncidentIntent = intent?.intent === "maintenance_incident" || intent?.intent === "urgent_incident";

  if (intent?.urgency === "critical") {
    level = "urgent";
    reasons.push("la urgencia detectada es crítica");
  } else if (intent?.urgency === "high") {
    level = "recommended";
    reasons.push("la urgencia detectada es alta");
  }

  if (/\b(sigue igual|otra vez|de nuevo|nadie|sin respuesta|lleva dias|lleva semanas|todavia|todavía)\b/.test(normalizedMessage)) {
    if (level === "none") level = "watch";
    reasons.push("el mensaje sugiere falta de resolución o reincidencia");
  }

  if (duplicateIncident?.isPotentialDuplicate) {
    if (level === "none" || level === "watch") level = "recommended";
    reasons.push("ya existe una incidencia parecida en seguimiento");
  }

  if (context?.propertyOperationalIntelligence?.operationalStatus === "high_attention") {
    if (level === "none") level = "watch";
    reasons.push("el inmueble ya tiene varias incidencias abiertas");
  }

  if (!isIncidentIntent && level === "none") {
    return {
      shouldEscalate: false,
      level: "none",
      message: "No vemos señales de escalado operativo para esta consulta.",
      reasons: []
    };
  }

  if (level === "urgent") {
    return {
      shouldEscalate: true,
      level,
      message: "Esta situación requiere revisión humana prioritaria. Antes de abrir un nuevo caso, conviene validar si debe escalarse de inmediato.",
      reasons
    };
  }

  if (level === "recommended") {
    return {
      shouldEscalate: true,
      level,
      message: "Te recomendamos revisar el historial y valorar apoyo humano antes de duplicar gestiones o dejar la incidencia sin seguimiento.",
      reasons
    };
  }

  if (level === "watch") {
    return {
      shouldEscalate: false,
      level,
      message: "Hay señales de seguimiento sensible. Puede ser útil revisar incidencias abiertas relacionadas antes de continuar.",
      reasons
    };
  }

  return {
    shouldEscalate: false,
    level,
    message: "No se detecta escalado operativo adicional por ahora.",
    reasons
  };
}
