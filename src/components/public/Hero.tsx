import Link from "next/link";
import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";
import BrandIcon from "@/components/brand/BrandIcon";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-calle-gRs5ApjQ7HD5b5Mu9TdWPe.webp";

const confidenceSignals = [
  "Gobernanza clara en residencial y comercial",
  "Interlocución directa con criterio y discreción"
];

const trustMetrics = [
  { value: "35+", label: "años de continuidad y criterio de gestión" },
  { value: "Orden", label: "trazabilidad, seguimiento y responsabilidad" },
  { value: "1 entorno", label: "acceso privado para visibilidad y control" }
];

const governancePoints = [
  "Atención personal sin fricción innecesaria",
  "Información centralizada para decidir con calma",
  "Seguimiento consistente en incidencias, avisos y facturación"
];

export default async function Hero() {
  noStore();

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,155,109,0.45),transparent)]" />
      <div className="absolute left-[-7rem] top-14 h-56 w-56 rounded-full bg-[#B89B6D]/8 blur-3xl" />
      <div className="absolute right-[-8rem] top-20 h-64 w-64 rounded-full bg-[#233D5C]/8 blur-3xl" />

      <div className="ffo-shell grid gap-16 py-12 lg:grid-cols-[1.14fr_0.86fr] lg:items-start lg:gap-14 lg:py-20 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="ffo-fade-up">
          <div className="mb-5 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Firma familiar</span>
          </div>

          <h1 className="max-w-[13.6ch] text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-[#10233A] sm:text-6xl lg:max-w-[14ch] xl:max-w-[14.5ch] xl:text-[4rem]">
            Una gestión inmobiliaria
            <span className="block text-[#B89B6D]">con criterio, discreción</span>
            <span className="block">y visión estratégica.</span>
          </h1>

          <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[#516070]">
            Forné Family Office acompaña activos residenciales y comerciales con una gestión
            sobria, bien gobernada y orientada a la continuidad. Lo esencial no son las
            funcionalidades, sino el criterio con el que se decide, se responde y se cuida cada
            relación.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {confidenceSignals.map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,32,44,0.08)] bg-white/92 px-4 py-2 text-sm text-[#172332]"
              >
                <BrandIcon name="trust" className="h-4 w-4 text-[#B89B6D]" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#disponibilidad"
              className="ffo-button-primary inline-flex items-center justify-center rounded-[16px] px-7 py-3.5 text-sm font-semibold text-white transition hover:brightness-[1.03]"
            >
              Iniciar conversación
            </Link>
            <Link
              href="/alquileres"
              className="ffo-button-secondary inline-flex items-center justify-center rounded-[16px] px-7 py-3.5 text-sm font-medium text-[#10233A] transition hover:border-[#B89B6D] hover:bg-white"
            >
              Ver el enfoque
            </Link>
          </div>

          <div className="mt-10 grid gap-4 border-t border-[rgba(22,32,44,0.08)] pt-8 sm:grid-cols-3">
            {trustMetrics.map((item, index) => (
              <div
                key={item.label}
                className={`rounded-[22px] bg-transparent p-4 ${index > 0 ? "ffo-stat-divider sm:pl-6" : ""}`}
              >
                <div className="text-2xl font-semibold tracking-[-0.03em] text-[#10233A]">
                  {item.value}
                </div>
                <p className="mt-1 text-sm leading-6 text-[#5A6675]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative ffo-fade-up">
          <div className="ffo-premium-frame rounded-[34px] p-3">
            <div className="ffo-premium-grid" />
            <div className="relative overflow-hidden rounded-[26px]">
              <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(9,20,34,0.08)_0%,rgba(9,20,34,0.32)_100%)]" />
              <Image
                src={HERO_IMAGE}
                alt="Activo inmobiliario gestionado por Forné Family Office"
                width={1200}
                height={1400}
                priority
                quality={92}
                sizes="(min-width: 1280px) 34vw, (min-width: 1024px) 38vw, 100vw"
                className="h-[380px] w-full object-cover object-center [filter:saturate(1.03)_contrast(1.02)] sm:h-[450px] lg:h-[580px] xl:h-[600px]"
              />
            </div>

            <div className="absolute left-7 top-7 rounded-[18px] border border-white/12 bg-[rgba(10,24,41,0.66)] px-4 py-3 text-white backdrop-blur-md">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#D5C0A0]">
                Presencia institucional
              </div>
              <div className="mt-2 text-sm font-medium text-white/92">
                Presencia cuidada
              </div>
            </div>

            <div className="absolute bottom-7 left-5 right-5 rounded-[24px] border border-[rgba(184,155,109,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.97)_0%,rgba(247,248,250,0.94)_100%)] p-5 shadow-[0_24px_54px_-40px_rgba(8,20,37,0.36)] sm:left-8 sm:right-auto sm:max-w-[332px]">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#F4EEE4] text-[#B89B6D]">
                  <BrandIcon name="portal" className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-[#10233A]">
                  Claridad visible, experiencia discreta
                </span>
              </div>
              <div className="grid gap-2">
                {governancePoints.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm leading-6 text-[#556272]">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#B89B6D]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
