"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmationDialog from "@/components/portal/ConfirmationDialog";

const items = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/notices", label: "Avisos" },
  { href: "/portal/invoices", label: "Facturas" },
  { href: "/portal/incidents", label: "Incidencias" },
  { href: "/portal/profile", label: "Perfil" },
];

const adminItems = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/notices", label: "Avisos" },
  { href: "/portal/invoices", label: "Facturas" },
  { href: "/portal/incidents", label: "Incidencias" },
  { href: "/portal/admin/users", label: "Usuarios" },
  { href: "/portal/admin/featured-assets", label: "Activos" },
  { href: "/portal/admin/news", label: "Noticias" },
];

export default function PortalSidebar({ showAdmin = false }: { showAdmin?: boolean }) {
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
    <ul className="space-y-2">
      {visibleItems.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 ${
                active
                  ? "border border-forne-ink/10 bg-forne-ink text-white shadow-[0_18px_35px_-24px_rgba(7,11,26,0.9)]"
                  : "border border-transparent text-forne-muted hover:border-forne-line hover:bg-white hover:text-forne-ink hover:shadow-sm"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
      <li>
        <button
          type="button"
          onClick={() => setIsLogoutDialogOpen(true)}
          disabled={isLoggingOut}
          className="block w-full rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-medium text-forne-muted transition duration-200 hover:border-forne-line hover:bg-white hover:text-forne-ink hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Salir
        </button>
      </li>
    </ul>
  );

  return (
    <>
      <div className="border-b border-forne-line/80 bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-forne-ink text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(7,11,26,0.8)]">
              F
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
            className="rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-muted shadow-sm transition hover:text-forne-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            Salir
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {visibleItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-forne-ink text-white shadow-[0_14px_28px_-22px_rgba(7,11,26,0.8)]"
                      : "border border-forne-line bg-white text-forne-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="hidden w-80 flex-col border-r border-forne-line/80 bg-[#f6f8fb] lg:flex">
      <div className="border-b border-forne-line/80 p-7">
        <Link href="/portal" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forne-ink text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(7,11,26,0.8)]">
            F
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-forne-ink">Forné Portal</div>
            <div className="text-xs text-forne-muted">Espacio privado de cliente</div>
          </div>
        </Link>
      </div>
      <div className="px-7 pt-6">
        <div className="rounded-3xl border border-forne-line bg-white/80 px-4 py-4 shadow-[0_22px_45px_-34px_rgba(15,23,42,0.28)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">Navegación</div>
          <div className="mt-1 text-sm leading-6 text-forne-muted">
            Acceso directo a tu información y gestiones.
          </div>
        </div>
      </div>
      <nav className="flex-1 px-5 py-6">
        {navItems}
      </nav>
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
