import BrandIcon from "@/components/brand/BrandIcon";

const services = [
  {
    title: "Interlocución serena",
    description:
      "Una relación directa, discreta y bien acompañada durante toda la gestión.",
    accent: "#B89B6D",
    icon: "attention" as const
  },
  {
    title: "Visibilidad ordenada",
    description:
      "Facturas, avisos e incidencias reunidos en un entorno claro y fácil de seguir.",
    accent: "#7F97AF",
    icon: "clarity" as const
  },
  {
    title: "Continuidad real",
    description:
      "Procesos sobrios y consistentes para sostener confianza en el día a día.",
    accent: "#10233A",
    icon: "operations" as const
  }
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-transparent pb-10 pt-1 lg:pb-14 lg:pt-2">
      <div className="ffo-shell">
        <div className="max-w-[56rem]">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Señales de servicio</span>
          </div>
          <h2 className="max-w-[18ch] text-4xl font-semibold tracking-[-0.03em] text-[#10233A] sm:text-[2.7rem]">
            Menos promesa. Más señales de cómo se trabaja.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {services.map((item) => (
            <article
              key={item.title}
              className="ffo-elevate rounded-[24px] border border-[rgba(22,32,44,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(249,250,252,0.96)_100%)] p-6 shadow-[0_16px_32px_-28px_rgba(10,25,44,0.14)]"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-[14px] text-lg font-semibold"
                style={{ backgroundColor: `${item.accent}18`, color: item.accent }}
              >
                <BrandIcon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#16202C]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5A6675]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
