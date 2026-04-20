import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function RentalsPage() {
  return (
    <div className="min-h-screen bg-forne-cream text-forne-forest">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Servicios de alquiler</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-forne-slate">
          Gestión de alquiler residencial, documentación centralizada y seguimiento estructurado de incidencias.
        </p>
      </main>
      <Footer />
    </div>
  );
}
