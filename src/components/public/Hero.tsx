import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-forne-cloud">
      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-forne-muted">
            Control patrimonial
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-forne-ink sm:text-5xl lg:text-6xl">
            Gestión de alquileres con visión clara, trazable y profesional.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-forne-muted">
            Centralizamos la relación con el inmueble, las facturas y las incidencias en una experiencia privada y ordenada para clientes e inquilinos.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/alquileres" className="rounded-xl bg-forne-ink px-6 py-3.5 text-sm font-semibold text-white shadow-sm">Ver servicios</Link>
            <Link href="/login" className="rounded-xl border border-forne-line bg-white px-6 py-3.5 text-sm font-semibold text-forne-ink shadow-sm">Acceso clientes</Link>
          </div>
        </div>

        <div className="self-center rounded-[28px] border border-forne-line bg-white p-6 shadow-sm">
          <div className="rounded-3xl bg-forne-ink p-6 text-white">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Portal clientes</div>
            <div className="mt-3 text-xl font-semibold">Área privada conectada</div>
            <div className="mt-3 text-sm leading-7 text-white/70">
              Un punto de acceso para consultar información operativa y comunicarse sobre cada inmueble.
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm font-semibold text-white">Facturas</div>
                <div className="mt-1 text-sm leading-6 text-white/60">Importes, vencimientos y estado de cobro.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm font-semibold text-white">Incidencias</div>
                <div className="mt-1 text-sm leading-6 text-white/60">Seguimiento, detalle, seguro y comunicación.</div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/60">
              Diseñado para reducir dispersión y dar contexto a cada gestión.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
