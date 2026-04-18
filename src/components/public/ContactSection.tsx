import Link from "next/link";

export default function ContactSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-forne-slate">Contacto</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-forne-forest sm:text-4xl">Hablemos de tu alquiler o de la gestión de tu inmueble</h2>
          <p className="mt-5 text-lg leading-8 text-forne-slate">Si quieres conocer nuestros servicios de alquiler o necesitas más información, puedes contactarnos desde la web o acceder a tu área privada si ya eres cliente.</p>
        </div>
        <div className="mt-8 flex gap-4">
          <Link href="/contacto" className="rounded-2xl bg-forne-forest px-6 py-3.5 text-sm font-semibold text-white">Contactar</Link>
          <Link href="/login" className="rounded-2xl border border-forne-stone bg-forne-cream px-6 py-3.5 text-sm font-semibold text-forne-forest">Acceso clientes</Link>
        </div>
      </div>
    </section>
  );
}
