import { NextRequest, NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { sendIncidentEmail } from "@/lib/mail/graph";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Sesión no autenticada." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const incidentId = clean(body.incidentId);
  const title = clean(body.title);
  const property = clean(body.property);
  const contractNo = clean(body.contractNo);
  const message = clean(body.message);

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
