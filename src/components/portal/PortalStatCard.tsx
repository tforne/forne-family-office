export default function PortalStatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-forne-stone bg-white p-5 shadow-sm">
      <div className="text-sm text-forne-slate">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-forne-forest">{value}</div>
    </div>
  );
}
