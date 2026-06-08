import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { getIncidentById } from "@/lib/portal/incidents.service";
import { buildPostOperationIntelligence } from "@/lib/portal/post-operation-intelligence.service";
import { validateExistingIncidentAttachment } from "@/lib/portal/incident-attachment-validation";
import { uploadIncidentAttachment } from "@/lib/portal/incident-attachments.service";

type RouteContext = {
  params: {
    id: string;
  };
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function userFacingAttachmentError(error: unknown) {
  const message = error instanceof Error ? error.message : "No se ha podido subir el archivo.";

  if (
    message.includes("Debes seleccionar un archivo") ||
    message.includes("no es válido") ||
    message.includes("10 MB")
  ) {
    return { status: 400, message };
  }

  if (message.includes("requestId") || message.includes("BC_INCIDENT_ATTACHMENTS_ENDPOINT")) {
    return {
      status: 409,
      message:
        "Esta incidencia todavía no dispone de una ruta segura de adjuntos en Business Central. Puedes contactar con soporte mientras se habilita este flujo."
    };
  }

  if (/unauthorized|authorization|invalid token|authentication/i.test(message)) {
    return {
      status: 502,
      message: "No se ha podido validar el acceso al sistema de adjuntos. Inténtalo más tarde o contacta con soporte."
    };
  }

  return {
    status: 400,
    message: "No se ha podido subir el archivo a esta incidencia. Inténtalo de nuevo o contacta con soporte."
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const incidentId = decodeURIComponent(params.id || "").trim();
    if (!incidentId) {
      return NextResponse.json({ error: "No se ha indicado la incidencia." }, { status: 400 });
    }

    const formData = await request.formData();
    const incident = await getIncidentById(incidentId);
    if (!incident) {
      return NextResponse.json({ error: "No se ha encontrado la incidencia indicada." }, { status: 404 });
    }

    const file = await validateExistingIncidentAttachment(formData.get("file"));
    const comment = clean(formData.get("comment"));
    const upload = await uploadIncidentAttachment({
      incident,
      file,
      comment
    });

    const postOperation = buildPostOperationIntelligence({
      kind: "attachment_added",
      incident,
      commentText: comment
    });

    revalidatePath(`/portal/incidents/${encodeURIComponent(incident.id)}`);
    revalidatePath("/portal/incidents");

    return NextResponse.json({
      ok: true,
      attachment: {
        id: upload.attachmentId || file.fileName,
        filename: upload.filename || file.fileName
      },
      warning: upload.warning || undefined,
      postOperation
    });
  } catch (error) {
    console.error("[api/incidents/[id]/attachments] Upload failed.", error);
    const friendlyError = userFacingAttachmentError(error);
    return NextResponse.json({ error: friendlyError.message }, { status: friendlyError.status });
  }
}
