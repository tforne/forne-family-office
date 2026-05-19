import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";

export default function PortalStatCard({
  title,
  value,
  href,
  description
}: {
  title: string;
  value: string;
  href?: string;
  description?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">{title}</div>
        {href ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
            <BrandIcon name="arrow" className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-forne-line bg-white/70 text-forne-muted">
            <BrandIcon name="clarity" className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-6 text-4xl font-semibold tracking-tight text-forne-ink">{value}</div>
      {description ? (
        <p className="mt-3 max-w-xs text-sm leading-6 text-forne-muted">{description}</p>
      ) : null}
      <div className="mt-5 h-px w-14 bg-gradient-to-r from-[#1b6fd8]/45 to-transparent" />
    </>
  );

  const className = "ffo-portal-card block rounded-[28px] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#1b6fd8]/14 hover:shadow-[0_34px_80px_-46px_rgba(15,47,87,0.34)]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className="ffo-portal-card rounded-[28px] p-6">
      {content}
    </div>
  );
}
