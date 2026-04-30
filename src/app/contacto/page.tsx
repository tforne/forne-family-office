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
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-forne-muted">Contacto</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          Contacto para alquiler de pisos y locales
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-forne-muted">
          Cuéntanos si buscas un piso en alquiler, un local comercial o apoyo en la gestión de un
          inmueble y revisaremos la mejor forma de ayudarte.
        </p>
        <div className="mt-10 max-w-2xl rounded-[28px] border border-forne-line bg-white p-8 shadow-sm">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
