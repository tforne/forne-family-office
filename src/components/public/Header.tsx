"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/#quienes-somos", label: "Quiénes somos" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#noticias", label: "Noticias" },
  { href: "/#portal", label: "Portal" },
  { href: "/contacto", label: "Contacto" }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(24,32,43,0.08)] bg-[rgba(251,253,255,0.82)] backdrop-blur-xl">
      <div className="ffo-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#0F2F57_0%,#1B6FD8_100%)] text-sm font-semibold text-white shadow-[0_18px_38px_-22px_rgba(15,47,87,0.8)]">
            F
          </div>
          <div>
            <div className="font-[var(--font-display)] text-xl font-semibold leading-none tracking-[0.01em] text-[#18202B]">
              Forné Family Office
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">
              Alquileres · Atención · Portal privado
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="ffo-link-underline text-sm font-medium text-[#323130] hover:text-[#0078D4]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="ffo-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-[14px] text-[#18202B] transition hover:border-[#1B6FD8] hover:text-[#1B6FD8] lg:hidden"
          >
            {isMenuOpen ? "×" : "☰"}
          </button>
          <Link href="/login" className="hidden text-sm font-semibold text-[#1B6FD8] transition hover:text-[#0F2F57] lg:inline-flex">
            Acceso clientes
          </Link>
          <Link href="/#disponibilidad" className="ffo-button-primary rounded-[14px] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-[1.03]">
            Consultar disponibilidad
          </Link>
        </div>
      </div>

      {isMenuOpen ? (
        <div id="public-mobile-menu" className="border-t border-[rgba(24,32,43,0.08)] bg-[rgba(255,255,255,0.94)] lg:hidden">
          <nav className="ffo-shell grid gap-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-[16px] px-4 py-3 text-sm font-medium text-[#323130] transition hover:bg-[#EFF6FC] hover:text-[#0078D4]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="ffo-button-secondary rounded-[16px] px-4 py-3 text-sm font-semibold text-[#0078D4] transition hover:bg-[#EFF6FC]"
            >
              Acceso clientes
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
