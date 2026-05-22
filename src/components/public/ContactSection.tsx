import Link from "next/link";

const contactItems = [
  { label: "Email", value: "office@forne.family", href: "mailto:office@forne.family" },
  { label: "Ubicación", value: "Barcelona, España" },
  { label: "Disponibilidad", value: "Lun-Vie, 9:00-18:00" }
];

const clientFeatures = [
  "Facturas y vencimientos visibles",
  "Incidencias con seguimiento ordenado",
  "Comunicaciones con contexto"
];

const responsePoints = [
  "Consultas sobre disponibilidad",
  "Información sobre gestión residencial y comercial",
  "Acceso o soporte para clientes ya registrados en el portal"
];

export default function ContactSection() {
  return (
    <section className="bg-white pb-16 pt-5 lg:pb-20 lg:pt-8">
      <div className="ffo-shell grid gap-16 lg:grid-cols-[1fr_0.92fr] lg:items-start">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Contacto</span>
          </div>

          <h2 className="max-w-[14ch] text-4xl font-semibold tracking-[-0.02em] text-[#10233A] sm:text-[2.65rem]">
            Una conversación directa, discreta y bien atendida.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-[#5A6675]">
            Si quieres conocer disponibilidad, resolver una cuestión operativa o entender mejor
            nuestro enfoque de gestión, puedes escribirnos directamente. Priorizamos respuestas
            claras y una interlocución cuidada desde el primer contacto.
          </p>

          <div className="mt-10 space-y-5">
            {contactItems.map((item) => {
              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#F4EEE4] text-[#B89B6D]">
                    ●
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8B95A2]">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-semibold text-[#16202C] transition hover:opacity-80">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-[#16202C]">{item.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-[24px] border border-[rgba(22,32,44,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,249,251,0.9)_100%)] p-6 shadow-[0_16px_36px_-30px_rgba(10,25,44,0.14)]">
            <div className="text-sm font-semibold text-[#10233A]">Podemos ayudarte con</div>
            <div className="mt-4 grid gap-3">
              {responsePoints.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-[#5A6675]">
                  <span className="mt-1 text-[#B89B6D]">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="ffo-button-primary inline-flex items-center justify-center rounded-[16px] px-7 py-3.5 text-sm font-semibold text-white transition hover:brightness-[1.03]"
            >
              Escribirnos
            </Link>
            <Link
              href="/login"
              className="ffo-button-secondary inline-flex items-center justify-center rounded-[16px] px-7 py-3.5 text-sm font-medium text-[#10233A] transition hover:border-[#B89B6D] hover:bg-white"
            >
              Acceso clientes
            </Link>
          </div>
        </div>

        <div className="ffo-premium-frame relative rounded-[30px] p-8 text-white lg:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#B89B6D]/14 blur-3xl" />
          <h3 className="relative text-2xl font-semibold">¿Ya eres cliente?</h3>
          <p className="relative mt-3 text-sm leading-7 text-[#D2D9E1]">
            Accede a tu portal privado para revisar facturas, incidencias y comunicaciones en un
            entorno claro y seguro.
          </p>

          <div className="relative mt-8 grid gap-3">
            {clientFeatures.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#E7ECF2]">
                <span className="text-[#D5C0A0]">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="relative mt-8 inline-flex w-full items-center justify-center rounded-[16px] bg-white px-7 py-3.5 text-sm font-semibold text-[#10233A] shadow-[0_20px_42px_-24px_rgba(0,0,0,0.34)] transition hover:bg-[#F7F5F1]"
          >
            Entrar al área privada
          </Link>
          <p className="relative mt-3 text-center text-xs text-[#C3CCD6]">
            Acceso seguro para clientes registrados
          </p>
        </div>
      </div>
    </section>
  );
}
