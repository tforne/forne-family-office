import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(231,222,209,0.7),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,49,43,0.06),_transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center rounded-full border border-forne-stone bg-white px-4 py-2 text-xs font-medium text-forne-slate shadow-sm">
            Patrimonio, alquileres y atención directa
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-forne-forest sm:text-5xl lg:text-6xl">
            Gestión patrimonial y alquileres con atención personalizada
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-forne-slate">
            En Forné Family Office gestionamos inmuebles en alquiler con una visión a largo plazo, trato cercano y un área privada para consultar contratos, facturas, incidencias y documentación.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/alquileres" className="rounded-2xl bg-forne-forest px-6 py-3.5 text-sm font-semibold text-white">Ver servicios</Link>
            <Link href="/login" className="rounded-2xl border border-forne-stone bg-white px-6 py-3.5 text-sm font-semibold text-forne-forest">Acceso clientes</Link>
          </div>
        </div>

        <div className="self-center rounded-[32px] border border-forne-stone bg-white p-6 shadow-soft">
          <div className="rounded-[28px] border border-forne-stone bg-forne-cream p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">Portal clientes</div>
            <div className="mt-2 text-lg font-semibold text-forne-forest">Área privada de clientes</div>
            <div className="mt-3 text-sm leading-7 text-forne-slate">
              Accede a la información clave de tu relación con Forné Family Office desde un espacio privado, claro y siempre actualizado.
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <div className="text-sm font-semibold text-forne-forest">Facturas</div>
                <div className="mt-1 text-sm leading-6 text-forne-slate">Consulta importes, vencimientos y estado de tus facturas.</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <div className="text-sm font-semibold text-forne-forest">Incidencias</div>
                <div className="mt-1 text-sm leading-6 text-forne-slate">Sigue solicitudes abiertas y revisa el estado de cada gestión.</div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-forne-stone bg-white/60 px-4 py-3 text-sm leading-6 text-forne-slate">
              Contratos y documentos se incorporarán más adelante dentro del mismo portal.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
