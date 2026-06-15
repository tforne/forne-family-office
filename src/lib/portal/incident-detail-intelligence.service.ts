import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { IncidentCommentDto } from "@/lib/dto/incident-comment.dto";
import type { IncidentAttachmentView } from "@/lib/portal/incident-attachments-view.service";
import { detectOperationalEscalation } from "@/lib/portal/escalation-detector.service";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";

export interface IncidentDetailIntelligence {
  title: string;
  detectedProblem?: string;
  operationalStatus?: string;
  priority?: string;
  urgency?: string;
  operationalRisk?: string;
  latestActivity?: string;
  recommendedNextStep?: string;
  repeatedIssue?: boolean;
  escalationLevel?: string;
  timelineSummary?: string[];
  relatedIncidents?: Array<{
    id: string;
    title: string;
    href: string;
  }>;
  actions?: Array<{
    type: string;
    label: string;
    href?: string;
    payload?: Record<string, unknown>;
  }>;
}

type BuildIncidentDetailIntelligenceInput = {
  incident: unknown;
  comments?: unknown[];
  attachments?: unknown[];
  relatedIncidents?: unknown[];
  propertyContext?: unknown;
};

function asIncident(value: unknown): IncidentDto | null {
  return value && typeof value === "object" ? (value as IncidentDto) : null;
}

function asComments(values: unknown[] | undefined): IncidentCommentDto[] {
  return (values || []).filter(
    (value): value is IncidentCommentDto =>
      Boolean(value) && typeof value === "object" && (value as IncidentCommentDto).isPublic !== false
  );
}

function asAttachments(values: unknown[] | undefined): IncidentAttachmentView[] {
  return (values || []).filter((value): value is IncidentAttachmentView => Boolean(value) && typeof value === "object");
}

function normalizeText(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return null;
  return value;
}

function asDate(value: string | null | undefined) {
  const cleaned = cleanDate(value);
  if (!cleaned) return null;
  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date) {
  const diff = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

function relativeDaysLabel(date: Date | null, now = new Date()) {
  if (!date) return "sin fecha visible";
  const days = daysBetween(date, now);
  if (days === 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

function priorityLabel(priority: string | null | undefined) {
  const normalized = (priority || "").trim().toLowerCase();
  if (normalized === "critical") return "Crítica";
  if (normalized === "high") return "Alta";
  if (normalized === "medium" || normalized === "normal") return "Media";
  if (normalized === "low") return "Baja";
  return priority?.trim() || "-";
}

function urgencyLabel(urgency: string | undefined) {
  if (urgency === "critical") return "Crítica";
  if (urgency === "high") return "Alta";
  if (urgency === "medium") return "Media";
  if (urgency === "low") return "Baja";
  return "Baja";
}

function escalationLabel(level: "none" | "watch" | "recommended" | "urgent") {
  if (level === "urgent") return "Urgente";
  if (level === "recommended") return "Atención recomendada";
  if (level === "watch") return "Seguimiento sensible";
  return "Sin escalado";
}

function isResolvedIncident(incident: IncidentDto) {
  return Boolean(cleanDate(incident.resolutionDate)) || incident.stateCode !== "Active";
}

function extractProblem(incident: IncidentDto) {
  return incident.title?.trim() || incident.description?.trim() || "Incidencia sin descripción visible";
}

function latestCommentDate(comments: IncidentCommentDto[]) {
  return comments
    .map((comment) => asDate(comment.commentDate || comment.createdAt))
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())[0] || null;
}

function latestAttachmentDate(attachments: IncidentAttachmentView[]) {
  return attachments
    .map((attachment) => asDate(attachment.uploadedAt))
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())[0] || null;
}

function incidentLastActivityDate(incident: IncidentDto, comments: IncidentCommentDto[], attachments: IncidentAttachmentView[]) {
  const dates = [
    latestCommentDate(comments),
    latestAttachmentDate(attachments),
    asDate(incident.modifiedOn),
    asDate(incident.followupBy),
    asDate(incident.incidentDate),
    asDate(incident.createdOn)
  ].filter((value): value is Date => Boolean(value));

  return dates.sort((left, right) => right.getTime() - left.getTime())[0] || null;
}

function isRelatedIncident(current: IncidentDto, candidate: IncidentDto) {
  if (!candidate || candidate.id === current.id) return false;

  const sameProperty =
    Boolean(current.fixedRealEstateNo && candidate.fixedRealEstateNo) &&
    current.fixedRealEstateNo === candidate.fixedRealEstateNo;
  const sameContract =
    Boolean(current.contractNo && candidate.contractNo) &&
    current.contractNo === candidate.contractNo;

  const currentTokens = new Set(
    normalizeText(`${current.title} ${current.description || ""}`)
      .split(" ")
      .filter((token) => token.length >= 5)
  );
  const candidateTokens = normalizeText(`${candidate.title} ${candidate.description || ""}`)
    .split(" ")
    .filter((token) => token.length >= 5);
  const overlap = candidateTokens.filter((token) => currentTokens.has(token)).length;

  return sameProperty || sameContract || overlap >= 2;
}

function operationalRiskLabel(params: {
  incident: IncidentDto;
  repeatedIssue: boolean;
  intentUrgency?: string;
  matchedSignals?: string[];
  escalationLevel: "none" | "watch" | "recommended" | "urgent";
}) {
  const normalizedDescription = normalizeText(`${params.incident.title} ${params.incident.description || ""}`);

  if (params.escalationLevel === "urgent" || params.intentUrgency === "critical") {
    return "Riesgo alto: posible incidencia crítica que requiere revisión prioritaria.";
  }

  if (/\b(vecino|filtracion|filtrando agua|fuga|agua)\b/.test(normalizedDescription) && params.repeatedIssue) {
    return "Posible filtración recurrente con impacto operativo en el mismo entorno.";
  }

  if (params.repeatedIssue) {
    return "Posible problema recurrente detectado en incidencias relacionadas del mismo inmueble o contrato.";
  }

  if (params.intentUrgency === "high") {
    return "Prioridad alta: conviene revisar pronto si la incidencia refleja toda la urgencia actual.";
  }

  if ((params.matchedSignals || []).includes("humedad")) {
    return "Riesgo moderado: puede tratarse de una incidencia persistente de humedad o filtración.";
  }

  return "Seguimiento operativo habitual según la información visible.";
}

function recommendedNextStep(params: {
  resolved: boolean;
  repeatedIssue: boolean;
  escalationLevel: "none" | "watch" | "recommended" | "urgent";
  hasComments: boolean;
  lastActivityDays: number | null;
}) {
  if (params.resolved) {
    return "Revisa la cronología y conserva esta ficha como referencia. Si el problema reaparece, añade contexto antes de abrir otro caso.";
  }

  if (params.escalationLevel === "urgent") {
    return "Contacta soporte o deja seguimiento adicional cuanto antes y confirma que la prioridad y el alcance del problema siguen bien reflejados.";
  }

  if (params.repeatedIssue) {
    return "Añade contexto sobre qué ha cambiado desde casos anteriores y revisa las incidencias relacionadas antes de duplicar gestiones.";
  }

  if (!params.hasComments) {
    return "Añade información adicional o fotografías actualizadas si el problema ha evolucionado desde el alta inicial.";
  }

  if (params.lastActivityDays !== null && params.lastActivityDays >= 7) {
    return "Revisa la próxima fecha de control y añade seguimiento si la situación continúa igual o ha empeorado.";
  }

  return "Revisa la cronología y aporta información adicional solo si hay cambios relevantes en la incidencia.";
}

function buildOperationalStatus(params: {
  incident: IncidentDto;
  resolved: boolean;
  createdDays: number | null;
  lastActivityDays: number | null;
  hasComments: boolean;
  escalationLevel: "none" | "watch" | "recommended" | "urgent";
}) {
  if (params.resolved) return "Resuelto recientemente";
  if (params.escalationLevel === "urgent") return "Urgente";
  if (params.escalationLevel === "recommended") return "Atención requerida";
  if (params.createdDays !== null && params.createdDays <= 2 && !params.hasComments) return "Nuevo";
  if (!params.hasComments) return "Pendiente de revisión";
  if (params.lastActivityDays !== null && params.lastActivityDays >= 7) return "Atención requerida";
  return "En seguimiento";
}

function timelineSummary(params: {
  incident: IncidentDto;
  comments: IncidentCommentDto[];
  attachments: IncidentAttachmentView[];
  resolved: boolean;
  now: Date;
}) {
  const createdAt = asDate(params.incident.incidentDate || params.incident.createdOn);
  const lastCommentAt = latestCommentDate(params.comments);
  const lastAttachmentAt = latestAttachmentDate(params.attachments);
  const followupAt = asDate(params.incident.followupBy || params.incident.expectedResolutionDate);
  const resolutionAt = asDate(params.incident.resolutionDate);
  const lines = [
    createdAt ? `Incidencia creada ${relativeDaysLabel(createdAt, params.now)}.` : "Incidencia sin fecha de apertura visible.",
    lastCommentAt
      ? `Último comentario añadido ${relativeDaysLabel(lastCommentAt, params.now)}.`
      : "Todavía no hay comentarios visibles en el seguimiento.",
    lastAttachmentAt
      ? `Último archivo adjuntado ${relativeDaysLabel(lastAttachmentAt, params.now)}.`
      : "No hay adjuntos visibles en esta incidencia.",
    followupAt
      ? `Próximo control visible ${relativeDaysLabel(followupAt, params.now)}.`
      : "No hay próxima fecha de control visible."
  ];

  if (params.resolved && resolutionAt) {
    lines.push(`Resolución registrada ${relativeDaysLabel(resolutionAt, params.now)}.`);
  } else if (!params.resolved) {
    lines.push("La incidencia sigue abierta en el portal.");
  }

  return lines;
}

function latestActivityLabel(params: {
  incident: IncidentDto;
  comments: IncidentCommentDto[];
  attachments: IncidentAttachmentView[];
  now: Date;
}) {
  const lastAttachmentAt = latestAttachmentDate(params.attachments);
  const lastCommentAt = latestCommentDate(params.comments);
  if (lastAttachmentAt && (!lastCommentAt || lastAttachmentAt.getTime() >= lastCommentAt.getTime())) {
    return `Archivo adjuntado ${relativeDaysLabel(lastAttachmentAt, params.now)}.`;
  }

  if (lastCommentAt) {
    return `Comentario añadido ${relativeDaysLabel(lastCommentAt, params.now)}.`;
  }

  const modifiedAt = asDate(params.incident.modifiedOn);
  if (modifiedAt) {
    return `Última actualización visible ${relativeDaysLabel(modifiedAt, params.now)}.`;
  }

  const createdAt = asDate(params.incident.incidentDate || params.incident.createdOn);
  return createdAt ? `Incidencia creada ${relativeDaysLabel(createdAt, params.now)}.` : "Sin actividad visible reciente.";
}

function buildActions(params: {
  resolved: boolean;
  escalationLevel: "none" | "watch" | "recommended" | "urgent";
  repeatedIssue: boolean;
}) {
  if (params.resolved) {
    return [
      {
        type: "view_related_incidents",
        label: "Ver incidencias relacionadas",
        href: "/portal/incidents"
      }
    ];
  }

  const actions = [
    {
      type: "append_comment",
      label: "Añadir comentario",
      href: "#incident-contact"
    },
    {
      type: "attach_photo",
      label: "Añadir foto",
      href: "#incident-contact",
      payload: {
        note: "Solicita añadir fotografías o adjúntalas cuando el flujo de soporte lo indique."
      }
    }
  ];

  if (params.escalationLevel === "recommended" || params.escalationLevel === "urgent" || params.repeatedIssue) {
    actions.push({
      type: "contact_support",
      label: "Contactar soporte",
      href: "#incident-contact"
    });
  }

  return actions;
}

export function buildIncidentDetailIntelligence(input: BuildIncidentDetailIntelligenceInput): IncidentDetailIntelligence {
  const incident = asIncident(input.incident);

  if (!incident) {
    return {
      title: "Resumen IA de incidencia",
      detectedProblem: "No hay datos suficientes para interpretar esta incidencia.",
      operationalStatus: "Pendiente de revisión",
      priority: "-",
      urgency: "Baja",
      operationalRisk: "Seguimiento operativo habitual según la información visible.",
      latestActivity: "Sin actividad visible reciente.",
      recommendedNextStep: "Revisa manualmente la ficha de la incidencia."
    };
  }

  const comments = asComments(input.comments);
  const attachments = asAttachments(input.attachments);
  const relatedIncidents = (input.relatedIncidents || [])
    .map(asIncident)
    .filter((value): value is IncidentDto => Boolean(value))
    .filter((candidate) => isRelatedIncident(incident, candidate));
  const repeatedIssue = relatedIncidents.length > 0;
  const now = new Date();
  const combinedText = [incident.title, incident.description || "", comments[0]?.commentText || ""].filter(Boolean).join(" ");
  const intent = detectPortalIntent(combinedText);
  const escalation = detectOperationalEscalation(
    combinedText,
    intent,
    repeatedIssue
      ? {
          isPotentialDuplicate: true,
          confidence: 0.7,
          summary: "Existen incidencias relacionadas en el mismo entorno.",
          matches: relatedIncidents.slice(0, 1).map((related) => ({
            id: related.id,
            incidentId: related.incidentId,
            title: related.title || related.incidentId || "Incidencia relacionada",
            similarity: 0.7,
            reason: "misma referencia operativa",
            href: `/portal/incidents/${encodeURIComponent(related.id)}`
          }))
        }
      : undefined
  );
  const resolved = isResolvedIncident(incident);
  const createdAt = asDate(incident.incidentDate || incident.createdOn);
  const lastActivityAt = incidentLastActivityDate(incident, comments, attachments);
  const createdDays = createdAt ? daysBetween(createdAt, now) : null;
  const lastActivityDays = lastActivityAt ? daysBetween(lastActivityAt, now) : null;

  return {
    title: "Resumen IA de incidencia",
    detectedProblem: extractProblem(incident),
    operationalStatus: buildOperationalStatus({
      incident,
      resolved,
      createdDays,
      lastActivityDays,
      hasComments: comments.length > 0,
      escalationLevel: escalation.level
    }),
    priority: priorityLabel(incident.priority),
    urgency: urgencyLabel(intent.urgency),
    operationalRisk: operationalRiskLabel({
      incident,
      repeatedIssue,
      intentUrgency: intent.urgency,
      matchedSignals: intent.matchedSignals,
      escalationLevel: escalation.level
    }),
    latestActivity: latestActivityLabel({
      incident,
      comments,
      attachments,
      now
    }),
    recommendedNextStep: recommendedNextStep({
      resolved,
      repeatedIssue,
      escalationLevel: escalation.level,
      hasComments: comments.length > 0,
      lastActivityDays
    }),
    repeatedIssue,
    escalationLevel: escalationLabel(escalation.level),
    timelineSummary: timelineSummary({
      incident,
      comments,
      attachments,
      resolved,
      now
    }),
    relatedIncidents: relatedIncidents.slice(0, 3).map((related) => ({
      id: related.id,
      title: related.title || related.incidentId || "Incidencia relacionada",
      href: `/portal/incidents/${encodeURIComponent(related.id)}`
    })),
    actions: buildActions({
      resolved,
      escalationLevel: escalation.level,
      repeatedIssue
    })
  };
}
