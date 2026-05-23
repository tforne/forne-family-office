import { NextRequest, NextResponse } from "next/server";
import { sendIncidentEmail } from "@/lib/mail/graph";
import { defaultPublicLocale, getPublicCopy, isPublicLocale } from "@/lib/i18n/public";

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
  const localeValue = clean(body.locale);
  const locale = isPublicLocale(localeValue) ? localeValue : defaultPublicLocale;
  const localized = getPublicCopy(locale);

  if (!name) {
    return NextResponse.json({ error: localized.forms.errors.name }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: localized.forms.errors.email }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json({ error: localized.forms.errors.availabilityDetail }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json({ error: localized.forms.errors.availabilityTooLong }, { status: 400 });
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
      { error: error instanceof Error ? error.message : localized.forms.errors.availabilitySendError },
      { status: 500 }
    );
  }
}
