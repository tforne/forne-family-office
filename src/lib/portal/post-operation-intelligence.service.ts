type IncidentSnapshot = {
  id: string;
  incidentId?: string | null;
  title?: string | null;
  priority?: string | null;
  contractNo?: string | null;
  refDescription?: string | null;
  fixedRealEstateNo?: string | null;
};

export type PortalPostOperationAction = {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
};

export type PortalPostOperationLink = {
  href: string;
  label: string;
};

export type PortalPostOperationIntelligence = {
  kind: "incident_created" | "incident_commented" | "attachment_added";
  title: string;
  summary: string;
  recommendedNextStep?: string;
  checklist: string[];
  actions: PortalPostOperationAction[];
  links: PortalPostOperationLink[];
};

type BuildPostOperationIntelligenceInput = {
  kind: "incident_created" | "incident_commented" | "attachment_added";
  incident: IncidentSnapshot;
  attachmentCount?: number;
  commentText?: string;
};

function normalizePriority(priority: string | null | undefined) {
  return (priority || "").trim().toLowerCase();
}

function isHighAttentionPriority(priority: string | null | undefined) {
  const normalized = normalizePriority(priority);
  return normalized === "high" || normalized === "critical";
}

function incidentReference(incident: IncidentSnapshot) {
  return incident.incidentId || incident.id;
}

function incidentHref(incident: IncidentSnapshot) {
  return `/portal/incidents/${encodeURIComponent(incident.id)}`;
}

function incidentLabel(incident: IncidentSnapshot) {
  return incident.title?.trim() || `Incidencia ${incidentReference(incident)}`;
}

function baseChecklist(incident: IncidentSnapshot) {
  const checklist = [
    "Revisa la ficha de la incidencia para confirmar el seguimiento visible en el portal."
  ];

  if (incident.contractNo) {
    checklist.push(`Ten a mano el contrato ${incident.contractNo} si el equipo necesita validar contexto adicional.`);
  }

  return checklist;
}

export function buildPostOperationIntelligence(
  input: BuildPostOperationIntelligenceInput
): PortalPostOperationIntelligence {
  const href = incidentHref(input.incident);
  const reference = incidentReference(input.incident);
  const title = incidentLabel(input.incident);
  const checklist = baseChecklist(input.incident);

  if (input.kind === "incident_created") {
    if ((input.attachmentCount || 0) === 0) {
      checklist.push("Si más tarde consigues fotos o detalles concretos, añádelos manualmente como seguimiento.");
    } else {
      checklist.push("Comprueba en la ficha que el caso tiene el contexto suficiente para evitar nuevas aclaraciones.");
    }

    if (isHighAttentionPriority(input.incident.priority)) {
      checklist.push("Si la situación empeora o afecta a seguridad, actualiza la incidencia cuanto antes desde su seguimiento.");
    }

    return {
      kind: "incident_created",
      title: "Seguimiento recomendado",
      summary: `La incidencia ${reference} ya ha quedado registrada como "${title}". Ahora lo más útil es revisar su ficha y dejar preparado cualquier contexto adicional que quieras aportar después.`,
      recommendedNextStep: isHighAttentionPriority(input.incident.priority)
        ? "Abre la incidencia y verifica que la prioridad, el inmueble y el teléfono de contacto reflejan bien la urgencia actual."
        : "Abre la incidencia y comprueba que el título, la descripción y el inmueble asociado resumen bien el problema.",
      checklist,
      actions: [
        {
          type: "view_incident",
          label: "Ver incidencia creada",
          payload: {
            incidentId: reference,
            href
          }
        }
      ],
      links: [
        { href, label: "Abrir incidencia creada" },
        { href: "/portal/incidents", label: "Volver a incidencias" }
      ]
    };
  }

  if (input.kind === "attachment_added") {
    checklist.push("Comprueba si la nueva documentación ya cubre lo que el equipo necesita para revisar el caso.");

    if ((input.commentText || "").trim()) {
      checklist.push("El seguimiento adicional ya acompaña al archivo cuando ha sido posible guardarlo junto con la incidencia.");
    }

    return {
      kind: "attachment_added",
      title: "Archivo añadido correctamente",
      summary: `La incidencia ${reference} se ha actualizado con documentación adicional para "${title}".`,
      recommendedNextStep: "El equipo tendrá más información para revisar el caso. Puedes volver a la ficha, añadir otro archivo o completar el seguimiento con un comentario.",
      checklist,
      actions: [
        {
          type: "view_incident",
          label: "Ver incidencia",
          payload: {
            incidentId: reference,
            href
          }
        },
        {
          type: "add_another_attachment",
          label: "Añadir otro archivo",
          payload: {
            incidentId: reference,
            href
          }
        },
        {
          type: "append_comment",
          label: "Añadir comentario",
          payload: {
            incidentId: reference,
            href,
            incidentTitle: title,
            suggestedComment: ""
          }
        }
      ],
      links: [
        { href, label: "Ver incidencia actualizada" },
        { href: "/portal/incidents", label: "Volver a incidencias" }
      ]
    };
  }

  const hasDetailedComment = (input.commentText || "").trim().length >= 40;
  if (!hasDetailedComment) {
    checklist.push("Si necesitas completar el seguimiento, añade fechas, zonas afectadas o cambios desde la última revisión.");
  } else {
    checklist.push("Si aparecen nuevos daños o cambian las condiciones, podrás añadir otro comentario manualmente.");
  }

  if (isHighAttentionPriority(input.incident.priority)) {
    checklist.push("En incidencias prioritarias conviene revisar pronto si ya hay respuesta o nueva fecha de seguimiento.");
  }

  return {
    kind: "incident_commented",
    title: "Seguimiento actualizado",
    summary: `Tu comentario se ha añadido a ${reference}. El siguiente paso recomendado es revisar la ficha de "${title}" y confirmar que el caso sigue reflejando la situación actual.`,
    recommendedNextStep: hasDetailedComment
      ? "Abre la incidencia para revisar el historial y decidir si necesitas aportar algo más."
      : "Abre la incidencia y, si hace falta, prepara un segundo comentario con datos más concretos antes de seguir.",
    checklist,
    actions: [
      {
        type: "view_incident",
        label: "Ver incidencia actualizada",
        payload: {
          incidentId: reference,
          href
        }
      },
      {
        type: "append_comment",
        label: "Añadir más seguimiento",
        payload: {
          incidentId: reference,
          href,
          incidentTitle: title,
          suggestedComment: ""
        }
      }
    ],
    links: [
      { href, label: "Abrir incidencia actualizada" },
      { href: "/portal/incidents", label: "Ver todas las incidencias" }
    ]
  };
}
