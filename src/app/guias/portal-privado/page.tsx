import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";

export const metadata: Metadata = {
  title: "Como funciona el portal privado",
  description:
    "Guia sobre como funciona el portal privado para consultar facturas, avisos, incidencias y perfil del cliente.",
  alternates: {
    canonical: "/guias/portal-privado"
  }
};

const sections = [
  {
    title: "Que puedes consultar",
    items: [
      "Facturas y vencimientos del alquiler",
      "Avisos activos y comunicaciones del portal",
      "Incidencias abiertas y su seguimiento",
      "Datos del perfil y contexto asociado al acceso"
    ]
  },
  {
    title: "Para que sirve cada seccion",
    items: [
      "Inicio resume lo mas importante y muestra acciones rapidas.",
      "Facturas permite revisar importes, estados y copias.",
      "Incidencias sirve para abrir nuevas gestiones y seguir las existentes.",
      "Avisos concentra comunicaciones que pueden requerir lectura o confirmacion."
    ]
  },
  {
    title: "Como aprovechar mejor el autoservicio",
    items: [
      "Revisa primero el panel de inicio para detectar pendientes.",
      "Consulta avisos antes de abrir una incidencia si la gestion puede estar ya comunicada.",
      "Usa el portal para mantener el contexto junto a cada contrato o activo."
    ]
  }
];

export default function PortalGuidePage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="py-20 lg:py-28">
        <div className="ffo-shell">
          <div className="ffo-panel max-w-5xl p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="ffo-accent-line" />
              <span className="ffo-kicker">Guia del portal</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
              Como funciona el portal privado de clientes e inquilinos.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5D6776]">
              El portal privado esta pensado para que la informacion del alquiler sea mas accesible
              y para que las gestiones no dependan de cadenas de correos o llamadas sin contexto.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="ffo-button-primary rounded-[14px] px-5 py-3 text-sm font-semibold text-white">
                Acceder al portal
              </Link>
              <Link href="/guias" className="rounded-[14px] border border-[rgba(27,111,216,0.22)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#1B6FD8]">
                Ver mas guias
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4">
            {sections.map((section) => (
              <section key={section.title} className="rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/92 p-6">
                <h2 className="text-[1.7rem] font-semibold text-[#18202B]">{section.title}</h2>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#5D6776]">
                  {section.items.map((item) => (
                    <li key={item} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
