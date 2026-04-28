import Link from "next/link";

export default function PortalStatCard({ title, value, href }: { title: string; value: string; href?: string }) {
  const content = (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">{title}</div>
      <div className="mt-4 text-4xl font-semibold tracking-tight text-forne-ink">{value}</div>
      <div className="mt-3 h-px w-12 bg-forne-line" />
    </>
  );

  const className = "block rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.3)] transition duration-200 hover:-translate-y-0.5 hover:border-forne-ink/15 hover:shadow-[0_28px_60px_-36px_rgba(15,23,42,0.34)]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.3)]">
      {content}
    </div>
  );
}
