import Link from "next/link";

const contactItems = [
  { label: "Email", value: "office@forne.family", href: "mailto:office@forne.family" },
  { label: "Ubicación", value: "Barcelona, España" },
  { label: "Horario de atención", value: "Lun-Vie, 9:00-18:00" }
];

const clientFeatures = [
  "Consulta tus facturas y vencimientos",
  "Comunica incidencias del inmueble",
  "Revisa el estado de cada gestión",
  "Mantén comunicación con contexto"
];

export default function ContactSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="ffo-shell grid gap-14 lg:grid-cols-[1fr_0.92fr] lg:items-start">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Contacto</span>
          </div>

          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#003A6C] sm:text-[2.65rem]">
            Hablemos de tu alquiler o de la gestión de tu inmueble.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-[#605E5C]">
            Si quieres conocer nuestros servicios o necesitas más información, puedes contactarnos
            directamente. Nuestro equipo te responderá en menos de 24 horas.
          </p>

          <div className="mt-10 space-y-5">
            {contactItems.map((item) => {
              const content = (
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded bg-[#EFF6FC] text-[#0078D4]">
                    ●
                  </div>
                  <div>
                    <p className="text-xs text-[#A19F9D]">{item.label}</p>
                    <p className="text-sm font-semibold text-[#201F1E]">{item.value}</p>
                  </div>
                </div>
              );

              return item.href ? (
                <a key={item.label} href={item.href} className="block transition hover:opacity-80">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded bg-[#0078D4] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(0,120,212,0.85)] transition hover:bg-[#106EBE]"
            >
              Enviar consulta
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded border border-[#0078D4] px-7 py-3.5 text-sm font-medium text-[#0078D4] transition hover:bg-[#EFF6FC]"
            >
              Acceso clientes
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-[#003A6C] p-8 text-white shadow-[0_34px_74px_-36px_rgba(0,58,108,0.58)] lg:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#0078D4]/15 blur-3xl" />
          <h3 className="relative text-2xl font-semibold">¿Ya eres cliente?</h3>
          <p className="relative mt-3 text-sm leading-7 text-[#C8DCF0]">
            Accede a tu portal privado para gestionar tus facturas, incidencias y comunicaciones.
          </p>

          <div className="relative mt-8 grid gap-3">
            {clientFeatures.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#D9E8F6]">
                <span className="text-[#5BA7E0]">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="relative mt-8 inline-flex w-full items-center justify-center rounded bg-[#0078D4] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_20px_42px_-22px_rgba(0,120,212,0.9)] transition hover:bg-[#106EBE]"
          >
            Acceder al portal privado
          </Link>
          <p className="relative mt-3 text-center text-xs text-[#8CBFE8]">
            Acceso seguro para clientes registrados
          </p>
        </div>
      </div>
    </section>
  );
}
