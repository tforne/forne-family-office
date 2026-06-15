import type {
  PortalAction,
  PortalDuplicateIncidentDetection,
  PortalEscalationWarning,
  PortalIncidentDraft,
  PortalOperationalRouting
} from "@/lib/portal/chat-assistant";
import type { IntentDetectionResult } from "@/lib/portal/intent-detector.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";

export function buildOperationalRouting(
  intent: IntentDetectionResult,
  duplicateIncident?: PortalDuplicateIncidentDetection,
  escalation?: PortalEscalationWarning,
  context?: PortalAIContext
): PortalOperationalRouting {
  if (duplicateIncident?.isPotentialDuplicate && duplicateIncident.matches[0]) {
    return {
      destination: "incident_detail",
      href: duplicateIncident.matches[0].href,
      label: "Revisar incidencia ya abierta",
      reason: "Parece que este caso ya está en seguimiento y conviene revisarlo antes de abrir otro.",
      queue: intent.urgency === "high" || intent.urgency === "critical" ? "urgent" : "maintenance"
    };
  }

  switch (intent.intent) {
    case "urgent_incident":
    case "maintenance_incident":
      return {
        destination: "incidents",
        href: "/portal/incidents",
        label: escalation?.shouldEscalate ? "Revisar incidencias y posible escalado" : "Ir a incidencias",
        reason: "La mejor siguiente acción es revisar o preparar la incidencia desde el portal.",
        queue: intent.intent === "urgent_incident" ? "urgent" : "maintenance"
      };
    case "invoice_question":
      return {
        destination: "invoices",
        href: "/portal/invoices",
        label: "Revisar facturas",
        reason: "La consulta encaja mejor en la sección de facturación.",
        queue: "billing"
      };
    case "contract_question":
      return {
        destination: "contracts",
        href: "/portal/contracts",
        label: "Revisar contratos",
        reason: "La consulta requiere revisar contexto contractual.",
        queue: "contract"
      };
    case "document_request":
      return {
        destination: "documents",
        href: "/portal/documents",
        label: "Revisar documentos",
        reason: "La mejor ruta es la sección documental del portal.",
        queue: "documents"
      };
    case "service_recommendation":
      return {
        destination: "services",
        href: "/portal/services",
        label: "Revisar servicios",
        reason: "La consulta encaja mejor con los servicios visibles del inmueble.",
        queue: "support"
      };
    case "support_request":
      return {
        destination: "support",
        href: context?.page || "/portal",
        label: "Seguir con soporte",
        reason: "La consulta requiere orientación o soporte humano más que una operación estructurada.",
        queue: "support"
      };
    default:
      return {
        destination: "portal_home",
        href: "/portal",
        label: "Volver al portal",
        reason: "No se detecta una ruta operativa más específica.",
        queue: "general"
      };
  }
}

export function buildOperationalRoutingActions(
  routing: PortalOperationalRouting,
  duplicateIncident?: PortalDuplicateIncidentDetection,
  options?: {
    message?: string;
    incidentDraft?: PortalIncidentDraft | null;
  }
): PortalAction[] {
  if (duplicateIncident?.isPotentialDuplicate && duplicateIncident.matches[0]) {
    const primaryMatch = duplicateIncident.matches[0];
    const href = primaryMatch.href || `/portal/incidents/${primaryMatch.incidentId || primaryMatch.id}`;

    return [
      {
        type: "view_incident",
        label: "Ver incidencia existente",
        payload: {
          href,
          incidentId: primaryMatch.incidentId || primaryMatch.id
        }
      },
      {
        type: "append_comment",
        label: "Añadir comentario",
        payload: {
          href,
          incidentId: primaryMatch.incidentId || primaryMatch.id,
          incidentTitle: primaryMatch.title,
          suggestedComment: options?.message?.trim() || ""
        }
      },
      {
        type: "create_anyway",
        label: "Crear nueva incidencia igualmente",
        payload: {
          href: "/portal/incidents",
          incidentDraft: options?.incidentDraft || null,
          duplicateIncidentId: primaryMatch.incidentId || primaryMatch.id
        }
      }
    ];
  }

  const actions: PortalAction[] = [
    {
      type: routing.destination === "incident_detail" ? "view_incident" : "follow_operational_route",
      label: routing.label,
      payload: {
        href: routing.href,
        destination: routing.destination,
        queue: routing.queue
      }
    }
  ];

  if (duplicateIncident?.matches.length) {
    actions.push(
      ...duplicateIncident.matches.slice(0, 2).map((match) => ({
        type: "view_incident",
        label: `Ver incidencia ${match.incidentId || match.title}`,
        payload: {
          href: match.href || `/portal/incidents/${match.incidentId || match.id}`,
          incidentId: match.incidentId || match.id
        }
      }))
    );
  }

  return actions;
}
