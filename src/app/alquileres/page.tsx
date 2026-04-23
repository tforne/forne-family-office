import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function RentalsPage() {
  return (
    <div className="min-h-screen bg-forne-cloud text-forne-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-forne-muted">Alquileres</div>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Servicios de alquiler con seguimiento profesional</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-forne-muted">
          Gestión de alquiler residencial, documentación centralizada y seguimiento estructurado de incidencias.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {["Gestión operativa", "Facturación y vencimientos", "Incidencias y comunicación"].map((item) => (
            <div key={item} className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-forne-ink">{item}</div>
              <p className="mt-3 text-sm leading-7 text-forne-muted">
                Procesos claros, trazabilidad y una experiencia ordenada para cada inmueble.
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
