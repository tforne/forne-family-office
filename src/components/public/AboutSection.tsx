import Image from "next/image";
import BrandIcon from "@/components/brand/BrandIcon";
import { getPublicCopy, type PublicLocale } from "@/lib/i18n/public";

const TEAM_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663597210431/hiBkoZ96kcMnMZzSuRj7QD/montornes-reunion-bZEqzwTwSLMFKRFnp7K8Db.webp";

export default function AboutSection({ locale }: { locale: PublicLocale }) {
  const localized = getPublicCopy(locale);

  return (
    <section id="quienes-somos" className="bg-transparent pb-10 pt-1 lg:pb-14 lg:pt-2">
      <div className="ffo-shell grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-16">
        <div className="relative">
          <div className="absolute -left-5 top-10 h-40 w-40 rounded-[32px] bg-[#F1E7D7]/60 blur-2xl" />
          <div className="ffo-premium-frame rounded-[32px] p-3">
            <div className="relative overflow-hidden rounded-[24px]">
              <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(10,24,41,0.04)_0%,rgba(10,24,41,0.2)_100%)]" />
              <Image
                src={TEAM_IMAGE}
                alt={localized.home.about.imageAlt}
                width={1200}
                height={1400}
                quality={92}
                sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 34vw, 100vw"
                className="h-[360px] w-full object-cover object-center [filter:saturate(1.02)_contrast(1.01)] sm:h-[440px] lg:h-[490px]"
              />
            </div>
          </div>
          <div className="absolute -bottom-5 right-0 rounded-[22px] border border-[rgba(184,155,109,0.24)] bg-[rgba(255,255,255,0.94)] p-5 shadow-[0_26px_46px_-28px_rgba(10,25,44,0.34)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B89B6D]">
              {localized.home.about.continuityLabel}
            </div>
            <div className="mt-2 text-3xl font-semibold text-[#10233A]">35+</div>
            <p className="mt-1 max-w-[170px] text-xs leading-5 text-[#5A6675]">
              {localized.home.about.continuityText}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="ffo-accent-line" />
            <span className="ffo-kicker">{localized.home.about.kicker}</span>
          </div>

          <h2 className="max-w-[16ch] text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#10233A] sm:text-[2.8rem] lg:max-w-[17ch]">
            {localized.home.about.title}
          </h2>

          <p className="mt-5 text-base leading-8 text-[#5A6675]">
            {localized.home.about.body1}
          </p>

          <p className="mt-5 text-base leading-8 text-[#5A6675]">
            {localized.home.about.body2}
          </p>

          <div className="mt-8 grid gap-3">
            {localized.home.about.points.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#F4EEE4] text-[#B89B6D]">
                  <BrandIcon name="trust" className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm leading-6 text-[#2D3947]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {localized.home.about.principles.map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] border border-[rgba(22,32,44,0.08)] bg-white/88 p-5 shadow-[0_16px_36px_-30px_rgba(10,25,44,0.18)]"
              >
                <h3 className="text-base font-semibold uppercase tracking-[0.14em] text-[#10233A]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#5A6675]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
