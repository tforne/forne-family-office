import Link from "next/link";
import { getLocalizedPath, getPublicCopy, type PublicLocale } from "@/lib/i18n/public";

export default function FaqSection({ locale }: { locale: PublicLocale }) {
  const localized = getPublicCopy(locale);

  return (
    <section className="bg-transparent pb-12 pt-0 lg:pb-16">
      <div className="ffo-shell">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">{localized.home.faq.kicker}</span>
          </div>
          <h2 className="text-4xl font-semibold leading-tight text-[#0F2F57] sm:text-[2.9rem]">
            {localized.home.faq.title}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {localized.home.faq.items.map((item) => (
            <article
              key={item.question}
              className="ffo-elevate rounded-[24px] border border-[rgba(24,32,43,0.08)] bg-white/90 p-6"
            >
              <h3 className="text-[1.45rem] font-semibold text-[#18202B]">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5D6776]">{item.answer}</p>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href={getLocalizedPath(locale, "guides")}
            className="inline-flex items-center rounded-[14px] border border-[rgba(27,111,216,0.22)] bg-white/80 px-5 py-3 text-sm font-semibold text-[#1B6FD8] transition hover:bg-[#EDF5FF]"
          >
            {localized.home.faq.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
