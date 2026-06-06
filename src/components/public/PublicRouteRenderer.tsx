import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";
import AboutSection from "@/components/public/AboutSection";
import AvailabilitySection from "@/components/public/AvailabilitySection";
import ClientAreaSection from "@/components/public/ClientAreaSection";
import ContactForm from "@/components/public/ContactForm";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import NewsSection from "@/components/public/NewsSection";
import ServicesSection from "@/components/public/ServicesSection";
import TrustSection from "@/components/public/TrustSection";
import { listBundledNewsItemsForLocale } from "@/lib/public/bundled-news";
import { env } from "@/lib/config/env";
import {
  getLocalizedPath,
  getPublicCopy,
  type PublicLocale,
  type PublicRouteKey
} from "@/lib/i18n/public";

function getFaqSchema(locale: PublicLocale) {
  const localized = getPublicCopy(locale);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localized.home.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function getWebsiteSchema(locale: PublicLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    inLanguage: locale === "ca" ? "ca-ES" : locale === "en" ? "en" : "es-ES"
  };
}

function getOrganizationSchema(locale: PublicLocale) {
  const localized = getPublicCopy(locale);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Forné Family Office",
    url: env.appBaseUrl,
    email: "office@forne.family",
    logo: `${env.appBaseUrl}/icon.png`,
    description: localized.home.metadata.description,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "office@forne.family",
        availableLanguage: ["es", "ca", "en"],
        areaServed: ["ES"]
      }
    ]
  };
}

function renderGuideCards(locale: PublicLocale) {
  const localized = getPublicCopy(locale);
  const page = localized.routes.guides;

  return (
    <div className="mt-10 grid gap-4 xl:grid-cols-3">
      {page.guideCards?.map((guide) => (
        <Link
          key={guide.routeKey}
          href={getLocalizedPath(locale, guide.routeKey)}
          className="ffo-elevate rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/90 p-6"
        >
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1B6FD8]">
            <BrandIcon name="guide" className="h-4 w-4" />
            {localized.home.guides.cardLabel}
          </div>
          <h2 className="mt-3 text-[1.55rem] font-semibold text-[#18202B]">{guide.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[#5D6776]">{guide.description}</p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1B6FD8]">
            {localized.home.guides.readGuide}
            <BrandIcon name="arrow" className="h-4 w-4" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function renderGuideSections(locale: PublicLocale, routeKey: "guidesPortal" | "guidesIncidents" | "guidesInvoices") {
  const page = getPublicCopy(locale).routes[routeKey];

  return (
    <div className="mt-10 grid gap-4">
      {page.items?.map((section) => (
        <section key={section.title} className="rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/92 p-6">
          <h2 className="text-[1.7rem] font-semibold text-[#18202B]">{section.title}</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#5D6776]">
            {section.items.map((item) => (
              <li key={item} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default async function PublicRouteRenderer({
  locale,
  routeKey
}: {
  locale: PublicLocale;
  routeKey: PublicRouteKey;
}) {
  const localized = getPublicCopy(locale);

  if (routeKey === "home") {
    const faqSchema = getFaqSchema(locale);
    const websiteSchema = getWebsiteSchema(locale);
    const organizationSchema = getOrganizationSchema(locale);

    return (
      <main className="min-h-screen bg-transparent">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <Header locale={locale} routeKey={routeKey} />
        <Hero locale={locale} />
        <AboutSection locale={locale} />
        <ServicesSection locale={locale} />
        <TrustSection locale={locale} />
        <AvailabilitySection locale={locale} />
        <ClientAreaSection locale={locale} />
        <ContactSection locale={locale} />
        <Footer locale={locale} routeKey={routeKey} />
      </main>
    );
  }

  if (routeKey === "rentals") {
    const page = localized.routes.rentals;

    return (
      <div className="min-h-screen bg-forne-cloud text-forne-ink">
        <Header locale={locale} routeKey={routeKey} />
        <main className="px-6 py-20 lg:px-8">
          <section className="mx-auto max-w-7xl rounded-[36px] bg-[linear-gradient(135deg,#EFF6FC_0%,#FFFFFF_55%,#F7F8FA_100%)] px-8 py-12 shadow-[0_34px_80px_-48px_rgba(0,58,108,0.35)] lg:px-12 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#0078D4]">{page.heroKicker}</div>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.03em] text-[#003A6C] sm:text-5xl">
                  {page.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-forne-muted">{page.body}</p>
              </div>

              <div className="grid gap-4">
                {page.cards?.map((item) => (
                  <div key={item} className="rounded-[24px] border border-[#D7E7F5] bg-white/90 px-5 py-4 text-sm font-medium text-[#0F172A]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto mt-14 max-w-7xl">
            <div className="grid gap-6 md:grid-cols-3">
              {page.sections?.map((item) => (
                <div key={item.title} className="rounded-[28px] border border-forne-line bg-white p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.24)]">
                  <div className="text-lg font-semibold text-forne-ink">{item.title}</div>
                  <p className="mt-3 text-sm leading-7 text-forne-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-14 max-w-7xl rounded-[32px] border border-[#D7E7F5] bg-white p-8 shadow-[0_30px_70px_-48px_rgba(0,58,108,0.22)] lg:p-10">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0078D4]">{page.listTitle}</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#003A6C]">
                {page.title}
              </h2>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {page.highlights?.map((item) => (
                <div key={item} className="rounded-[22px] bg-[#F8FBFE] p-5 text-sm leading-7 text-forne-muted">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer locale={locale} routeKey={routeKey} />
      </div>
    );
  }

  if (routeKey === "contact") {
    const page = localized.routes.contact;

    return (
      <div className="min-h-screen bg-forne-cloud text-forne-ink">
        <Header locale={locale} routeKey={routeKey} />
        <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <section>
              <div className="text-xs font-semibold uppercase tracking-[0.32em] text-forne-muted">{page.heroKicker}</div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#003A6C] sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-forne-muted">{page.body}</p>

              <div className="mt-10 rounded-[28px] bg-[#003A6C] p-7 text-white shadow-[0_28px_70px_-38px_rgba(0,58,108,0.5)]">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  {page.listTitle}
                </div>
                <div className="mt-4 grid gap-3">
                  {page.listItems?.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#D9E8F6]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-forne-line bg-white p-8 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
              <div className="text-sm font-semibold text-forne-ink">{localized.home.contact.writeUs}</div>
              <p className="mt-2 text-sm leading-7 text-forne-muted">{localized.forms.contact.help}</p>
              <div className="mt-6">
                <ContactForm locale={locale} />
              </div>
            </section>
          </div>
        </main>
        <Footer locale={locale} routeKey={routeKey} />
      </div>
    );
  }

  if (routeKey === "guides") {
    const page = localized.routes.guides;

    return (
      <div className="min-h-screen bg-transparent">
        <Header locale={locale} routeKey={routeKey} />
        <main className="py-20 lg:py-28">
          <div className="ffo-shell">
            <div className="ffo-panel max-w-5xl p-8 lg:p-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="ffo-accent-line" />
                <span className="ffo-kicker">{page.heroKicker}</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
                {page.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#5D6776]">{page.body}</p>
            </div>
            {renderGuideCards(locale)}
          </div>
        </main>
        <Footer locale={locale} routeKey={routeKey} />
      </div>
    );
  }

  if (routeKey === "guidesPortal" || routeKey === "guidesIncidents" || routeKey === "guidesInvoices") {
    const page = localized.routes[routeKey];

    return (
      <div className="min-h-screen bg-transparent">
        <Header locale={locale} routeKey={routeKey} />
        <main className="py-20 lg:py-28">
          <div className="ffo-shell">
            <div className="ffo-panel max-w-5xl p-8 lg:p-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="ffo-accent-line" />
                <span className="ffo-kicker">{page.heroKicker}</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
                {page.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#5D6776]">{page.body}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={routeKey === "guidesPortal" ? "/login" : routeKey === "guidesIncidents" ? "/portal/incidents" : "/portal/invoices"} className="ffo-button-primary rounded-[14px] px-5 py-3 text-sm font-semibold text-white">
                  {page.ctaPrimary}
                </Link>
                <Link href={getLocalizedPath(locale, "guides")} className="rounded-[14px] border border-[rgba(27,111,216,0.22)] bg-white/75 px-5 py-3 text-sm font-semibold text-[#1B6FD8]">
                  {page.ctaSecondary}
                </Link>
              </div>
            </div>
            {renderGuideSections(locale, routeKey)}
          </div>
        </main>
        <Footer locale={locale} routeKey={routeKey} />
      </div>
    );
  }

  const page = localized.routes.news;
  const newsItems = await listBundledNewsItemsForLocale(locale);

  return (
    <div className="min-h-screen bg-transparent">
      <Header locale={locale} routeKey={routeKey} />
      <main className="py-20 lg:py-28">
        <div className="ffo-shell">
          <div className="ffo-panel max-w-5xl p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="ffo-accent-line" />
              <span className="ffo-kicker">{page.heroKicker}</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#003A6C] sm:text-[2.9rem]">
              {page.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#605E5C]">
              {page.body}
            </p>

            <Link
              href={getLocalizedPath(locale, "home", "#noticias")}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0078D4] transition hover:text-[#106EBE]"
            >
              <span aria-hidden="true">‹</span>
              {page.backHome}
            </Link>
          </div>

          <div className="mt-12 space-y-5">
            {newsItems.map((item) => (
              <article
                key={item.id}
                id={item.id}
                className="ffo-elevate scroll-mt-24 rounded-[20px] border border-[#E1DFDD] bg-white p-6 shadow-[0_18px_40px_-34px_rgba(0,58,108,0.22)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <span
                    className="inline-flex rounded-md px-3 py-1 text-xs font-semibold"
                    style={{
                      color: item.categoryColor,
                      backgroundColor: item.categoryBackground
                    }}
                  >
                    {item.category}
                  </span>
                  <span className="text-sm text-[#A19F9D]">{item.date}</span>
                </div>

                <h2 className="mt-5 text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-[#0F172A]">
                  {item.title}
                </h2>
                <p className="mt-4 max-w-4xl text-base leading-8 text-[#605E5C]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} routeKey={routeKey} />
    </div>
  );
}
