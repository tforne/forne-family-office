import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortalSession } from "@/lib/auth/session";
import { sendIncidentEmail } from "@/lib/mail/graph";
import { env } from "@/lib/config/env";
import { syncIncidentRequestAttachments, type IncidentAttachmentInput } from "@/lib/portal/incident-attachment-sync.service";
import { createIncident } from "@/lib/portal/incident-create.service";
import { buildPostOperationIntelligence } from "@/lib/portal/post-operation-intelligence.service";

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isFile(value: FormDataEntryValue): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function contentTypeIsAllowed(contentType: string) {
  const normalized = contentType.trim().toLowerCase();
  return (
    normalized.startsWith("image/") ||
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain"
    ].includes(normalized)
  );
}

async function parseRequestBody(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.toLowerCase().includes("multipart/form-data")) {
    const formData = await req.formData();
    const body = Object.fromEntries(
      Array.from(formData.entries()).filter(([key, value]) => key !== "attachments" && typeof value === "string")
    );
    const attachments = formData
      .getAll("attachments")
      .filter(isFile)
      .filter((file) => file.size > 0);

    return { body, attachments };
  }

  const body = await req.json().catch(() => ({}));
  return { body, attachments: [] as File[] };
}

async function normalizeAttachments(files: File[]): Promise<IncidentAttachmentInput[]> {
  if (files.length > MAX_ATTACHMENTS) {
    throw new Error(`Puedes adjuntar como máximo ${MAX_ATTACHMENTS} archivos por petición.`);
  }

  const normalized: IncidentAttachmentInput[] = [];

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`El archivo ${file.name} supera el límite de 10 MB.`);
    }

    if (!contentTypeIsAllowed(file.type || "")) {
      throw new Error(`El formato del archivo ${file.name} no está permitido.`);
    }

    normalized.push({
      fileName: file.name || "adjunto",
      contentType: file.type || "application/octet-stream",
      bytes: new Uint8Array(await file.arrayBuffer())
    });
  }

  return normalized;
}

function userFacingCreateError(error: unknown) {
  const message = error instanceof Error ? error.message : "Error desconocido al registrar la incidencia.";
  const attachmentsEndpoint = env.bcIncidentRequestAttachmentsEndpoint || "tenantIncidentRequestAttachments";
  const lowerMessage = message.toLowerCase();

  function extractBusinessCentralDetail() {
    const propertyMatch = message.match(/Cannot find property '([^']+)'/i);
    if (propertyMatch) {
      return `Business Central no reconoce la propiedad ${propertyMatch[1]}.`;
    }

    const entityMatch = message.match(/Entity does not support insert/i);
    if (entityMatch) {
      return "La entidad no admite inserciones mediante POST.";
    }

    const methodMatch = message.match(/BadRequest_MethodNotAllowed/i);
    if (methodMatch) {
      return "El endpoint ha rechazado el método HTTP usado por el portal.";
    }

    const notFoundMatch = message.match(/404|not found/i);
    if (notFoundMatch) {
      return "El endpoint no existe o no está publicado con ese EntitySetName.";
    }

    const authMatch = message.match(/unauthorized|authorization|invalid token|authentication/i);
    if (authMatch) {
      return "Business Central ha rechazado la autenticación o los permisos de la aplicación.";
    }

    const bcJsonMatch = message.match(/"message"\s*:\s*"([^"]+)"/i);
    if (bcJsonMatch) {
      return `Detalle BC: ${bcJsonMatch[1]}`;
    }

    const bcTextMatch = message.match(/Business Central error \d+ \([^)]+\):\s*([\s\S]+)$/i);
    if (bcTextMatch) {
      const normalized = bcTextMatch[1].replace(/\s+/g, " ").trim();
      if (normalized) {
        return `Detalle BC: ${normalized.slice(0, 280)}`;
      }
    }

    return "";
  }

  function attachmentErrorWith(detail: string) {
    const bcDetail = extractBusinessCentralDetail();
    return `La petición se ha creado, pero Business Central no ha podido guardar los adjuntos en ${attachmentsEndpoint}. ${detail}${bcDetail ? ` ${bcDetail}` : ""}`;
  }

  if (message.includes("BadRequest_MethodNotAllowed") || message.includes("Entity does not support insert")) {
    if (message.includes(attachmentsEndpoint)) {
      return attachmentErrorWith(
        "El endpoint no permite inserción. Revisa que BC_INCIDENT_REQUEST_ATTACHMENTS_ENDPOINT apunte a una API Page con InsertAllowed=true y permisos de inserción."
      );
    }

    return "Business Central ha rechazado el alta porque el endpoint de incidencias no permite insertar registros. Revisa que BC_CREATE_INCIDENTS_ENDPOINT apunte a una API Page con InsertAllowed=true y permisos de inserción.";
  }

  if (message.includes(attachmentsEndpoint)) {
    if (lowerMessage.includes("404") || lowerMessage.includes("not found")) {
      return attachmentErrorWith(
        "El endpoint no existe o no está publicado. Revisa el EntitySetName real en Business Central y el valor de BC_INCIDENT_REQUEST_ATTACHMENTS_ENDPOINT."
      );
    }

    if (lowerMessage.includes("invalid token") || lowerMessage.includes("unauthorized") || lowerMessage.includes("authorization")) {
      return attachmentErrorWith(
        "Business Central ha rechazado la autenticación o los permisos. Revisa la aplicación de Entra y los permisos de la API/Page de adjuntos."
      );
    }

    if (
      lowerMessage.includes("contentbase64") ||
      lowerMessage.includes("requestid") ||
      lowerMessage.includes("filename") ||
      lowerMessage.includes("contenttype") ||
      lowerMessage.includes("cannot find property")
    ) {
      return attachmentErrorWith(
        "Los nombres de campo no coinciden con la API de adjuntos. La API debe aceptar requestId, fileName, contentType y contentBase64, o hay que adaptar el payload del portal."
      );
    }

    return attachmentErrorWith(
      "Revisa que BC_INCIDENT_REQUEST_ATTACHMENTS_ENDPOINT apunte a una API Page writable y que los nombres de campo coincidan con la API de adjuntos."
    );
  }

  return message;
}

function isAttachmentValidationError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return (
    message.includes("como máximo") ||
    message.includes("límite de 10 MB") ||
    message.includes("no está permitido")
  );
}

export async function POST(req: NextRequest) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Sesión no autenticada." }, { status: 401 });
  }

  const { body, attachments } = await parseRequestBody(req);
  const requestType = clean(body.requestType);
  const incidentId = clean(body.incidentId);
  const title = clean(body.title);
  const property = clean(body.property);
  const contractNo = clean(body.contractNo);
  const fixedRealEstateNo = clean(body.fixedRealEstateNo);
  const invoiceNo = clean(body.invoiceNo);
  const invoiceId = clean(body.invoiceId);
  const documentNo = clean(body.documentNo);
  const documentId = clean(body.documentId);
  const documentTitle = clean(body.documentTitle);
  const sourceNo = clean(body.sourceNo);
  const customerNo = clean(body.customerNo);
  const caseType = clean(body.caseType);
  const priority = clean(body.priority);
  const contactPhone = clean(body.contactPhone);
  const message = clean(body.message);

  if (requestType === "invoiceCopy") {
    if (!invoiceNo && !invoiceId) {
      return NextResponse.json({ error: "Faltan datos de la factura." }, { status: 400 });
    }

    const copyTitle = `Petición de copia de factura ${invoiceNo || invoiceId}`;
    const copyDescription = [
      "Se solicita copia de factura desde el portal.",
      "",
      `Factura: ${invoiceNo || "-"}`,
      `Id factura: ${invoiceId || "-"}`,
      `Cliente factura: ${customerNo || "-"}`,
      `Contrato: ${contractNo || "-"}`,
      message ? "" : undefined,
      message || undefined
    ].filter(Boolean).join("\n");

    try {
      const incident = await createIncident({
        title: copyTitle,
        description: copyDescription,
        caseType: "Request",
        priority: "Normal",
        contractNo,
        refDescription: `Factura ${invoiceNo || invoiceId}`,
        contactPhoneNo: ""
      });

      await sendIncidentEmail({
        subject: `Petición de copia de factura: ${invoiceNo || invoiceId}`,
        text: [
          "Se ha creado una petición de copia de factura desde el portal.",
          "",
          `Usuario: ${session.email || "Sin email de sesión"}`,
          `Proveedor de autenticación: ${session.provider || "-"}`,
          "",
          "Factura",
          `Número: ${invoiceNo || "-"}`,
          `Id: ${invoiceId || "-"}`,
          `Cliente: ${customerNo || "-"}`,
          `Contrato: ${incident.contractNo || contractNo || "-"}`,
          "",
          "Incidencia creada",
          `Referencia: ${incident.incidentId || incident.id || "Pendiente"}`,
          `Título: ${incident.title || copyTitle}`
        ].join("\n")
      });

      revalidatePath("/portal/incidents");

      return NextResponse.json({
        ok: true,
        incident,
        postOperation: buildPostOperationIntelligence({
          kind: "incident_created",
          incident,
          attachmentCount: 0
        })
      });
    } catch (error) {
      console.error("Invoice copy request failed:", error);
      return NextResponse.json(
        { error: userFacingCreateError(error) },
        { status: 500 }
      );
    }
  }

  if (requestType === "documentCopy") {
    if (!documentNo && !documentId) {
      return NextResponse.json({ error: "Faltan datos del documento." }, { status: 400 });
    }

    const copyTitle = `Petición de copia de documento ${documentNo || documentId}`;
    const copyDescription = [
      "Se solicita copia de documento desde el portal.",
      "",
      `Documento: ${documentNo || "-"}`,
      `Id documento: ${documentId || "-"}`,
      `Título: ${documentTitle || "-"}`,
      `Origen relacionado: ${sourceNo || "-"}`,
      message ? "" : undefined,
      message || undefined
    ].filter(Boolean).join("\n");

    try {
      const incident = await createIncident({
        title: copyTitle,
        description: copyDescription,
        caseType: "Request",
        priority: "Normal",
        refDescription: documentTitle || `Documento ${documentNo || documentId}`,
        contactPhoneNo: ""
      });

      await sendIncidentEmail({
        subject: `Petición de copia de documento: ${documentNo || documentId}`,
        text: [
          "Se ha creado una petición de copia de documento desde el portal.",
          "",
          `Usuario: ${session.email || "Sin email de sesión"}`,
          `Proveedor de autenticación: ${session.provider || "-"}`,
          "",
          "Documento",
          `Número: ${documentNo || "-"}`,
          `Id: ${documentId || "-"}`,
          `Título: ${documentTitle || "-"}`,
          `Origen relacionado: ${sourceNo || "-"}`,
          "",
          "Incidencia creada",
          `Referencia: ${incident.incidentId || incident.id || "Pendiente"}`,
          `Título: ${incident.title || copyTitle}`
        ].join("\n")
      });

      revalidatePath("/portal/incidents");

      return NextResponse.json({
        ok: true,
        incident,
        postOperation: buildPostOperationIntelligence({
          kind: "incident_created",
          incident,
          attachmentCount: 0
        })
      });
    } catch (error) {
      console.error("Document copy request failed:", error);
      return NextResponse.json(
        { error: userFacingCreateError(error) },
        { status: 500 }
      );
    }
  }

  if (requestType === "new") {
    if (!title) {
      return NextResponse.json({ error: "Indica un título para la incidencia." }, { status: 400 });
    }

    if (title.length > 120) {
      return NextResponse.json({ error: "El título no puede superar los 120 caracteres." }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "La descripción debe tener al menos 10 caracteres." }, { status: 400 });
    }

    if (message.length > 4000) {
      return NextResponse.json({ error: "La descripción no puede superar los 4000 caracteres." }, { status: 400 });
    }

    if (!contactPhone) {
      return NextResponse.json({ error: "Indica un teléfono de contacto." }, { status: 400 });
    }

    try {
      const normalizedAttachments = await normalizeAttachments(attachments);
      const incident = await createIncident({
        title,
        description: message,
        caseType,
        priority,
        contractNo,
        fixedRealEstateNo,
        refDescription: property,
        contactPhoneNo: contactPhone
      });
      let warning = "";

      if (normalizedAttachments.length > 0) {
        try {
          await syncIncidentRequestAttachments(incident.requestId || incident.id, normalizedAttachments);
        } catch (attachmentError) {
          console.error("Incident attachment sync failed:", attachmentError);
          warning = userFacingCreateError(attachmentError);
        }
      }

      await sendIncidentEmail({
        subject: `Nueva incidencia creada: ${incident.incidentId || title}`,
        text: [
          "Se ha creado una nueva incidencia desde el portal de clientes.",
          "",
          `Usuario: ${session.email || "Sin email de sesión"}`,
          `Proveedor de autenticación: ${session.provider || "-"}`,
          `Teléfono de contacto: ${contactPhone || "-"}`,
          "",
          "Incidencia",
          `Referencia: ${incident.incidentId || incident.id || "Pendiente"}`,
          `Título: ${incident.title || title}`,
          `Tipo: ${incident.caseType || caseType || "-"}`,
          `Prioridad: ${incident.priority || priority || "-"}`,
          `Inmueble: ${incident.refDescription || property || "-"}`,
          `Referencia inmueble: ${incident.fixedRealEstateNo || fixedRealEstateNo || "-"}`,
          `Contrato: ${incident.contractNo || contractNo || "-"}`,
          `Adjuntos: ${normalizedAttachments.length > 0 ? normalizedAttachments.map((file) => file.fileName).join(", ") : "-"}`,
          "",
          "Descripción",
          incident.description || message
        ].join("\n")
      });

      revalidatePath("/portal/incidents");

      return NextResponse.json({
        ok: true,
        incident,
        warning,
        postOperation: buildPostOperationIntelligence({
          kind: "incident_created",
          incident,
          attachmentCount: normalizedAttachments.length
        })
      });
    } catch (error) {
      console.error("New incident creation failed:", error);
      const technicalError = error instanceof Error ? error.message : "Error desconocido al registrar la incidencia.";
      const errorMessage = userFacingCreateError(error);

      if (isAttachmentValidationError(error)) {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

      try {
        await sendIncidentEmail({
          subject: `Error creando incidencia: ${title}`,
          text: [
            "No se ha podido crear una nueva incidencia en Business Central desde el portal de clientes.",
            "",
            `Usuario: ${session.email || "Sin email de sesión"}`,
            `Proveedor de autenticación: ${session.provider || "-"}`,
            `Teléfono de contacto: ${contactPhone || "-"}`,
            "",
            "Datos introducidos",
            `Título: ${title}`,
            `Tipo: ${caseType || "-"}`,
            `Prioridad: ${priority || "-"}`,
            `Inmueble: ${property || "-"}`,
            `Referencia inmueble: ${fixedRealEstateNo || "-"}`,
            `Contrato: ${contractNo || "-"}`,
            "",
            "Descripción",
            message,
            "",
            "Error técnico",
            technicalError
          ].join("\n")
        });
      } catch (mailError) {
        console.error("New incident failure email failed:", mailError);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  }

  if (!incidentId || !title) {
    return NextResponse.json({ error: "Faltan datos de la incidencia." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json({ error: "El mensaje debe tener al menos 10 caracteres." }, { status: 400 });
  }

  if (message.length > 4000) {
    return NextResponse.json({ error: "El mensaje no puede superar los 4000 caracteres." }, { status: 400 });
  }

  try {
    await sendIncidentEmail({
      subject: `Consulta incidencia ${incidentId}: ${title}`,
      text: [
        "Nueva consulta enviada desde el portal de clientes.",
        "",
        `Usuario: ${session.email || "Sin email de sesión"}`,
        `Proveedor de autenticación: ${session.provider || "-"}`,
        "",
        "Incidencia",
        `Referencia: ${incidentId}`,
        `Título: ${title}`,
        `Inmueble: ${property || "-"}`,
        `Contrato: ${contractNo || "-"}`,
        "",
        "Mensaje",
        message
      ].join("\n")
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Incident email failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar el correo." },
      { status: 500 }
    );
  }
}
