import { getMe } from "@/lib/portal/me.service";

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-forne-line bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">{label}</div>
      <div className="mt-2 break-words text-sm font-medium leading-6 text-forne-ink">{value || "-"}</div>
    </div>
  );
}

export default async function Page() {
  const data = await getMe();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Portal privado</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">Perfil</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-forne-muted">
          Información asociada a tu acceso al portal.
        </p>
      </div>

      <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forne-ink text-lg font-semibold text-white">
              {(data.customerName || data.email || "C").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-semibold text-forne-ink">{data.customerName || "Cliente"}</div>
              <div className="mt-1 text-sm text-forne-muted">{data.email}</div>
            </div>
          </div>

          <div className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
            data.portalEnabled
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-amber-50 text-amber-800 ring-amber-200"
          }`}>
            {data.portalEnabled ? "Portal activo" : "Portal no activo"}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Nº cliente" value={data.customerNo} />
        <DetailCard label="Nombre cliente" value={data.customerName} />
        <DetailCard label="Correo electrónico" value={data.email} />
        <DetailCard label="Identificador usuario" value={data.userId} />
      </section>
    </div>
  );
}
