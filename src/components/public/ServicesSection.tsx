type ServiceItem = {
  title: string;
  description: string;
  icon: JSX.Element;
};

function IconFrame({
  children,
  frameClassName = "",
  iconClassName = ""
}: {
  children: React.ReactNode;
  frameClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-forne-line bg-forne-cloud/80 ${frameClassName}`}>
      <div className={iconClassName}>{children}</div>
    </div>
  );
}

function iconBase(paths: React.ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-forne-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

const services: ServiceItem[] = [
  {
    title: "Atención cercana",
    description: "Un equipo disponible para acompañarte durante la relación de alquiler y resolver dudas con criterio.",
    icon: (
      <IconFrame frameClassName="bg-emerald-50 border-emerald-100" iconClassName="text-emerald-700">
        {iconBase(
          <>
            <path d="M7.5 14.5c1.2 1.9 2.7 2.9 4.5 2.9s3.3-1 4.5-2.9" />
            <path d="M8.5 10.2c.8-1.6 2-2.4 3.5-2.4 1.6 0 2.7.8 3.6 2.4" />
            <path d="M5.8 12c1.8-1 3.9-1.5 6.2-1.5S16.4 11 18.2 12" />
          </>
        )}
      </IconFrame>
    )
  },
  {
    title: "Facturas consultables",
    description: "Importes, vencimientos y estado de tus facturas accesibles desde tu área privada.",
    icon: (
      <IconFrame frameClassName="bg-amber-50 border-amber-100" iconClassName="text-amber-700">
        {iconBase(
          <>
            <path d="M8 6.8h6.8l2.2 2.2v8.4c0 .9-.7 1.6-1.6 1.6H8.6c-.9 0-1.6-.7-1.6-1.6V8.4C7 7.5 7.3 6.8 8 6.8Z" />
            <path d="M14.8 6.8V9h2.2" />
            <path d="M9.4 12.2h5.2" />
            <path d="M9.4 15.2h3.8" />
          </>
        )}
      </IconFrame>
    )
  },
  {
    title: "Incidencias ordenadas",
    description: "Comunica cualquier necesidad del inmueble y consulta el estado de la gestión desde una ficha única.",
    icon: (
      <IconFrame frameClassName="bg-rose-50 border-rose-100" iconClassName="text-rose-700">
        {iconBase(
          <>
            <path d="M8 7.5h8" />
            <path d="M8 11.8h5.8" />
            <path d="M8 16h4.2" />
            <path d="M17.2 14.4 19 16.2l-3.1 3.1H14v-1.9l3.2-3Z" />
          </>
        )}
      </IconFrame>
    )
  },
  {
    title: "Información centralizada",
    description: "Todo lo relevante del alquiler queda recogido en un entorno privado, claro y fácil de consultar.",
    icon: (
      <IconFrame frameClassName="bg-sky-50 border-sky-100" iconClassName="text-sky-700">
        {iconBase(
          <>
            <path d="M7 8.2 12 5l5 3.2v7.6L12 19l-5-3.2Z" />
            <path d="M12 5v14" />
            <path d="M7 8.2 12 11l5-2.8" />
          </>
        )}
      </IconFrame>
    )
  },
  {
    title: "Seguimiento transparente",
    description: "Menos incertidumbre y más contexto sobre cada solicitud, comunicación o trámite pendiente.",
    icon: (
      <IconFrame frameClassName="bg-cyan-50 border-cyan-100" iconClassName="text-cyan-700">
        {iconBase(
          <>
            <path d="M6.5 15.8c1.2-1.9 3-2.8 5.5-2.8 2.4 0 4.2.9 5.5 2.8" />
            <path d="M7.4 11.2c1.2-1.5 2.8-2.3 4.6-2.3 1.9 0 3.4.8 4.7 2.3" />
            <path d="M8.5 7.7c1-.8 2.1-1.2 3.5-1.2 1.4 0 2.6.4 3.5 1.2" />
            <path d="M12 16.8v-1.7" />
          </>
        )}
      </IconFrame>
    )
  },
  {
    title: "Gestión profesional",
    description: "Procesos cuidados para que propietarios, clientes e inquilinos compartan una experiencia más fluida.",
    icon: (
      <IconFrame frameClassName="bg-slate-100 border-slate-200" iconClassName="text-slate-700">
        {iconBase(
          <>
            <path d="M6.8 15.5 12 6l5.2 9.5" />
            <path d="M8.6 12.2h6.8" />
            <path d="M9.8 15.5h4.4" />
            <path d="M12 6v2.2" />
          </>
        )}
      </IconFrame>
    )
  }
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-forne-muted">
            Servicios para el día a día
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-forne-ink sm:text-4xl">
            Una experiencia de alquiler más cómoda, clara y acompañada
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-forne-line bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {item.icon}
                <h3 className="text-lg font-semibold text-forne-ink">{item.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-forne-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
