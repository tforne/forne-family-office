import Link from "next/link";
import Image from "next/image";

const PORTAL_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-interior-bajvhnKciECoKnLinUir5M.webp";

const features = [
  "Consulta tus facturas y vencimientos",
  "Comunica incidencias del inmueble",
  "Revisa el estado de cada gestión",
  "Mantén comunicación con contexto"
];

const portalHighlights = [
  { label: "Facturas", value: "Histórico y vencimientos" },
  { label: "Incidencias", value: "Seguimiento estructurado" },
  { label: "Avisos", value: "Comunicaciones visibles" }
];

export default function ClientAreaSection() {
  return (
    <section id="portal" className="relative overflow-hidden bg-[#003A6C] py-20 lg:py-28">
      <div className="absolute right-[-6rem] top-12 h-56 w-56 rounded-full bg-[#0078D4]/20 blur-3xl" />
      <div className="ffo-shell grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line bg-white" />
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8CBFE8]">
              Portal privado
            </span>
          </div>

          <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.02em] text-white sm:text-[2.65rem]">
            Un acceso privado para gestionar tu alquiler con tranquilidad.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#C8DCF0]">
            Desde el portal puedes consultar tus facturas, comunicar incidencias y revisar la
            información asociada a tu inmueble cuando lo necesites, con una experiencia segura y
            pensada para evitar esperas innecesarias.
          </p>

          <div className="mt-8 grid gap-3">
            {features.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#D9E8F6]"
              >
                {item}
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-8 inline-flex rounded bg-[#0078D4] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(0,120,212,0.9)] transition hover:bg-[#106EBE]"
          >
            Acceder al portal
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[28px] shadow-[0_30px_70px_-36px_rgba(0,0,0,0.45)]">
            <Image
              src={PORTAL_IMAGE}
              alt="Portal de clientes Forné Family Office"
              width={1200}
              height={1400}
              className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[520px]"
            />
          </div>

          <div className="absolute inset-x-5 bottom-5 rounded-[24px] border border-white/10 bg-[#072448]/88 p-5 text-white shadow-[0_26px_60px_-30px_rgba(0,0,0,0.65)] backdrop-blur">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
              Vista rápida del portal
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {portalHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="mt-1 text-sm text-white/70">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
