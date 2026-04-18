"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/contracts", label: "Contratos" },
  { href: "/portal/invoices", label: "Facturas" },
  { href: "/portal/incidents", label: "Incidencias" },
  { href: "/portal/documents", label: "Documentos" },
  { href: "/portal/profile", label: "Perfil" },
];

export default function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r border-black/5 bg-white lg:block">
      <div className="p-6">
        <div className="text-lg font-semibold text-forne-forest">Forné Portal</div>
        <div className="mt-1 text-sm text-forne-slate">Área privada de clientes</div>
      </div>
      <nav className="px-4 pb-6">
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
    </aside>
  );
}
