import { getMe } from "@/lib/portal/me.service";
import { env } from "@/lib/config/env";

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-forne-line bg-white p-5 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <div className="mt-3 break-words text-sm font-medium leading-6 text-forne-ink">{value || "-"}</div>
    </div>
  );
}

function InlineDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <div className="mt-1 break-words text-sm font-medium leading-6 text-forne-ink">{value || "-"}</div>
    </div>
  );
}

export default async function Page() {
  const data = await getMe();
  const paymentMethods = data.paymentMethods.length > 0 ? data.paymentMethods.join(" · ") : "-";

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Portal privado</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">Perfil</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-forne-muted">
          Información asociada a tu acceso al portal.
        </p>
      </div>

      <section className="rounded-[28px] border border-forne-line bg-white p-7 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forne-ink text-lg font-semibold text-white shadow-[0_18px_36px_-24px_rgba(7,11,26,0.8)]">
              {(data.customerName || data.email || "C").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-forne-ink">{data.customerName || "Cliente"}</div>
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

        <div className="mt-6 grid gap-5 border-t border-forne-line pt-5 md:grid-cols-3">
          <InlineDetail label="Nº cliente" value={data.customerNo} />
          <InlineDetail label="Nombre cliente" value={data.customerName} />
          <InlineDetail label="Formas de pago" value={paymentMethods} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DetailCard label="Nº cliente" value={data.customerNo} />
        <DetailCard label="Nombre cliente" value={data.customerName} />
        <DetailCard label="Formas de pago" value={paymentMethods} />
        <DetailCard label="Correo electrónico" value={data.email} />
        <DetailCard label="Identificador usuario" value={data.userId} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-forne-ink">Conexión Business Central</h2>
          <p className="mt-1 text-sm leading-6 text-forne-muted">
            Empresa y entorno donde se consultan los datos del portal.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard label="Tenant" value={env.bcTenantId} />
          <DetailCard label="Entorno" value={env.bcEnvironment} />
          <DetailCard label="Company ID" value={data.bcCompanyId} />
          <DetailCard label="Company Name" value={data.bcCompanyName} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DetailCard label="API publisher" value={env.bcApiPublisher} />
          <DetailCard label="API group" value={env.bcApiGroup} />
          <DetailCard label="API version" value={env.bcApiVersion} />
        </div>
      </section>
    </div>
  );
}
