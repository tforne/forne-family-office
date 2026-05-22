import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";

const guides = [
  {
    href: "/guias/portal-privado",
    title: "Cómo funciona el acceso privado",
    description: "Una lectura breve para entender el acceso, la información disponible y la lógica del entorno privado."
  },
  {
    href: "/guias/incidencias-alquiler",
    title: "Cómo comunicar una incidencia",
    description: "Guía breve para trasladar una necesidad con el contexto que ayuda a resolverla mejor."
  }
];

export default function GuidesSection() {
  return (
    <section className="bg-transparent pb-10 pt-1 lg:pb-14 lg:pt-2">
      <div className="ffo-shell">
        <div className="mb-10 max-w-[58rem]">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Guías</span>
          </div>
          <h2 className="max-w-[21ch] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0F2F57] sm:text-[2.7rem]">
            Lecturas breves para quien quiera entender mejor el detalle.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="ffo-elevate rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/92 p-6 shadow-[0_14px_30px_-28px_rgba(10,25,44,0.12)]"
            >
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1B6FD8]">
                <BrandIcon name="guide" className="h-4 w-4" />
                Guía
              </div>
              <h3 className="mt-3 max-w-[18ch] text-[1.55rem] font-semibold tracking-[-0.02em] text-[#18202B]">{guide.title}</h3>
              <p className="mt-3 max-w-[44ch] text-sm leading-7 text-[#5D6776]">{guide.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1B6FD8]">
                Leer guía
                <BrandIcon name="arrow" className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/guias"
            className="inline-flex items-center rounded-[14px] border border-[rgba(22,32,44,0.1)] bg-white/84 px-5 py-3 text-sm font-semibold text-[#10233A] transition hover:bg-white"
          >
            Ver todas las lecturas
          </Link>
        </div>
      </div>
    </section>
  );
}
