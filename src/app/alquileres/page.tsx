import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";

const items = [
  ["Gestión de alquiler residencial", "Contratos, seguimiento y atención continuada para inmuebles destinados a alquiler residencial."],
  ["Documentación y trazabilidad", "Organización documental y consulta digital para facilitar visibilidad y orden."],
  ["Seguimiento de incidencias", "Canal estructurado para comunicar, revisar y seguir incidencias asociadas al inmueble."],
];

export default function RentalsPage() {
  return (
    <div className="min-h-screen bg-forne-cream text-forne-forest">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-forne-slate">Alquileres</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Servicios de alquiler con una gestión profesional y cercana</h1>
          <p className="mt-5 text-lg leading-8 text-forne-slate">Ofrecemos una gestión ordenada del alquiler, poniendo el foco en la calidad del servicio, la claridad documental y la atención al inquilino.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map(([title, description]) => (
            <div key={title} className="rounded-[28px] border border-forne-stone bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-forne-forest">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-forne-slate">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex gap-4">
          <Link href="/contacto" className="rounded-2xl bg-forne-forest px-6 py-3.5 text-sm font-semibold text-white">Contactar</Link>
          <Link href="/login" className="rounded-2xl border border-forne-stone bg-white px-6 py-3.5 text-sm font-semibold text-forne-forest">Acceso clientes</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
