import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";

const guides = [
  {
    href: "/guias/portal-privado",
    title: "Como funciona el portal privado",
    description:
      "Explica que puede hacer un cliente dentro del portal, que informacion encuentra y para que sirve cada seccion."
  },
  {
    href: "/guias/incidencias-alquiler",
    title: "Que hacer si tienes una incidencia",
    description:
      "Guia practica para comunicar averias, consultas o solicitudes con el contexto que ayuda a resolverlas antes."
  },
  {
    href: "/guias/facturas-y-vencimientos",
    title: "Como consultar facturas y vencimientos",
    description:
      "Resumen claro de como revisar importes, estados, copias y fechas clave del alquiler desde el portal."
  }
];

export default function GuidesSection() {
  return (
    <section className="bg-transparent py-20 lg:py-28">
      <div className="ffo-shell">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Guias y respuestas</span>
          </div>
          <h2 className="text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
            Guias claras para quienes quieren entender el servicio sin friccion.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5D6776]">
            Estas guias estan escritas para clientes, inquilinos y personas interesadas en
            disponibilidad. Explican el servicio con el mismo tono con el que queremos prestarlo:
            claro, sobrio y util.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="ffo-elevate rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/90 p-6"
            >
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1B6FD8]">
                <BrandIcon name="guide" className="h-4 w-4" />
                Guia
              </div>
              <h3 className="mt-3 text-[1.55rem] font-semibold text-[#18202B]">{guide.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5D6776]">{guide.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1B6FD8]">
                Abrir guia
                <BrandIcon name="arrow" className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/guias"
            className="inline-flex items-center rounded-[14px] border border-[rgba(27,111,216,0.22)] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1B6FD8] transition hover:bg-[#EDF5FF]"
          >
            Ver todas las guias
          </Link>
        </div>
      </div>
    </section>
  );
}
