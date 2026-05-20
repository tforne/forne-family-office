import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sin conexión",
  description:
    "Página de apoyo cuando no hay conexión disponible en la versión instalada de Forné Family Office.",
  robots: {
    index: false,
    follow: false
  }
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="ffo-shell flex min-h-screen items-center py-10">
        <section className="ffo-panel mx-auto max-w-2xl p-8 text-center sm:p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#1B6FD8]">
            Modo sin conexión
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0F2F57] sm:text-5xl">
            Ahora mismo no hay conexión disponible
          </h1>
          <p className="mt-5 text-base leading-8 text-[#5D6776]">
            Puedes volver a intentar cuando recuperes internet. Las páginas públicas principales
            quedan preparadas para abrir más rápido, pero el portal privado y sus datos en tiempo
            real siguen necesitando conexión segura.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="ffo-button-primary rounded-[14px] px-5 py-3 text-sm font-semibold text-white"
            >
              Volver a inicio
            </Link>
            <Link
              href="/contacto"
              className="ffo-button-secondary rounded-[14px] px-5 py-3 text-sm font-semibold text-[#0F2F57]"
            >
              Ir a contacto
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
