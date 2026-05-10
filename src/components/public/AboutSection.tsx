import Image from "next/image";
import BrandIcon from "@/components/brand/BrandIcon";

const TEAM_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-reunion-bZEqzwTwSLMFKRFnp7K8Db.webp";

const points = [
  "Atencion personal para inquilinos, clientes y activos concretos",
  "Portal privado con informacion centralizada y trazable",
  "Comunicacion directa sin perder el hilo de cada gestion",
  "Facturas, incidencias y seguimiento dentro de un marco claro"
];

const principles = [
  {
    title: "Cercanía útil",
    description: "Respondemos con criterio, no solo con rapidez. La experiencia debe sentirse acompañada."
  },
  {
    title: "Orden operativo",
    description: "Cada incidencia, aviso o factura tiene un lugar claro para consultarse y seguirse."
  },
  {
    title: "Transparencia",
    description: "Menos incertidumbre y más visibilidad sobre el estado real de cada gestión."
  }
];

export default function AboutSection() {
  return (
    <section id="quienes-somos" className="bg-white py-20 lg:py-28">
      <div className="ffo-shell grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-32 w-32 rounded-[28px] bg-[#EFF6FC]" />
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_70px_-38px_rgba(0,58,108,0.32)]">
            <Image
              src={TEAM_IMAGE}
              alt="Equipo de Forné Family Office"
              width={1200}
              height={1400}
              className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[500px]"
            />
          </div>
          <div className="absolute -bottom-5 right-0 rounded-[20px] bg-[#0078D4] p-5 text-white shadow-[0_24px_40px_-24px_rgba(0,120,212,0.85)]">
            <div className="text-3xl font-semibold">35+</div>
            <p className="mt-1 max-w-[160px] text-xs leading-5 text-white/85">
              años gestionando alquileres con confianza
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Nuestra forma de gestionar</span>
          </div>

          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#003A6C] sm:text-[2.65rem]">
            Una gestion familiar para quienes quieren orden, criterio y un trato directo de verdad.
          </h2>

          <p className="mt-5 text-base leading-8 text-[#605E5C]">
            Vivir o trabajar en un inmueble gestionado exige confianza. Por eso combinamos
            atencion personal, procesos estables y una capa digital que evita perder informacion
            entre correos, llamadas y gestiones dispersas.
          </p>

          <p className="mt-5 text-base leading-8 text-[#605E5C]">
            Somos una empresa familiar con mas de treinta y cinco anos de experiencia en alquileres
            residenciales y comerciales. Trabajamos especialmente bien con quienes valoran una
            gestion sobria, cercana y con capacidad real de seguimiento en el dia a dia.
          </p>

          <div className="mt-8 grid gap-3">
            {points.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FC] text-[11px] text-[#0078D4]">
                  <BrandIcon name="trust" className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm leading-6 text-[#323130]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {principles.map((item) => (
              <article key={item.title} className="rounded-[22px] border border-[#E1DFDD] bg-[#F8FBFE] p-5">
                <h3 className="text-base font-semibold text-[#003A6C]">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#605E5C]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
