import Link from "next/link";

const PORTAL_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-interior-bajvhnKciECoKnLinUir5M.webp";

const features = [
  "Consulta tus facturas y vencimientos",
  "Comunica incidencias del inmueble",
  "Revisa el estado de cada gestión",
  "Mantén comunicación con contexto"
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

        <div>
          <div className="overflow-hidden rounded-[28px] shadow-[0_30px_70px_-36px_rgba(0,0,0,0.45)]">
            <img
              src={PORTAL_IMAGE}
              alt="Portal de clientes Forné Family Office"
              className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[520px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
