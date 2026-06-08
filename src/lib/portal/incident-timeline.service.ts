import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { IncidentCommentDto } from "@/lib/dto/incident-comment.dto";
import type { IncidentAttachmentView } from "@/lib/portal/incident-attachments-view.service";

export type IncidentTimelineEntryType =
  | "created"
  | "comment"
  | "attachment"
  | "status"
  | "updated"
  | "system";

export interface IncidentTimelineEntry {
  id: string;
  type: IncidentTimelineEntryType;
  title: string;
  description?: string;
  occurredAt?: string;
  actorLabel?: string;
  href?: string;
  metadata?: Record<string, unknown>;
}

type BuildIncidentTimelineInput = {
  incident: unknown;
  comments?: unknown[];
  attachments?: unknown[];
  statusHistory?: unknown[];
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function sanitizeText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanDate(value: string | null | undefined) {
  const trimmed = (value || "").trim();
  if (!trimmed || trimmed.startsWith("0001-01-01")) return undefined;
  return trimmed;
}

function parseDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function eventTimestamp(entry: IncidentTimelineEntry) {
  return parseDate(entry.occurredAt)?.getTime() ?? Number.NEGATIVE_INFINITY;
}

function commentEntries(values: unknown[]) {
  return values
    .map((value) => {
      const comment = value as IncidentCommentDto;
      const occurredAt = cleanDate(comment.commentDate || comment.createdAt);
      const description = sanitizeText(comment.commentText || "");

      if (!description && !occurredAt) return null;

      return {
        id: comment.id || `comment-${comment.incidentNo || "incident"}-${comment.entryNo || occurredAt || "entry"}`,
        type: "comment" as const,
        title: "Comentario añadido",
        description: description || undefined,
        occurredAt,
        actorLabel: sanitizeText(comment.createdBy || comment.source || "Portal"),
        metadata: {
          incidentNo: comment.incidentNo,
          isPublic: comment.isPublic
        }
      };
    })
    .filter(Boolean) as IncidentTimelineEntry[];
}

function attachmentEntries(values: unknown[]) {
  return values
    .map((value) => {
      const attachment = value as IncidentAttachmentView;
      const filename = sanitizeText(attachment.filename || "");
      if (!filename) return null;

      return {
        id: attachment.id || `attachment-${filename}`,
        type: "attachment" as const,
        title: `Archivo adjuntado: ${filename}`,
        description: attachment.contentType || attachment.sizeLabel || undefined,
        occurredAt: cleanDate(attachment.uploadedAt),
        actorLabel: sanitizeText(attachment.uploadedBy || "Portal"),
        href: attachment.href,
        metadata: {
          contentType: attachment.contentType,
          sizeLabel: attachment.sizeLabel
        }
      };
    })
    .filter(Boolean) as IncidentTimelineEntry[];
}

function incidentBaseEntries(incident: IncidentDto) {
  const entries: IncidentTimelineEntry[] = [];
  const createdAt = cleanDate(incident.incidentDate || incident.createdOn);
  const createdTitle = incident.title ? `Incidencia creada: ${sanitizeText(incident.title)}` : "Incidencia creada";

  if (createdAt) {
    entries.push({
      id: `created-${incident.id}`,
      type: "created",
      title: createdTitle,
      description: sanitizeText(incident.description || "") || undefined,
      occurredAt: createdAt,
      metadata: {
        statusCode: incident.statusCode,
        stateCode: incident.stateCode
      }
    });
  }

  const followupAt = cleanDate(incident.followupBy);
  if (followupAt) {
    entries.push({
      id: `followup-${incident.id}-${followupAt}`,
      type: "system",
      title: "Seguimiento programado",
      description: "Existe una fecha de control visible para esta incidencia.",
      occurredAt: followupAt
    });
  }

  const resolvedAt = cleanDate(incident.resolutionDate);
  if (resolvedAt) {
    entries.push({
      id: `resolved-${incident.id}-${resolvedAt}`,
      type: "status",
      title: `Estado actualizado: ${sanitizeText(incident.stateCode || "Resuelta")}`,
      description: sanitizeText(incident.statusCode || "") || "La incidencia figura como resuelta en el portal.",
      occurredAt: resolvedAt
    });
  } else {
    const modifiedAt = cleanDate(incident.modifiedOn);
    if (modifiedAt) {
      entries.push({
        id: `updated-${incident.id}-${modifiedAt}`,
        type: "updated",
        title: "Ficha actualizada",
        description: sanitizeText(incident.statusCode || incident.stateCode || "") || undefined,
        occurredAt: modifiedAt
      });
    }
  }

  return entries;
}

function statusHistoryEntries(values: unknown[]) {
  return values
    .map((value, index) => {
      const record = toRecord(value);
      if (!record) return null;
      const title = sanitizeText(
        String(record.title || record.label || record.status || record.state || "Estado actualizado")
      );
      const description = sanitizeText(String(record.description || record.note || record.reason || ""));
      const occurredAt = cleanDate(String(record.occurredAt || record.date || record.createdAt || record.modifiedOn || ""));

      if (!title && !occurredAt) return null;

      return {
        id: sanitizeText(String(record.id || record.entryNo || `status-${index}`)),
        type: "status" as const,
        title,
        description: description || undefined,
        occurredAt,
        actorLabel: sanitizeText(String(record.actorLabel || record.createdBy || record.source || "")) || undefined
      };
    })
    .filter(Boolean) as IncidentTimelineEntry[];
}

export function buildIncidentTimeline(input: BuildIncidentTimelineInput): IncidentTimelineEntry[] {
  const incident = input.incident as IncidentDto | null;
  const combined: IncidentTimelineEntry[] = [];

  if (incident && typeof incident === "object") {
    combined.push(...incidentBaseEntries(incident));
  }

  combined.push(...commentEntries(input.comments || []));
  combined.push(...attachmentEntries(input.attachments || []));
  combined.push(...statusHistoryEntries(input.statusHistory || []));

  const deduped = new Map<string, IncidentTimelineEntry>();
  for (const entry of combined) {
    const key = [
      entry.type,
      entry.title.toLowerCase(),
      (entry.occurredAt || "").toLowerCase(),
      (entry.description || "").toLowerCase()
    ].join("::");
    if (!deduped.has(key)) {
      deduped.set(key, entry);
    }
  }

  return Array.from(deduped.values()).sort((left, right) => eventTimestamp(right) - eventTimestamp(left));
}
