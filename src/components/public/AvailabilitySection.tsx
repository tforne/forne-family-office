import { unstable_noStore as noStore } from "next/cache";
import AvailabilityInterestForm from "@/components/public/AvailabilityInterestForm";
import { listPublicFeaturedAssets } from "@/lib/public/featured-assets.service";
import { getPublicCopy, type PublicLocale } from "@/lib/i18n/public";

export default async function AvailabilitySection({ locale }: { locale: PublicLocale }) {
  noStore();
  const localized = getPublicCopy(locale);
  const featuredAssets = (await listPublicFeaturedAssets()).filter(
    (asset) => asset.title.trim() && asset.location.trim() && asset.note.trim()
  );
  const curatedAssets = featuredAssets.slice(0, 2);

  return (
    <section id="disponibilidad" className="bg-transparent pb-12 pt-5 lg:pb-16 lg:pt-7">
      <div className="ffo-shell">
        <div className="ffo-card rounded-[32px] border border-[rgba(22,32,44,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.97)_0%,rgba(246,248,250,0.95)_55%,rgba(248,244,237,0.9)_100%)] p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="ffo-accent-line" />
                <span className="ffo-kicker">{localized.home.availability.kicker}</span>
              </div>
              <h2 className="mt-4 max-w-[14ch] text-3xl font-semibold tracking-[-0.03em] text-[#10233A] sm:text-4xl">
                {localized.home.availability.title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[#5A6675]">
                {localized.home.availability.body}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {localized.home.availability.metrics.map((item) => (
                <article
                  key={`availability-${item.label}`}
                  className="rounded-[22px] border border-[rgba(22,32,44,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,249,251,0.84)_100%)] p-4 shadow-[0_18px_40px_-32px_rgba(10,25,44,0.18)]"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#B89B6D]">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#556272]">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-2">
            {curatedAssets.length > 0 ? (
              curatedAssets.map((asset) => (
                <article
                  key={asset.id}
                  className="ffo-elevate rounded-[24px] border border-[rgba(22,32,44,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(249,250,252,0.92)_100%)] p-6 shadow-[0_20px_40px_-30px_rgba(10,25,44,0.18)]"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B89B6D]">
                    {asset.badge}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.02em] text-[#16202C]">
                    {asset.title}
                  </h3>
                  <div className="mt-2 text-sm font-medium text-[#5A6675]">{asset.location}</div>
                  <div className="mt-4 text-2xl font-semibold text-[#10233A]">{asset.price}</div>
                  <p className="mt-3 text-sm leading-6 text-[#5A6675]">{asset.note}</p>
                </article>
              ))
            ) : (
              <article className="rounded-[24px] border border-dashed border-[rgba(184,155,109,0.42)] bg-white/78 p-6 text-sm leading-7 text-[#5A6675] xl:col-span-2">
                {localized.home.availability.empty}
              </article>
            )}
          </div>

          <AvailabilityInterestForm locale={locale} />
        </div>
      </div>
    </section>
  );
}
