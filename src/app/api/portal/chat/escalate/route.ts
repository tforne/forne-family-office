import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/session";
import { sendIncidentEmail } from "@/lib/mail/graph";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const session = await getPortalSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      message?: unknown;
      page?: unknown;
    };

    const message = clean(payload.message);
    const page = clean(payload.page);

    if (message.length < 6) {
      return NextResponse.json({ error: "La consulta es demasiado corta para enviarla por correo." }, { status: 400 });
    }

    await sendIncidentEmail({
      subject: "Consulta escalada desde chat del portal",
      text: [
        "Nueva consulta escalada desde el chat del portal.",
        "",
        `Usuario: ${session.email || "Sin email de sesion"}`,
        `Proveedor de autenticacion: ${session.provider || "-"}`,
        `Seccion del portal: ${page || "-"}`,
        "",
        "Consulta enviada por el usuario",
        message
      ].join("\n")
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Portal chat escalation email failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar el correo desde el chat." },
      { status: 500 }
    );
  }
}
