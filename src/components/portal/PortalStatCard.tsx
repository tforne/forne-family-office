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
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7f8896]">{title}</div>
        {href ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(184,155,109,0.18)] bg-[linear-gradient(180deg,rgba(250,246,239,0.98)_0%,rgba(244,236,225,0.92)_100%)] text-[#b89b6d] shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
            <BrandIcon name="arrow" className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(15,35,58,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,248,250,0.92)_100%)] text-[#7f8896] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
            <BrandIcon name="clarity" className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-6 text-4xl font-semibold tracking-tight text-forne-ink">{value}</div>
      {description ? (
        <p className="mt-3 max-w-xs text-sm leading-6 text-forne-muted">{description}</p>
      ) : null}
      <div className="mt-5 h-px w-14 bg-gradient-to-r from-[rgba(184,155,109,0.55)] to-transparent" />
    </>
  );

  const className = "ffo-portal-card block rounded-[28px] p-5 transition duration-200 hover:-translate-y-1 hover:border-[rgba(184,155,109,0.2)] hover:shadow-[0_34px_80px_-46px_rgba(34,42,56,0.26)] sm:p-6";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className="ffo-portal-card rounded-[28px] p-5 sm:p-6">
      {content}
    </div>
  );
}
