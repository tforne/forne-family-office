import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortalSession } from "@/lib/auth/session";
import { sendIncidentEmail } from "@/lib/mail/graph";
import { createIncident } from "@/lib/portal/incident-create.service";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function userFacingCreateError(error: unknown) {
  const message = error instanceof Error ? error.message : "Error desconocido al registrar la incidencia.";

  if (message.includes("BadRequest_MethodNotAllowed") || message.includes("Entity does not support insert")) {
    return "Business Central ha rechazado el alta porque el endpoint de incidencias no permite insertar registros. Revisa que BC_CREATE_INCIDENTS_ENDPOINT apunte a una API Page con InsertAllowed=true y permisos de inserción.";
  }

  return message;
}

export async function POST(req: NextRequest) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Sesión no autenticada." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const requestType = clean(body.requestType);
  const incidentId = clean(body.incidentId);
  const title = clean(body.title);
  const property = clean(body.property);
  const contractNo = clean(body.contractNo);
  const fixedRealEstateNo = clean(body.fixedRealEstateNo);
  const invoiceNo = clean(body.invoiceNo);
  const invoiceId = clean(body.invoiceId);
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
      message ? "" : undefined,
      message || undefined
    ].filter(Boolean).join("\n");

    try {
      const incident = await createIncident({
        title: copyTitle,
        description: copyDescription,
        caseType: "Request",
        priority: "Normal",
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
          "",
          "Incidencia creada",
          `Referencia: ${incident.incidentId || incident.id || "Pendiente"}`,
          `Título: ${incident.title || copyTitle}`
        ].join("\n")
      });

      revalidatePath("/portal/incidents");

      return NextResponse.json({ ok: true, incident });
    } catch (error) {
      console.error("Invoice copy request failed:", error);
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
          "",
          "Descripción",
          incident.description || message
        ].join("\n")
      });

      revalidatePath("/portal/incidents");

      return NextResponse.json({ ok: true, incident });
    } catch (error) {
      console.error("New incident creation failed:", error);
      const technicalError = error instanceof Error ? error.message : "Error desconocido al registrar la incidencia.";
      const errorMessage = userFacingCreateError(error);

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
