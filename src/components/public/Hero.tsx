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

        <div className="rounded-[32px] border border-forne-stone bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-forne-cream p-4"><div className="text-xs text-forne-slate">Inmuebles</div><div className="mt-2 text-2xl font-semibold text-forne-forest">42</div></div>
            <div className="rounded-2xl bg-forne-cream p-4"><div className="text-xs text-forne-slate">Contratos activos</div><div className="mt-2 text-2xl font-semibold text-forne-forest">37</div></div>
            <div className="rounded-2xl bg-forne-cream p-4"><div className="text-xs text-forne-slate">Atención digital</div><div className="mt-2 text-2xl font-semibold text-forne-forest">24/7</div></div>
          </div>

          <div className="mt-5 rounded-[28px] border border-forne-stone bg-forne-cream p-5">
            <div className="text-sm font-semibold text-forne-forest">Área privada de clientes</div>
            <div className="mt-2 text-sm leading-7 text-forne-slate">
              Consulta contratos, facturas, incidencias y documentos desde un espacio privado diseñado para ofrecer claridad, seguimiento y comodidad.
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Contratos', 'Facturas', 'Incidencias', 'Documentos'].map((item) => (
                <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-forne-forest shadow-sm">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
