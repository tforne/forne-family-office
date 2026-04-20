"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/invoices", label: "Facturas" },
  { href: "/portal/incidents", label: "Incidencias" },
  { href: "/portal/profile", label: "Perfil" },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    const confirmed = window.confirm("¿Quieres cerrar la sesión y salir del portal?");
    if (!confirmed) return;

    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?message=logout");
    router.refresh();
  };

  return (
    <aside className="hidden w-72 flex-col border-r border-black/5 bg-white lg:flex">
      <div className="p-6">
        <div className="text-lg font-semibold text-forne-forest">Forné Portal</div>
        <div className="mt-1 text-sm text-forne-slate">Área privada de clientes</div>
      </div>
      <nav className="flex-1 px-4 pb-6">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} className={`block rounded-xl px-4 py-3 text-sm font-medium ${active ? 'bg-forne-forest text-white' : 'text-forne-slate hover:bg-forne-cream'}`}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-black/5 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-forne-stone px-4 py-3 text-left text-sm font-medium text-forne-slate hover:bg-forne-cream"
        >
          Salir
        </button>
      </div>
    </aside>
  );
}
