import type {
  PortalEscalationWarning,
  PortalIntentMetadata,
  PortalIntentType,
  PortalIntentUrgency,
  PortalOperationalRouting
} from "@/lib/portal/chat-assistant";

const intentLabels: Record<PortalIntentType, string> = {
  maintenance_incident: "Incidencia de mantenimiento",
  urgent_incident: "Incidencia urgente",
  invoice_question: "Consulta de factura",
  contract_question: "Consulta de contrato",
  document_request: "Solicitud de documento",
  support_request: "Soporte",
  general_chat: "Consulta general"
};

const urgencyLabels: Record<PortalIntentUrgency, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica"
};

const escalationLabels: Record<PortalEscalationWarning["level"], string> = {
  none: "Sin escalado",
  watch: "En observación",
  recommended: "Revisión recomendada",
  urgent: "Urgente"
};

export function portalIntentLabel(intent: PortalIntentType | PortalIntentMetadata["type"]) {
  return intentLabels[intent];
}

export function portalUrgencyLabel(urgency: PortalIntentUrgency | undefined) {
  return urgency ? urgencyLabels[urgency] : "Baja";
}

export function portalEscalationLabel(level: PortalEscalationWarning["level"] | undefined) {
  return level ? escalationLabels[level] : escalationLabels.none;
}

export function portalRoutingLabel(routing: PortalOperationalRouting | undefined) {
  if (!routing) return "Ruta sugerida";
  return routing.label;
}
