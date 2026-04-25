type ServiceItem = {
  title: string;
  description: string;
  accent: string;
  symbol: string;
};

const services: ServiceItem[] = [
  {
    title: "Atención cercana",
    description: "Un equipo disponible para acompañarte durante toda la relación de alquiler y resolver dudas con criterio y rapidez.",
    accent: "#0078D4",
    symbol: "◔"
  },
  {
    title: "Facturas consultables",
    description: "Importes, vencimientos y estado de tus facturas accesibles desde tu área privada, en cualquier momento.",
    accent: "#106EBE",
    symbol: "▦"
  },
  {
    title: "Incidencias ordenadas",
    description: "Comunica cualquier necesidad del inmueble y consulta el estado de la gestión desde una ficha única.",
    accent: "#003A6C",
    symbol: "!"
  },
  {
    title: "Información centralizada",
    description: "Todo lo relevante del alquiler queda recogido en un entorno privado, claro y fácil de consultar.",
    accent: "#0078D4",
    symbol: "◇"
  },
  {
    title: "Seguimiento transparente",
    description: "Menos incertidumbre y más contexto sobre cada solicitud, comunicación o trámite pendiente.",
    accent: "#106EBE",
    symbol: "↺"
  },
  {
    title: "Gestión profesional",
    description: "Procesos cuidados para que propietarios, clientes e inquilinos compartan una experiencia más fluida.",
    accent: "#003A6C",
    symbol: "△"
  }
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-[#F3F2F1] py-20 lg:py-28">
      <div className="ffo-shell">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Servicios para el día a día</span>
          </div>
          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#003A6C] sm:text-[2.65rem]">
            Una experiencia de alquiler más cómoda, clara y acompañada.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <article
              key={item.title}
              className="rounded-[24px] border border-[#E1DFDD] bg-white p-6 shadow-[0_22px_46px_-34px_rgba(0,58,108,0.22)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(0,120,212,0.3)]"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded text-lg font-semibold"
                style={{ backgroundColor: `${item.accent}12`, color: item.accent }}
              >
                {item.symbol}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#201F1E]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#605E5C]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
