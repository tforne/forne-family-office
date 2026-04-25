"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/invoices", label: "Facturas" },
  { href: "/portal/incidents", label: "Incidencias" },
  { href: "/portal/profile", label: "Perfil" },
];

const adminItems = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/invoices", label: "Facturas" },
  { href: "/portal/incidents", label: "Incidencias" },
  { href: "/portal/admin/users", label: "Usuarios" },
  { href: "/portal/admin/news", label: "Noticias" },
];

export default function PortalSidebar({ showAdmin = false }: { showAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleItems = showAdmin ? adminItems : items;

  const onLogout = async () => {
    const confirmed = window.confirm("¿Quieres cerrar la sesión y salir del portal?");
    if (!confirmed) return;

    await fetch("/api/auth/logout", { method: "POST" });
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
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                active ? "bg-forne-ink text-white shadow-sm" : "text-forne-muted hover:bg-forne-cloud hover:text-forne-ink"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <div className="border-b border-forne-line bg-white px-5 py-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/portal" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forne-ink text-sm font-semibold text-white shadow-sm">
              F
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-forne-ink">Forné Portal</div>
              <div className="text-xs text-forne-muted">Área privada</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-forne-line px-3 py-2 text-xs font-semibold text-forne-muted"
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
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                    active ? "bg-forne-ink text-white" : "border border-forne-line bg-white text-forne-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="hidden w-72 flex-col border-r border-forne-line bg-white lg:flex">
      <div className="border-b border-forne-line p-6">
        <Link href="/portal" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forne-ink text-sm font-semibold text-white shadow-sm">
            F
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-forne-ink">Forné Portal</div>
            <div className="text-xs text-forne-muted">Área privada</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6">
        {navItems}
      </nav>
      <div className="border-t border-forne-line p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-forne-line px-4 py-3 text-left text-sm font-medium text-forne-muted transition hover:bg-forne-cloud hover:text-forne-ink"
        >
          Salir
        </button>
      </div>
      </aside>
    </>
  );
}
