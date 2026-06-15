"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandIcon from "@/components/brand/BrandIcon";

const mobileItems = [
  { href: "/portal", label: "Inicio", icon: "clarity" as const },
  { href: "/portal/notices", label: "Avisos", icon: "attention" as const },
  { href: "/portal/services", label: "Servicios", icon: "operations" as const },
  { href: "/portal/invoices", label: "Facturas", icon: "billing" as const },
  { href: "/portal/incidents", label: "Incidencias", icon: "incident" as const },
  { href: "/portal/profile", label: "Perfil", icon: "portal" as const }
];

export default function PortalBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-[rgba(255,255,255,0.92)] px-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_40px_-30px_rgba(15,47,87,0.25)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-6 gap-1">
        {mobileItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/portal" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-center transition ${
                active
                  ? "bg-[linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] text-white shadow-[0_18px_34px_-24px_rgba(15,47,87,0.65)]"
                  : "text-forne-muted hover:bg-white hover:text-forne-ink"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <BrandIcon name={item.icon} className="h-4 w-4" />
              <span className="mt-1 text-[11px] font-semibold leading-4">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
