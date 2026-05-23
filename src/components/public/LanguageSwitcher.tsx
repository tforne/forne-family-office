"use client";

import Link from "next/link";
import { getLocalizedPath, localeLabels, publicLocales, type PublicLocale, type PublicRouteKey } from "@/lib/i18n/public";

type LanguageSwitcherProps = {
  locale: PublicLocale;
  routeKey: PublicRouteKey;
};

export default function LanguageSwitcher({ locale, routeKey }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[rgba(22,32,44,0.08)] bg-white/82 p-1">
      {publicLocales.map((item) => {
        const active = item === locale;

        return (
          <Link
            key={item}
            href={getLocalizedPath(item, routeKey)}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
              active ? "bg-[#10233A] text-white" : "text-[#5A6675] hover:bg-[#F5EFE6] hover:text-[#10233A]"
            }`}
          >
            {localeLabels[item]}
          </Link>
        );
      })}
    </div>
  );
}
