import BrandIcon from "@/components/brand/BrandIcon";
import { getMe } from "@/lib/portal/me.service";
import { env } from "@/lib/config/env";

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="ffo-portal-card rounded-[28px] p-5">
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
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-6 text-white lg:p-7">
        <div className="relative z-[1] grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
              Portal privado
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.35rem]">Perfil</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              Información asociada a tu acceso, estado del portal y conexión con Business Central.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white">
              <BrandIcon name="portal" className="h-4 w-4" />
              Identidad, acceso y contexto técnico en un solo sitio
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Estado portal</div>
              <div className="mt-2 text-3xl font-semibold text-white">{data.portalEnabled ? "Activo" : "Inactivo"}</div>
              <div className="mt-1 text-xs text-white/65">situación del acceso actual</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Cliente</div>
              <div className="mt-2 text-3xl font-semibold text-white">{data.customerNo || "-"}</div>
              <div className="mt-1 text-xs text-white/65">identificador principal</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Pagos</div>
              <div className="mt-2 text-xl font-semibold text-white">{paymentMethods === "-" ? "-" : data.paymentMethods.length}</div>
              <div className="mt-1 text-xs text-white/65">método(s) registrados</div>
            </div>
          </div>
        </div>
      </section>

      <section className="ffo-portal-card rounded-[32px] p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] text-lg font-semibold text-white shadow-[0_18px_36px_-24px_rgba(15,47,87,0.62)]">
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
