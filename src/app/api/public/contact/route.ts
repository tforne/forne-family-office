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
  const subject = clean(body.subject);
  const message = clean(body.message);

  if (!name) {
    return NextResponse.json({ error: "Indica tu nombre." }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Indica un correo electrónico válido." }, { status: 400 });
  }

  if (!subject) {
    return NextResponse.json({ error: "Indica un asunto." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json({ error: "Cuéntanos con algo más de detalle qué necesitas." }, { status: 400 });
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: "El mensaje no puede superar los 2000 caracteres." }, { status: 400 });
  }

  try {
    await sendIncidentEmail({
      subject: `Contacto web: ${subject}`,
      text: [
        "Nueva consulta enviada desde la página de contacto.",
        "",
        `Nombre: ${name}`,
        `Correo: ${email}`,
        `Asunto: ${subject}`,
        "",
        "Mensaje",
        message
      ].join("\n")
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form email failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar la consulta." },
      { status: 500 }
    );
  }
}
