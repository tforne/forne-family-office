import Link from "next/link";
import LanguageSwitcher from "@/components/public/LanguageSwitcher";
import { getLocalizedPath, getPublicCopy, type PublicLocale, type PublicRouteKey } from "@/lib/i18n/public";

type FooterProps = {
  locale: PublicLocale;
  routeKey: PublicRouteKey;
};

export default function Footer({ locale, routeKey }: FooterProps) {
  const localized = getPublicCopy(locale);

  return (
    <footer className="ffo-noise relative overflow-hidden bg-[linear-gradient(180deg,#0F172A_0%,#18202B_100%)] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(217,200,176,0.75)_50%,transparent_100%)]" />
      <div className="ffo-shell relative py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <Link href={getLocalizedPath(locale, "home")} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#D9C8B0_0%,#2F87DE_100%)] text-sm font-semibold text-white shadow-[0_18px_38px_-22px_rgba(15,47,87,0.8)]">
                F
              </div>
              <div>
                <div className="font-[var(--font-display)] text-2xl font-semibold leading-tight text-white">
                  Forné Family Office
                </div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#9AA7B8]">
                  {localized.site.brandLine}
                </div>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#AAB4C2]">
              {localized.footer.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Barcelona y entorno", localized.site.privateAccess, localized.site.directAttention].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#DDE8F6]"
                >
                  {item}
                </span>
              ))}
            </div>
            <a
              href="mailto:office@forne.family"
              className="mt-4 inline-flex text-sm text-[#5BA7E0] transition hover:text-[#8CBFE8]"
            >
              office@forne.family
            </a>
            <div className="mt-5">
              <LanguageSwitcher locale={locale} routeKey={routeKey} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A8886]">{localized.footer.navigation}</div>
            <div className="mt-4 grid gap-3 text-sm text-[#BFC8D4]">
              <Link href={getLocalizedPath(locale, "home")} className="transition hover:text-white">{localized.site.homeLabel}</Link>
              <Link href={getLocalizedPath(locale, "rentals")} className="transition hover:text-white">{localized.footer.rentals}</Link>
              <Link href={getLocalizedPath(locale, "home", "#quienes-somos")} className="transition hover:text-white">{localized.footer.about}</Link>
              <Link href={getLocalizedPath(locale, "home", "#servicios")} className="transition hover:text-white">{localized.footer.services}</Link>
              <Link href={getLocalizedPath(locale, "contact")} className="transition hover:text-white">{localized.footer.contact}</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A8886]">{localized.footer.privateArea}</div>
            <div className="mt-4 grid gap-3 text-sm text-[#BFC8D4]">
              <Link href="/login" className="transition hover:text-white">{localized.site.clientAccess}</Link>
              <span>{localized.footer.invoices}</span>
              <span>{localized.footer.incidents}</span>
              <span>{localized.footer.communications}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A8886]">{localized.footer.contact}</div>
            <div className="mt-4 grid gap-3 text-sm text-[#BFC8D4]">
              <a href="mailto:office@forne.family" className="transition hover:text-white">
                office@forne.family
              </a>
              <span>{localized.footer.location}</span>
              <span>{localized.footer.management}</span>
              <span>{localized.footer.availability}</span>
            </div>
            <Link
              href="/login"
              className="ffo-button-primary mt-5 inline-flex rounded-[14px] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-[1.03]"
            >
              {localized.footer.privateAccess}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#7C8796] sm:flex-row sm:items-center sm:justify-between">
          <div suppressHydrationWarning>© {new Date().getFullYear()} Forné Family Office. {localized.site.allRightsReserved}</div>
          <div className="flex gap-5">
            <span>{localized.site.directAttention}</span>
            <Link href="/login" className="transition hover:text-white">
              {localized.site.privateAccess}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
