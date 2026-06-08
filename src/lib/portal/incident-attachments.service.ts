import { bcPostForCompany } from "@/lib/bc/client";
import { env } from "@/lib/config/env";
import type { IncidentDto } from "@/lib/dto/incident.dto";
import { prepareIncidentComment } from "@/lib/portal/incident-comment-draft.service";
import { syncIncidentRequestAttachments, type IncidentAttachmentInput } from "@/lib/portal/incident-attachment-sync.service";
import { createIncidentComment } from "@/lib/portal/incident-comments.service";
import { resolvePortalUserContext } from "@/lib/portal/user-context";

export interface ExistingIncidentAttachmentInput {
  incident: IncidentDto;
  file: IncidentAttachmentInput;
  comment?: string;
}

export async function uploadIncidentAttachment(input: ExistingIncidentAttachmentInput): Promise<{
  ok: boolean;
  attachmentId?: string;
  filename?: string;
  warning?: string;
}> {
  const incident = input.incident;
  const file = input.file;
  const preparedComment = prepareIncidentComment(input.comment || "");
  let warning = "";

  if (env.useMockApi) {
    if (preparedComment.isValid) {
      await createIncidentComment({
        incidentId: incident.id,
        incidentNo: incident.incidentId || incident.id,
        comment: preparedComment.comment
      });
    }

    return {
      ok: true,
      attachmentId: `mock-attachment-${Date.now()}`,
      filename: file.fileName,
      warning
    };
  }

  if (incident.requestId?.trim()) {
    await syncIncidentRequestAttachments(incident.requestId.trim(), [file]);
  } else if (env.bcIncidentAttachmentsEndpoint?.trim()) {
    const user = await resolvePortalUserContext();

    await bcPostForCompany(
      { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
      env.bcIncidentAttachmentsEndpoint.trim(),
      {
        incidentId: incident.id,
        incidentNo: incident.incidentId,
        fileName: file.fileName,
        contentType: file.contentType,
        contentBase64: Buffer.from(file.bytes).toString("base64")
      }
    );
  } else {
    throw new Error(
      "Esta incidencia no expone todavía una referencia segura para adjuntos. Necesitamos requestId o BC_INCIDENT_ATTACHMENTS_ENDPOINT para subir archivos sin riesgo."
    );
  }

  if (preparedComment.isValid) {
    try {
      await createIncidentComment({
        incidentId: incident.id,
        incidentNo: incident.incidentId || incident.id,
        comment: preparedComment.comment
      });
    } catch {
      warning = "El archivo se ha subido, pero no se ha podido guardar el comentario opcional.";
    }
  }

  return {
    ok: true,
    attachmentId: file.fileName,
    filename: file.fileName,
    warning
  };
}
