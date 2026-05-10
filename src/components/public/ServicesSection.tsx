import BrandIcon from "@/components/brand/BrandIcon";

type ServiceItem = {
  title: string;
  description: string;
  accent: string;
  icon: "attention" | "billing" | "incident" | "portal" | "clarity" | "operations";
};

const services: ServiceItem[] = [
  {
    title: "Atención cercana",
    description: "Un equipo disponible para acompañarte durante toda la relación de alquiler y resolver dudas con criterio y rapidez.",
    accent: "#0078D4",
    icon: "attention"
  },
  {
    title: "Facturas consultables",
    description: "Importes, vencimientos y estado de tus facturas accesibles desde tu área privada, en cualquier momento.",
    accent: "#106EBE",
    icon: "billing"
  },
  {
    title: "Incidencias ordenadas",
    description: "Comunica cualquier necesidad del inmueble y consulta el estado de la gestión desde una ficha única.",
    accent: "#003A6C",
    icon: "incident"
  },
  {
    title: "Información centralizada",
    description: "Todo lo relevante del alquiler queda recogido en un entorno privado, claro y fácil de consultar.",
    accent: "#0078D4",
    icon: "portal"
  },
  {
    title: "Seguimiento transparente",
    description: "Menos incertidumbre y más contexto sobre cada solicitud, comunicación o trámite pendiente.",
    accent: "#106EBE",
    icon: "clarity"
  },
  {
    title: "Gestión profesional",
    description: "Procesos cuidados para que propietarios, clientes e inquilinos compartan una experiencia más fluida.",
    accent: "#003A6C",
    icon: "operations"
  }
];

const process = [
  {
    step: "01",
    title: "Centralizamos la información",
    description: "Contrato, facturas, avisos e incidencias quedan accesibles sin depender de mensajes dispersos."
  },
  {
    step: "02",
    title: "Damos seguimiento claro",
    description: "Cada gestión avanza con más contexto y menos incertidumbre para quien la necesita consultar."
  },
  {
    step: "03",
    title: "Mantenemos una atención estable",
    description: "La experiencia se apoya en procesos cuidados y en una relación cercana con el inquilino."
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
            Lo que hacemos mejor: ordenar la gestion para que el alquiler se viva con mas claridad.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <article
              key={item.title}
              className="ffo-elevate rounded-[24px] border border-[#E1DFDD] bg-white p-6 shadow-[0_22px_46px_-34px_rgba(0,58,108,0.22)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(0,120,212,0.3)]"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded text-lg font-semibold"
                style={{ backgroundColor: `${item.accent}12`, color: item.accent }}
              >
                <BrandIcon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#201F1E]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#605E5C]">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[30px] border border-[#D7E7F5] bg-[linear-gradient(135deg,#EFF6FC_0%,#FFFFFF_55%,#F8FBFE_100%)] p-8 lg:p-10">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0078D4]">
              Cómo trabajamos
            </div>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#003A6C]">
              Una forma de trabajar pensada para clientes e inquilinos que valoran continuidad.
            </h3>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {process.map((item) => (
              <article key={item.step} className="ffo-elevate rounded-[24px] border border-[#D7E7F5] bg-white/92 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0078D4]">
                  Paso {item.step}
                </div>
                <h4 className="mt-3 text-xl font-semibold text-[#201F1E]">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-[#605E5C]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
