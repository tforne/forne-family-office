import type {
  PortalDuplicateIncidentDetection,
  PortalEscalationWarning,
  PortalOperationalSummary,
  PortalPropertyOperationalIntelligence
} from "@/lib/portal/chat-assistant";
import type { IntentDetectionResult } from "@/lib/portal/intent-detector.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";

export function buildIncidentOperationalSummary(
  message: string,
  intent: IntentDetectionResult,
  context?: PortalAIContext,
  duplicateIncident?: PortalDuplicateIncidentDetection,
  escalation?: PortalEscalationWarning
): PortalOperationalSummary {
  const propertyIntelligence = context?.propertyOperationalIntelligence;
  const title =
    intent.intent === "urgent_incident"
      ? "Resumen de la situación"
      : intent.intent === "maintenance_incident"
        ? "Resumen de la situación"
        : "Siguiente recomendación";

  const summaryParts = [
    propertyIntelligence?.summary || "",
    duplicateIncident?.isPotentialDuplicate ? duplicateIncident.summary : "",
    escalation?.level === "urgent" ? escalation.message : "",
    !propertyIntelligence && !duplicateIncident?.isPotentialDuplicate && intent.intent === "maintenance_incident"
      ? "No aparecen señales claras de incidencia duplicada en el historial visible."
      : ""
  ].filter(Boolean);

  const recommendedNextStep =
    escalation?.shouldEscalate
      ? "Revisar incidencias abiertas relacionadas y validar si conviene escalar o actualizar una ya existente."
      : duplicateIncident?.isPotentialDuplicate
        ? "Abrir primero la incidencia existente para comprobar si el caso ya está en seguimiento."
        : intent.intent === "maintenance_incident" || intent.intent === "urgent_incident"
          ? "Preparar la incidencia con el inmueble y el contrato correctos antes de enviarla."
          : "Seguir la ruta recomendada para esta consulta.";

  return {
    title,
    summary:
      summaryParts.join(" ") ||
      `Consulta recibida: ${message.trim()}. La mejor siguiente acción es revisar la ruta operativa sugerida antes de ejecutar nada.`,
    recommendedNextStep
  };
}

export function buildPropertyOperationalIntelligenceSummary(
  intelligence: PortalPropertyOperationalIntelligence
): string {
  if (intelligence.operationalStatus === "high_attention") {
    return `El inmueble ${intelligence.fixedRealEstateNo || intelligence.propertyLabel || "actual"} requiere atención alta y tiene ${intelligence.openIncidentCount} incidencia(s) abierta(s).`;
  }

  if (intelligence.operationalStatus === "active_attention") {
    return `El inmueble ${intelligence.fixedRealEstateNo || intelligence.propertyLabel || "actual"} ya tiene actividad operativa abierta que conviene revisar antes de duplicar gestiones.`;
  }

  return `No se observan incidencias abiertas relevantes para el inmueble ${intelligence.fixedRealEstateNo || intelligence.propertyLabel || "actual"}.`;
}
