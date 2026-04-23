import Link from "next/link";

export default function ClientAreaSection() {
  return (
    <section className="bg-forne-ink py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-white/50">Área privada</span>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">Un acceso privado para gestionar tu alquiler con tranquilidad</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Desde el portal puedes consultar tus facturas, comunicar incidencias y revisar la información asociada a tu inmueble cuando lo necesites, con una experiencia segura y pensada para evitar esperas innecesarias.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="grid gap-3">
              {['Facturas y vencimientos', 'Incidencias y estado', 'Ficha de seguimiento', 'Comunicación con contexto'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">{item}</div>
              ))}
            </div>
            <Link href="/login" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-forne-ink">Acceso clientes</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
