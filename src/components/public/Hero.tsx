import Link from "next/link";
import AvailabilityInterestForm from "@/components/public/AvailabilityInterestForm";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-forne-cloud">
      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-forne-muted">
            Atención al cliente e inquilino
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-forne-ink sm:text-5xl lg:text-6xl">
            Tu vivienda, tus gestiones y tus consultas en un solo lugar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-forne-muted">
            En Forné Family Office cuidamos la relación con cada inquilino con una atención cercana, ordenada y transparente. Desde el portal privado puedes consultar facturas, comunicar incidencias y seguir cada gestión con claridad.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/alquileres" className="rounded-xl bg-forne-ink px-6 py-3.5 text-sm font-semibold text-white shadow-sm">Conocer la gestión</Link>
            <Link href="/login" className="rounded-xl border border-forne-line bg-white px-6 py-3.5 text-sm font-semibold text-forne-ink shadow-sm">Acceso clientes</Link>
          </div>

          <div className="mt-8 max-w-xl">
            <div className="rounded-2xl border border-forne-line bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">
                Activos libres
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-forne-ink">42</div>
              <div className="mt-1 text-sm leading-6 text-forne-muted">
                Inmuebles disponibles actualmente para nueva ocupación.
              </div>
              <AvailabilityInterestForm />
            </div>
          </div>
        </div>

        <div className="self-center rounded-[28px] border border-forne-line bg-white p-6 shadow-sm">
          <div className="rounded-3xl bg-forne-ink p-6 text-white">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Portal clientes</div>
            <div className="mt-3 text-xl font-semibold">Todo lo importante, siempre localizable</div>
            <div className="mt-3 text-sm leading-7 text-white/70">
              Un espacio privado para gestionar el día a día del alquiler sin llamadas cruzadas, mensajes perdidos ni dudas sobre el estado de cada solicitud.
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm font-semibold text-white">Facturas claras</div>
                <div className="mt-1 text-sm leading-6 text-white/60">Consulta importes, vencimientos y estado de tus facturas.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm font-semibold text-white">Incidencias con seguimiento</div>
                <div className="mt-1 text-sm leading-6 text-white/60">Comunica una incidencia y revisa su evolución desde la ficha.</div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/60">
              Diseñado para que cada consulta tenga contexto, trazabilidad y una respuesta más ágil.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
