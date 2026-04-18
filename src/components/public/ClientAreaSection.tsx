import Link from "next/link";

export default function ClientAreaSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="overflow-hidden rounded-[36px] bg-forne-forest px-8 py-14 text-white shadow-soft lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Área privada</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Un espacio privado para nuestros clientes e inquilinos</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">Consulta contratos, facturas, incidencias y documentación desde un portal diseñado para ofrecer visibilidad, orden y seguimiento continuo.</p>
          </div>
          <div className="rounded-[28px] bg-white/10 p-6 ring-1 ring-white/15">
            <div className="grid gap-3">
              {['Contratos vigentes e históricos', 'Facturas y vencimientos', 'Incidencias y estado', 'Documentación disponible'].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">{item}</div>
              ))}
            </div>
            <Link href="/login" className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-forne-forest">Acceso clientes</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
