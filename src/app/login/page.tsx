"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfe_38%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0078D4] text-sm font-semibold text-white shadow-sm">
            F
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-[#201F1E]">Forné Family Office</div>
            <div className="text-xs text-[#605E5C]">Alquileres · Atención · Portal privado</div>
          </div>
        </Link>

        <Link
          href="/"
          className="rounded border border-[#E1DFDD] bg-white px-4 py-2.5 text-sm font-semibold text-[#201F1E] shadow-sm transition hover:border-[#0078D4] hover:text-[#0078D4]"
        >
          Volver al inicio
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 py-10 lg:grid-cols-[1fr_420px] lg:py-16">
        <section className="flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#0078D4]">
            Acceso privado
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#201F1E] sm:text-5xl">
            Tu portal para consultar el alquiler con más claridad y menos fricción.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#605E5C]">
            Accede de forma segura con Microsoft para revisar facturas, incidencias y la información principal de tu contrato en un entorno privado y ordenado.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Facturas al día",
                text: "Consulta importes pendientes y próximos vencimientos."
              },
              {
                title: "Incidencias con seguimiento",
                text: "Visualiza el estado de tus solicitudes y comunicaciones."
              },
              {
                title: "Resumen contractual",
                text: "Ten a mano la información más relevante de tu alquiler."
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-[#E1DFDD] bg-white/90 p-5 shadow-[0_24px_60px_-36px_rgba(0,58,108,0.25)]"
              >
                <div className="text-sm font-semibold text-[#201F1E]">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-[#605E5C]">{item.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-[#E1DFDD] bg-white/95 p-8 shadow-[0_30px_70px_-38px_rgba(0,58,108,0.3)] backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0078D4]">
            Acceso clientes
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#201F1E]">
            Entra al portal privado
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#605E5C]">
            Utiliza tu cuenta Microsoft para acceder a tu información de forma segura.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}

          {message === "logout" ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
              Sesión cerrada correctamente. Gracias por visitar el portal, hasta pronto.
            </div>
          ) : null}

          <div className="mt-8 space-y-4">
            <a
              href="/api/auth/entra"
              className="flex w-full items-center justify-center rounded-2xl bg-[#0078D4] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_38px_-24px_rgba(0,120,212,0.9)] transition hover:bg-[#106EBE]"
            >
              Entrar con Microsoft
            </a>

            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-2xl border border-[#E1DFDD] bg-white px-4 py-3.5 text-sm font-semibold text-[#201F1E] transition hover:border-[#0078D4] hover:text-[#0078D4]"
            >
              Cancelar y volver al inicio
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-[#E1DFDD] bg-[#F8FBFE] px-4 py-4">
            <div className="text-sm font-semibold text-[#201F1E]">Acceso seguro</div>
            <div className="mt-2 text-sm leading-6 text-[#605E5C]">
              La autenticación se realiza con Microsoft Entra para ofrecer un acceso controlado y coherente con tu cuenta autorizada.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfe_38%,#ffffff_100%)] px-6">
          <div className="rounded-3xl border border-[#E1DFDD] bg-white px-6 py-5 text-sm font-medium text-[#605E5C] shadow-sm">
            Cargando acceso privado...
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
