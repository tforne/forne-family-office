import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";

export const metadata: Metadata = {
  title: "Que hacer si tienes una incidencia en el alquiler",
  description:
    "Guia practica para comunicar incidencias, averias, consultas y solicitudes relacionadas con el alquiler.",
  alternates: {
    canonical: "/guias/incidencias-alquiler"
  }
};

const steps = [
  "Comprueba si ya existe un aviso o una incidencia abierta relacionada.",
  "Reune el contexto clave: contrato, zona afectada, desde cuando ocurre y telefono de contacto.",
  "Abre la incidencia desde el portal indicando si es problema, solicitud o consulta.",
  "Aporta una descripcion concreta para facilitar la tramitacion y el seguimiento."
];

const examples = [
  "Averia o problema: fuga de agua, fallo electrico, equipo que no funciona.",
  "Solicitud: peticion de aclaracion, necesidad de revisar un elemento o coordinar acceso.",
  "Consulta: duda sobre una gestion, un aviso o el uso del portal."
];

export default function IncidentsGuidePage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="py-20 lg:py-28">
        <div className="ffo-shell">
          <div className="ffo-panel max-w-5xl p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="ffo-accent-line" />
              <span className="ffo-kicker">Guia de incidencias</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
              Que hacer si tienes una incidencia en el alquiler.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5D6776]">
              Una incidencia se tramita mejor cuando llega con contexto claro. Esta guia resume
              que revisar antes y que informacion ayuda a resolver una gestion con mas rapidez.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/portal/incidents" className="ffo-button-primary rounded-[14px] px-5 py-3 text-sm font-semibold text-white">
                Ir a incidencias
              </Link>
              <Link href="/guias" className="rounded-[14px] border border-[rgba(27,111,216,0.22)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#1B6FD8]">
                Ver mas guias
              </Link>
            </div>
          </div>

          <section className="mt-10 rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/92 p-6">
            <h2 className="text-[1.7rem] font-semibold text-[#18202B]">Pasos recomendados</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-7 text-[#5D6776]">
              {steps.map((step, index) => (
                <li key={step} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-4 rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/92 p-6">
            <h2 className="text-[1.7rem] font-semibold text-[#18202B]">Tipos de gestion mas habituales</h2>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-[#5D6776]">
              {examples.map((item) => (
                <div key={item} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
