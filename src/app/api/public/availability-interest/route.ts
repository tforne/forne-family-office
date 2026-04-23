import { NextRequest, NextResponse } from "next/server";
import { sendIncidentEmail } from "@/lib/mail/graph";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = clean(body.name);
  const email = clean(body.email);
  const message = clean(body.message);

  if (!name) {
    return NextResponse.json({ error: "Indica tu nombre." }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Indica un correo electrónico válido." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json({ error: "Cuéntanos con algo más de detalle qué activo te interesa." }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json({ error: "El mensaje no puede superar los 1000 caracteres." }, { status: 400 });
  }

  try {
    await sendIncidentEmail({
      subject: `Interés en activos libres: ${name}`,
      text: [
        "Nueva solicitud enviada desde la página principal.",
        "",
        `Nombre: ${name}`,
        `Correo: ${email}`,
        "",
        "Mensaje",
        message
      ].join("\n")
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Availability interest email failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar la solicitud." },
      { status: 500 }
    );
  }
}
