import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Alquiler de pisos y locales",
  description:
    "Servicios de alquiler de pisos y locales con seguimiento profesional, gestión operativa, incidencias y facturación clara.",
  alternates: {
    canonical: "/alquileres"
  }
};

export default function RentalsPage() {
  return (
    <div className="min-h-screen bg-forne-cloud text-forne-ink">
      <Header />
      <main className="px-6 py-20 lg:px-8">
        <section className="mx-auto max-w-7xl rounded-[36px] bg-[linear-gradient(135deg,#EFF6FC_0%,#FFFFFF_55%,#F7F8FA_100%)] px-8 py-12 shadow-[0_34px_80px_-48px_rgba(0,58,108,0.35)] lg:px-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#0078D4]">Alquileres</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.03em] text-[#003A6C] sm:text-5xl">
                Alquiler residencial y comercial con una gestión más clara para todas las partes.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-forne-muted">
                Gestionamos viviendas y locales con una combinación de cercanía, seguimiento
                operativo y herramientas digitales pensadas para que el día a día del alquiler sea
                más ordenado.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Seguimiento de facturas y vencimientos",
                "Canal ordenado para incidencias y avisos",
                "Documentación y contexto accesibles desde el portal"
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-[#D7E7F5] bg-white/90 px-5 py-4 text-sm font-medium text-[#0F172A]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Gestión operativa",
                text: "Procesos claros para que la administración del alquiler no dependa de improvisaciones."
              },
              {
                title: "Facturación y vencimientos",
                text: "Importes, estados y próximas fechas visibles para reducir dudas y dar más contexto."
              },
              {
                title: "Incidencias y comunicación",
                text: "Seguimiento estructurado de las necesidades del inmueble con una experiencia más ordenada."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[28px] border border-forne-line bg-white p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.24)]">
                <div className="text-lg font-semibold text-forne-ink">{item.title}</div>
                <p className="mt-3 text-sm leading-7 text-forne-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl rounded-[32px] border border-[#D7E7F5] bg-white p-8 shadow-[0_30px_70px_-48px_rgba(0,58,108,0.22)] lg:p-10">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0078D4]">Qué aporta</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#003A6C]">
              Una experiencia de alquiler más estable, entendible y profesional.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              "Más visibilidad sobre el estado real de cada gestión.",
              "Menos fricción entre comunicaciones, facturas y soporte.",
              "Una relación más cuidada entre gestión, cliente e inquilino."
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FBFE] p-5 text-sm leading-7 text-forne-muted">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
