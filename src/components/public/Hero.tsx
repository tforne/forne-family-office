import Link from "next/link";
import AvailabilityInterestForm from "@/components/public/AvailabilityInterestForm";
import { listFeaturedAssets } from "@/lib/content/featured-assets";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-calle-gRs5ApjQ7HD5b5Mu9TdWPe.webp";

export default async function Hero() {
  const featuredAssets = await listFeaturedAssets();

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#0078D4]" />
      <div className="absolute right-[-8rem] top-16 h-64 w-64 rounded-full bg-[#0078D4]/10 blur-3xl" />
      <div className="absolute left-[-10rem] top-1/3 h-72 w-72 rounded-full bg-[#003A6C]/8 blur-3xl" />

      <div className="ffo-shell grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Atención al cliente e inquilino</span>
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.03em] text-[#003A6C] sm:text-6xl xl:text-[4rem]">
            Tu vivienda, <span className="text-[#0078D4]">bien gestionada</span> y siempre clara.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#605E5C]">
            En Forné Family Office cuidamos la relación con cada inquilino con una atención cercana,
            ordenada y transparente. Desde el portal privado puedes consultar facturas, comunicar
            incidencias y seguir cada gestión con claridad.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#disponibilidad"
              className="inline-flex items-center justify-center rounded bg-[#0078D4] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(0,120,212,0.85)] transition hover:bg-[#106EBE]"
            >
              Consultar disponibilidad
            </Link>
            <Link
              href="/alquileres"
              className="inline-flex items-center justify-center rounded border border-[#0078D4] px-7 py-3.5 text-sm font-medium text-[#0078D4] transition hover:bg-[#EFF6FC]"
            >
              Conocer la gestión
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-[#E1DFDD] pt-8">
            <div className="flex -space-x-2">
              {["A", "M", "R"].map((letter, index) => (
                <div
                  key={letter}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
                  style={{ backgroundColor: ["#0078D4", "#106EBE", "#003A6C"][index] }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <div className="mb-1 flex items-center gap-1 text-[#0078D4]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>
              <p className="text-xs text-[#605E5C]">Atención valorada por clientes e inquilinos</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[28px] shadow-[0_30px_80px_-35px_rgba(0,58,108,0.35)]">
            <img
              src={HERO_IMAGE}
              alt="Apartamento gestionado por Forné Family Office"
              className="h-[360px] w-full object-cover sm:h-[440px] lg:h-[560px]"
            />
          </div>

          <div className="ffo-card absolute -bottom-6 left-4 max-w-[220px] rounded-[20px] p-4 sm:left-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#EFF6FC] text-[#0078D4]">
                ✓
              </div>
              <span className="text-xs font-semibold text-[#201F1E]">Portal activo</span>
            </div>
            <p className="text-xs leading-5 text-[#605E5C]">
              Facturas, incidencias y seguimiento en tiempo real.
            </p>
          </div>
        </div>
      </div>

      <div id="disponibilidad" className="ffo-shell pb-20 lg:pb-24">
        <div className="ffo-card rounded-[28px] border border-[#E1DFDD] bg-[#EFF6FC]/60 p-8 lg:p-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="ffo-accent-line" />
              <span className="ffo-kicker">Disponibilidad actual</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#003A6C] sm:text-4xl">
              Consulta nuestras oportunidades
            </h2>
            <p className="mt-3 text-base leading-7 text-[#605E5C]">
              Déjanos tus datos y te contactaremos con una propuesta ajustada a tu interés.
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            {featuredAssets.map((asset) => (
              <article
                key={asset.id}
                className="rounded-[22px] border border-[#D7E7F5] bg-white/92 p-5 shadow-[0_18px_40px_-32px_rgba(0,58,108,0.22)]"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0078D4]">
                  {asset.badge}
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.02em] text-[#0F172A]">
                  {asset.title}
                </h3>
                <div className="mt-2 text-sm font-medium text-[#605E5C]">{asset.location}</div>
                <div className="mt-4 text-2xl font-semibold text-[#003A6C]">{asset.price}</div>
                <p className="mt-3 text-sm leading-6 text-[#605E5C]">{asset.note}</p>
              </article>
            ))}
          </div>

          <AvailabilityInterestForm />
        </div>
      </div>
    </section>
  );
}
