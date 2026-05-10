import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";

export const metadata: Metadata = {
  title: "Como consultar facturas y vencimientos",
  description:
    "Guia sobre como consultar facturas, estados, importes pendientes y solicitar copias desde el portal privado.",
  alternates: {
    canonical: "/guias/facturas-y-vencimientos"
  }
};

const points = [
  "La seccion Facturas muestra importes, fechas y estado de pago.",
  "Si una factura tiene importe pendiente, conviene revisar primero el vencimiento.",
  "Desde el portal se puede solicitar copia cuando se necesite una factura concreta.",
  "El panel de inicio destaca los recibos pendientes y la proxima referencia economica."
];

export default function InvoicesGuidePage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="py-20 lg:py-28">
        <div className="ffo-shell">
          <div className="ffo-panel max-w-5xl p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="ffo-accent-line" />
              <span className="ffo-kicker">Guia de facturas</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
              Como consultar facturas y vencimientos del alquiler.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5D6776]">
              El portal ayuda a revisar importes, estados y copias de facturas sin depender de una
              gestion manual. Esta guia resume que mirar y donde hacerlo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/portal/invoices" className="ffo-button-primary rounded-[14px] px-5 py-3 text-sm font-semibold text-white">
                Ir a facturas
              </Link>
              <Link href="/guias" className="rounded-[14px] border border-[rgba(27,111,216,0.22)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#1B6FD8]">
                Ver mas guias
              </Link>
            </div>
          </div>

          <section className="mt-10 rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/92 p-6">
            <h2 className="text-[1.7rem] font-semibold text-[#18202B]">Puntos clave</h2>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-[#5D6776]">
              {points.map((point) => (
                <div key={point} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  {point}
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
