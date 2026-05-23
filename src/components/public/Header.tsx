"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/public/LanguageSwitcher";
import { getLocalizedPath, getPublicCopy, type PublicLocale, type PublicRouteKey } from "@/lib/i18n/public";

type HeaderProps = {
  locale: PublicLocale;
  routeKey: PublicRouteKey;
};

export default function Header({ locale, routeKey }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const localized = getPublicCopy(locale);
  const navItems = [
    { href: getLocalizedPath(locale, "home", "#quienes-somos"), label: localized.header.about },
    { href: getLocalizedPath(locale, "home", "#servicios"), label: localized.header.services },
    { href: getLocalizedPath(locale, "home", "#portal"), label: localized.header.portal },
    { href: getLocalizedPath(locale, "contact"), label: localized.header.contact }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(22,32,44,0.06)] bg-[rgba(249,250,251,0.88)] backdrop-blur-xl">
      <div className="ffo-shell flex items-center justify-between py-4">
        <Link href={getLocalizedPath(locale, "home")} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#10233A] text-sm font-semibold text-white shadow-[0_14px_28px_-20px_rgba(10,25,44,0.32)]">
            F
          </div>
          <div>
            <div className="font-[var(--font-display)] text-xl font-semibold leading-none tracking-[0.01em] text-[#18202B]">
              Forné Family Office
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#8B7C66]">
              {localized.site.brandLine}
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="ffo-link-underline text-sm font-medium text-[#364152] hover:text-[#10233A]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <LanguageSwitcher locale={locale} routeKey={routeKey} />
          </div>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="ffo-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-[14px] text-[#18202B] transition hover:border-[#B89B6D] hover:text-[#10233A] lg:hidden"
          >
            {isMenuOpen ? "×" : "☰"}
          </button>
          <Link href="/login" className="hidden text-sm font-medium text-[#10233A] transition hover:text-[#B89B6D] lg:inline-flex">
            {localized.site.clientAccess}
          </Link>
          <Link href={getLocalizedPath(locale, "home", "#disponibilidad")} className="ffo-button-primary rounded-[14px] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-[1.03]">
            {localized.site.startConversation}
          </Link>
        </div>
      </div>

      {isMenuOpen ? (
        <div id="public-mobile-menu" className="border-t border-[rgba(24,32,43,0.08)] bg-[rgba(255,255,255,0.96)] lg:hidden">
          <nav className="ffo-shell grid gap-2 py-4">
            <div className="mb-2">
              <LanguageSwitcher locale={locale} routeKey={routeKey} />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-[16px] px-4 py-3 text-sm font-medium text-[#323130] transition hover:bg-[#F6F1E8] hover:text-[#10233A]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="ffo-button-secondary rounded-[16px] px-4 py-3 text-sm font-semibold text-[#10233A] transition hover:bg-[#F6F1E8]"
            >
              {localized.site.clientAccess}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
