import Link from "next/link";

export default function PortalStatCard({ title, value, href }: { title: string; value: string; href?: string }) {
  const content = (
    <>
      <div className="text-sm text-forne-muted">{title}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">{value}</div>
    </>
  );

  const className = "block rounded-2xl border border-forne-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-forne-ink/30 hover:shadow-md";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-forne-line bg-white p-5 shadow-sm">
      {content}
    </div>
  );
}
