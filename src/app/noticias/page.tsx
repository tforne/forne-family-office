import type { Metadata } from "next";
import Link from "next/link";
import { listNewsItems } from "@/lib/content/news";

export const metadata: Metadata = {
  title: "Noticias y avisos para clientes e inquilinos",
  description:
    "Consulta noticias, avisos y novedades relacionadas con inmuebles en alquiler, incidencias y comunicaciones del portal.",
  alternates: {
    canonical: "/noticias"
  }
};

export default async function NewsPage() {
  const newsItems = await listNewsItems();

  return (
    <main className="min-h-screen bg-white py-20 lg:py-28">
      <div className="ffo-shell">
        <div className="max-w-4xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">Noticias y avisos</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#003A6C] sm:text-[2.9rem]">
            Noticias y avisos para clientes e inquilinos
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#605E5C]">
            Aquí puedes consultar avisos, novedades y recordatorios publicados para viviendas,
            locales en alquiler y su comunidad.
          </p>

          <Link
            href="/#noticias"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0078D4] transition hover:text-[#106EBE]"
          >
            <span aria-hidden="true">‹</span>
            Volver a la portada
          </Link>
        </div>

        <div className="mt-12 space-y-5">
          {newsItems.map((item) => (
            <article
              key={item.id}
              id={item.id}
              className="scroll-mt-24 rounded-[20px] border border-[#E1DFDD] bg-white p-6 shadow-[0_18px_40px_-34px_rgba(0,58,108,0.22)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className="inline-flex rounded-md px-3 py-1 text-xs font-semibold"
                  style={{
                    color: item.categoryColor,
                    backgroundColor: item.categoryBackground
                  }}
                >
                  {item.category}
                </span>
                <span className="text-sm text-[#A19F9D]">{item.date}</span>
              </div>

              <h2 className="mt-5 text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-[#0F172A]">
                {item.title}
              </h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-[#605E5C]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
