import Link from "next/link";
import Image from "next/image";

const PORTAL_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-interior-bajvhnKciECoKnLinUir5M.webp";

const features = [
  "Consulta tus facturas y vencimientos",
  "Comunica incidencias del inmueble",
  "Revisa el estado de cada gestión"
];

const portalHighlights = [
  { label: "Facturas", value: "Histórico y vencimientos" },
  { label: "Incidencias", value: "Seguimiento estructurado" },
  { label: "Avisos", value: "Comunicaciones visibles" }
];

export default function ClientAreaSection() {
  return (
    <section id="portal" className="relative overflow-hidden bg-[#10233A] pb-12 pt-5 lg:pb-16 lg:pt-7">
      <div className="absolute right-[-6rem] top-12 h-56 w-56 rounded-full bg-[#B89B6D]/12 blur-3xl" />
      <div className="ffo-shell grid gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line bg-white" />
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D5C0A0]">
              Acceso privado
            </span>
          </div>

          <h2 className="max-w-[14ch] text-4xl font-semibold tracking-[-0.02em] text-white sm:text-[2.65rem]">
            Un acceso privado claro, sobrio y bien resuelto.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#C8DCF0]">
            El portal reúne facturas, incidencias y seguimiento en un entorno seguro y sobrio,
            pensado para consultar lo importante sin fricción.
          </p>

          <div className="mt-8 grid gap-3">
            {features.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-[#D9E8F6]"
              >
                {item}
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-8 inline-flex rounded bg-white px-7 py-3.5 text-sm font-semibold text-[#10233A] shadow-[0_18px_38px_-20px_rgba(0,0,0,0.22)] transition hover:bg-[#F7F7F7]"
          >
            Entrar al área privada
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[28px] border border-white/8 shadow-[0_30px_70px_-36px_rgba(0,0,0,0.45)]">
            <Image
              src={PORTAL_IMAGE}
              alt="Portal de clientes Forné Family Office"
              width={1200}
              height={1400}
              quality={92}
              sizes="(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, 100vw"
              className="h-[360px] w-full object-cover object-center [filter:saturate(1.03)_contrast(1.02)] sm:h-[460px] lg:h-[520px]"
            />
          </div>

          <div className="absolute inset-x-5 bottom-5 rounded-[24px] border border-white/10 bg-[rgba(11,28,48,0.78)] p-5 text-white shadow-[0_26px_60px_-30px_rgba(0,0,0,0.52)] backdrop-blur">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
              Vista rápida del área privada
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
