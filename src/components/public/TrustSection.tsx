import { getPublicCopy, type PublicLocale } from "@/lib/i18n/public";

export default function TrustSection({ locale }: { locale: PublicLocale }) {
  const localized = getPublicCopy(locale);

  return (
    <section className="bg-transparent pb-10 pt-1 lg:pb-14 lg:pt-2">
      <div className="ffo-shell">
        <div className="ffo-panel rounded-[30px] p-8 lg:p-10">
          <div className="max-w-[58rem]">
            <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">{localized.home.trust.kicker}</span>
          </div>
            <h2 className="max-w-[20ch] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10233A] sm:text-[2.7rem]">
              {localized.home.trust.title}
            </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5D6776]">
            {localized.home.trust.body}
          </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {localized.home.trust.highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(24,32,43,0.1)] bg-white/84 px-4 py-2 text-sm text-[#18202B]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
