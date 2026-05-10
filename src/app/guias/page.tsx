import type { Metadata } from "next";
import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";

const guides = [
  {
    href: "/guias/portal-privado",
    title: "Como funciona el portal privado",
    description:
      "Que puede hacer un cliente dentro del portal, que secciones existen y como aprovechar mejor el autoservicio."
  },
  {
    href: "/guias/incidencias-alquiler",
    title: "Que hacer si tienes una incidencia en el alquiler",
    description:
      "Pasos para comunicar una averia, una consulta o una solicitud con la informacion que ayuda a tramitarla mejor."
  },
  {
    href: "/guias/facturas-y-vencimientos",
    title: "Como consultar facturas y vencimientos",
    description:
      "Guia para revisar importes, fechas, estados y copias de facturas desde el portal privado."
  }
];

export const metadata: Metadata = {
  title: "Guias del portal y gestion del alquiler",
  description:
    "Guias practicas sobre portal privado, incidencias, facturas y gestion del alquiler para clientes e inquilinos.",
  alternates: {
    canonical: "/guias"
  }
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="py-20 lg:py-28">
        <div className="ffo-shell">
          <div className="ffo-panel max-w-5xl p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="ffo-accent-line" />
              <span className="ffo-kicker">Guias</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
              Guias para entender mejor a quien servimos y como gestionamos cada alquiler.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5D6776]">
              Reunimos respuestas pensadas para clientes e inquilinos que quieren saber como
              funciona el servicio, que pueden esperar y como usar mejor el portal.
            </p>
          </div>

          <div className="mt-10 grid gap-4 xl:grid-cols-3">
            {guides.map((guide) => (
              <Link
              key={guide.href}
              href={guide.href}
              className="ffo-elevate rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/90 p-6"
            >
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1B6FD8]">
                <BrandIcon name="guide" className="h-4 w-4" />
                Guia
              </div>
              <h2 className="text-[1.55rem] font-semibold text-[#18202B]">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#5D6776]">{guide.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1B6FD8]">
                Leer guia
                <BrandIcon name="arrow" className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
