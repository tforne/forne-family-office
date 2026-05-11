import Link from "next/link";
import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";
import BrandIcon from "@/components/brand/BrandIcon";
import AvailabilityInterestForm from "@/components/public/AvailabilityInterestForm";
import { listPublicFeaturedAssets } from "@/lib/public/featured-assets.service";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-calle-gRs5ApjQ7HD5b5Mu9TdWPe.webp";

const quickSignals = [
  "Para inquilinos que valoran orden y respuesta",
  "Para activos residenciales y comerciales bien gestionados",
  "Para relaciones de alquiler con menos friccion y mas contexto"
];

const trustMetrics = [
  { value: "35+", label: "años de experiencia" },
  { value: "<24 h", label: "respuesta habitual" },
  { value: "1 portal", label: "para incidencias y facturas" }
];

export default async function Hero() {
  noStore();
  const featuredAssets = (await listPublicFeaturedAssets()).filter(
    (asset) => asset.title.trim() && asset.location.trim() && asset.note.trim()
  );

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#0078D4]" />
      <div className="absolute right-[-8rem] top-16 h-64 w-64 rounded-full bg-[#0078D4]/10 blur-3xl" />
      <div className="absolute left-[-10rem] top-1/3 h-72 w-72 rounded-full bg-[#003A6C]/8 blur-3xl" />

      <div className="ffo-shell grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="ffo-fade-up">
          <div className="mb-5 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Atención al cliente e inquilino</span>
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.03em] text-[#003A6C] sm:text-6xl xl:text-[4rem]">
            La gestión de alquileres para quienes esperan <span className="text-[#0078D4]">claridad, criterio</span> y una atención realmente presente.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#605E5C]">
            Forne Family Office trabaja con clientes e inquilinos que quieren una gestion seria:
            residencial o comercial, con seguimiento estable, comunicacion directa y un portal
            privado que mantiene cada factura, aviso e incidencia dentro del mismo contexto.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {quickSignals.map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-[#D7E7F5] bg-white/90 px-4 py-2 text-sm text-[#0F172A] shadow-[0_14px_30px_-24px_rgba(0,58,108,0.28)]"
              >
                <BrandIcon name="trust" className="h-4 w-4 text-[#1B6FD8]" />
                {item}
              </div>
            ))}
          </div>

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

          <div className="mt-10 grid gap-4 border-t border-[#E1DFDD] pt-8 sm:grid-cols-3">
            {trustMetrics.map((item) => (
              <div key={item.label} className="ffo-elevate rounded-[22px] border border-[#E1DFDD] bg-white/80 p-4">
                <div className="text-2xl font-semibold tracking-[-0.03em] text-[#003A6C]">{item.value}</div>
                <p className="mt-1 text-sm leading-6 text-[#605E5C]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative ffo-fade-up">
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_80px_-35px_rgba(0,58,108,0.35)]">
            <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(15,47,87,0.08)_0%,rgba(15,47,87,0.24)_100%)]" />
            <Image
              src={HERO_IMAGE}
              alt="Apartamento gestionado por Forné Family Office"
              width={1200}
              height={1400}
              priority
              className="h-[360px] w-full object-cover sm:h-[440px] lg:h-[560px]"
            />
          </div>

          <div className="ffo-card absolute -bottom-6 left-4 max-w-[250px] rounded-[20px] p-4 sm:left-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#EFF6FC] text-[#0078D4]">
                <BrandIcon name="portal" className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-[#201F1E]">Portal activo y seguro</span>
            </div>
            <p className="text-xs leading-5 text-[#605E5C]">
              Facturas, incidencias, avisos y seguimiento centralizado para no depender de cadenas de correos.
            </p>
          </div>

          <div className="absolute -right-2 top-6 rounded-[22px] bg-[#003A6C] px-5 py-4 text-white shadow-[0_24px_55px_-28px_rgba(0,58,108,0.5)] sm:right-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">
              Para quien busca
            </div>
            <div className="mt-2 text-sm font-semibold">Menos desgaste operativo</div>
            <div className="mt-1 text-sm text-white/75">Mas contexto y mejor seguimiento</div>
          </div>
        </div>
      </div>

      <div id="disponibilidad" className="ffo-shell pb-0">
        <div className="ffo-card rounded-[28px] border border-[#E1DFDD] bg-[#EFF6FC]/60 p-8 lg:p-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="ffo-accent-line" />
              <span className="ffo-kicker">Disponibilidad actual</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#003A6C] sm:text-4xl">
              Consulta pisos y locales disponibles
            </h2>
            <p className="mt-3 text-base leading-7 text-[#605E5C]">
              Déjanos tus datos y te contactaremos con una propuesta ajustada a tu interés en
              alquiler de pisos o alquiler de locales.
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            {featuredAssets.length > 0 ? (
              featuredAssets.map((asset) => (
                <article
                  key={asset.id}
                  className="ffo-elevate rounded-[22px] border border-[#D7E7F5] bg-white/92 p-5 shadow-[0_18px_40px_-32px_rgba(0,58,108,0.22)]"
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
              ))
            ) : (
              <article className="rounded-[22px] border border-dashed border-[#B7D5EE] bg-white/85 p-6 text-sm leading-7 text-[#605E5C] xl:col-span-3">
                En este momento no hay inmuebles con estado <strong>En alquiler</strong> para mostrar en portada.
              </article>
            )}
          </div>

          <AvailabilityInterestForm />
        </div>
      </div>
    </section>
  );
}
