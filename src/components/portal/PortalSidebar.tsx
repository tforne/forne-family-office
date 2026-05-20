"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import BrandIcon from "@/components/brand/BrandIcon";
import ConfirmationDialog from "@/components/portal/ConfirmationDialog";

const InstallAppButton = dynamic(() => import("@/components/pwa/InstallAppButtonMount"), {
  ssr: false
});

const items = [
  { href: "/portal", label: "Inicio", icon: "clarity" as const },
  { href: "/portal/notices", label: "Avisos", icon: "attention" as const },
  { href: "/portal/invoices", label: "Facturas", icon: "billing" as const },
  { href: "/portal/documents", label: "Documentos", icon: "guide" as const },
  { href: "/portal/incidents", label: "Incidencias", icon: "incident" as const },
  { href: "/portal/incident-requests", label: "Peticiones", icon: "guide" as const },
  { href: "/portal/profile", label: "Perfil", icon: "portal" as const },
];

const adminItems = [
  { href: "/portal", label: "Inicio", icon: "clarity" as const },
  { href: "/portal/notices", label: "Avisos", icon: "attention" as const },
  { href: "/portal/invoices", label: "Facturas", icon: "billing" as const },
  { href: "/portal/documents", label: "Documentos", icon: "guide" as const },
  { href: "/portal/incidents", label: "Incidencias", icon: "incident" as const },
  { href: "/portal/incident-requests", label: "Peticiones", icon: "guide" as const },
  { href: "/portal/admin/users", label: "Usuarios", icon: "operations" as const },
  { href: "/portal/admin/news", label: "Noticias", icon: "guide" as const },
  { href: "/portal/admin/chat", label: "Chat", icon: "portal" as const },
];

export default function PortalSidebar({
  showAdmin = false,
  version
}: {
  showAdmin?: boolean;
  version?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const visibleItems = showAdmin ? adminItems : items;

  const onLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLogoutDialogOpen(false);
    router.push("/");
    router.refresh();
  };

  const navItems = (
    <ul className="space-y-2.5">
      {visibleItems.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`group block rounded-[22px] px-4 py-3.5 text-sm font-medium transition duration-200 ${
                active
                  ? "border border-white/12 bg-white/14 text-white shadow-[0_26px_42px_-28px_rgba(5,12,24,0.7)]"
                  : "border border-transparent text-white/72 hover:border-white/10 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
                    active
                      ? "border-white/12 bg-white/12 text-white"
                      : "border-white/10 bg-white/5 text-white/72 group-hover:border-white/12 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  <BrandIcon name={item.icon} className="h-4 w-4" />
                </span>
                <span className="flex-1">{item.label}</span>
                <span
                  className={`text-white/45 transition ${
                    active ? "translate-x-0 text-white/70" : "group-hover:translate-x-0.5 group-hover:text-white/70"
                  }`}
                >
                  ›
                </span>
              </span>
            </Link>
          </li>
        );
      })}
      <li>
        <button
          type="button"
          onClick={() => setIsLogoutDialogOpen(true)}
          disabled={isLoggingOut}
          className="block w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3.5 text-left text-sm font-medium text-white/72 transition duration-200 hover:border-white/12 hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Salir
        </button>
      </li>
    </ul>
  );

  return (
    <>
      <div className="border-b border-forne-line/70 bg-white/78 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] text-sm font-semibold text-white shadow-[0_20px_35px_-22px_rgba(15,47,87,0.7)]">
              FF
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-forne-ink">Forné Portal</div>
              <div className="text-xs text-forne-muted">Espacio privado de cliente</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            disabled={isLoggingOut}
            className="rounded-xl border border-forne-line bg-white/90 px-3 py-2 text-xs font-semibold text-forne-muted shadow-sm transition hover:text-forne-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            Salir
          </button>
        </div>
        {version ? (
          <div className="mt-3 text-[11px] font-medium text-forne-muted">
            Version {version}
          </div>
        ) : null}
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            {visibleItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "bg-[linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] text-white shadow-[0_16px_30px_-22px_rgba(15,47,87,0.68)]"
                      : "border border-forne-line bg-white/90 text-forne-muted"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <BrandIcon name={item.icon} className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
          <Link
            href="/portal/invoices"
            className="rounded-2xl border border-forne-line bg-white/90 px-4 py-3 text-sm font-semibold text-forne-ink shadow-sm"
          >
            Ver facturas
          </Link>
          <Link
            href="/portal/incidents"
            className="rounded-2xl border border-forne-line bg-white/90 px-4 py-3 text-sm font-semibold text-forne-ink shadow-sm"
          >
            Ver incidencias
          </Link>
        </div>
        <div className="mt-2 sm:hidden">
          <div>
            <InstallAppButton
              className="w-full rounded-2xl border border-forne-line bg-white/90 px-4 py-3 text-sm font-semibold text-forne-ink shadow-sm"
              iosClassName="w-full rounded-2xl border border-forne-line bg-white/90 px-4 py-3 text-sm font-semibold text-forne-ink shadow-sm"
            />
          </div>
        </div>
      </div>

      <aside className="ffo-portal-dark hidden w-[320px] flex-col border-r border-white/8 text-white lg:flex">
        <div className="border-b border-white/8 p-7">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/12 bg-white/10 text-sm font-semibold text-white shadow-[0_22px_42px_-24px_rgba(6,17,33,0.7)]">
              FF
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.12em] text-white">Forné Portal</div>
              <div className="text-xs text-white/58">Espacio privado de cliente</div>
            </div>
          </Link>
        </div>
        <div className="px-6 pt-6">
          <div className="rounded-[28px] border border-white/10 bg-white/8 px-5 py-5 shadow-[0_28px_45px_-30px_rgba(6,17,33,0.58)] backdrop-blur">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/52">Workspace</div>
            <div className="mt-3 text-xl font-semibold tracking-tight text-white">Control centralizado</div>
            <div className="mt-2 text-sm leading-6 text-white/68">
              Accede a tus documentos, avisos y gestiones con una vista clara y profesional.
            </div>
            <div className="mt-5">
              <div>
                <InstallAppButton
                  className="w-full rounded-[20px] border border-white/10 bg-white/12 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                  iosClassName="w-full rounded-[20px] border border-white/10 bg-white/12 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
                />
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-5 py-6">
          {navItems}
        </nav>
        {version ? (
          <div className="border-t border-white/8 px-6 py-5">
            <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 text-xs text-white/62 backdrop-blur">
              Version {version}
            </div>
          </div>
        ) : null}
      </aside>

      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        title="Cerrar sesión"
        description="Vas a salir del portal privado. Si continúas, tendrás que identificarte de nuevo para volver a entrar."
        confirmLabel="Cerrar sesión"
        cancelLabel="Seguir dentro"
        tone="danger"
        isProcessing={isLoggingOut}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={onLogout}
      />
    </>
  );
}
