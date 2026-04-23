import Link from "next/link";

export default function ContactSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-forne-muted">Contacto</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-forne-ink sm:text-4xl">Hablemos de tu alquiler o de la gestión de tu inmueble</h2>
          <p className="mt-5 text-lg leading-8 text-forne-muted">Si quieres conocer nuestros servicios o necesitas más información, puedes contactarnos desde la web o acceder a tu área privada si ya eres cliente.</p>
        </div>
        <div className="mt-8 flex gap-4">
          <Link href="/contacto" className="rounded-xl bg-forne-ink px-6 py-3.5 text-sm font-semibold text-white shadow-sm">Contactar</Link>
          <Link href="/login" className="rounded-xl border border-forne-line bg-white px-6 py-3.5 text-sm font-semibold text-forne-ink shadow-sm">Acceso clientes</Link>
        </div>
      </div>
    </section>
  );
}
