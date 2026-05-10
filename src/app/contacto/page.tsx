import type { Metadata } from "next";
import ContactForm from "@/components/public/ContactForm";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Contacto para alquiler de pisos y locales",
  description:
    "Contacta con Forné Family Office para alquiler de pisos, alquiler de locales y gestión profesional de inmuebles en Barcelona y alrededores.",
  alternates: {
    canonical: "/contacto"
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-forne-cloud text-forne-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <section>
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-forne-muted">Contacto</div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#003A6C] sm:text-5xl">
              Hablemos de disponibilidad, gestión o soporte para tu alquiler.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-forne-muted">
              Cuéntanos si buscas un piso en alquiler, un local comercial o apoyo en la gestión de
              un inmueble y revisaremos la mejor forma de ayudarte.
            </p>

            <div className="mt-10 rounded-[28px] bg-[#003A6C] p-7 text-white shadow-[0_28px_70px_-38px_rgba(0,58,108,0.5)]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                Respuesta y atención
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  "Consultas sobre disponibilidad de pisos y locales",
                  "Información sobre el funcionamiento del portal privado",
                  "Contacto general para clientes e inquilinos"
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#D9E8F6]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-forne-line bg-white p-8 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
            <div className="text-sm font-semibold text-forne-ink">Envíanos tu consulta</div>
            <p className="mt-2 text-sm leading-7 text-forne-muted">
              Si nos das contexto sobre la zona, el tipo de inmueble o la gestión que necesitas,
              podremos responderte con más precisión.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
