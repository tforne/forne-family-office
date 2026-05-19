import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalTableCard from "@/components/portal/PortalTableCard";
import NoticeReadButton from "@/components/portal/NoticeReadButton";
import { getTenantMyNotices } from "@/lib/portal/tenant-my-notices.service";
import type { TenantMyNoticeDto } from "@/lib/dto/tenant-my-notice.dto";

function formatDateTime(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function priorityClass(priority: string | null | undefined) {
  const normalized = priority?.toLowerCase() || "";
  if (["high", "alta", "urgent", "urgente"].includes(normalized)) {
    return "bg-red-50 text-red-700 ring-red-200";
  }
  if (["normal", "medium", "media"].includes(normalized)) {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function statusClass(notice: TenantMyNoticeDto) {
  if (notice.requiresReadConfirmation) return "bg-amber-50 text-amber-800 ring-amber-200";
  if (notice.isUnread) return "bg-forne-cloud text-forne-ink ring-forne-line";
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
}

function statusLabel(notice: TenantMyNoticeDto) {
  if (notice.requiresReadConfirmation) return "Confirmación requerida";
  if (notice.isUnread) return "No leído";
  return "Leído";
}

export default async function NoticesPage() {
  const notices = await getTenantMyNotices();
  const unreadCount = notices.filter((notice) => notice.isUnread).length;
  const confirmationCount = notices.filter((notice) => notice.requiresReadConfirmation).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="relative z-[1] grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
              Portal privado
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.35rem]">Avisos</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              Avisos y comunicaciones visibles en el portal para tus contratos, activos e incidencias.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Avisos</div>
              <div className="mt-2 text-3xl font-semibold text-white">{notices.length}</div>
              <div className="mt-1 text-xs text-white/65">comunicaciones activas</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">No leídos</div>
              <div className="mt-2 text-3xl font-semibold text-white">{unreadCount}</div>
              <div className="mt-1 text-xs text-white/65">pendientes de revisar</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Confirmación</div>
              <div className="mt-2 text-3xl font-semibold text-white">{confirmationCount}</div>
              <div className="mt-1 text-xs text-white/65">requieren lectura confirmada</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Avisos activos" value={String(notices.length)} />
        <PortalStatCard title="No leídos" value={String(unreadCount)} />
        <PortalStatCard title="Confirmación requerida" value={String(confirmationCount)} />
      </div>

      <PortalTableCard
        title="Listado de avisos"
        subtitle={`${notices.length} aviso${notices.length === 1 ? "" : "s"} encontrado${notices.length === 1 ? "" : "s"}`}
      >
        {notices.length === 0 ? (
          <div className="p-5">
            <PortalEmptyState
              icon="attention"
              title="No hay avisos visibles"
              description="No hay avisos visibles en este momento."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Aviso</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Publicado</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Tipo</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Prioridad</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Contrato / activo</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Estado</th>
                  <th className="px-4 py-3 font-semibold sm:px-5 sm:py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {notices.map((notice) => (
                  <tr key={`${notice.noticeId}-${notice.lineNo ?? 0}`} className="align-top transition hover:bg-[#f8fbff]">
                    <td className="min-w-[18rem] px-4 py-3 sm:px-5 sm:py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-forne-ink">{notice.title || notice.noticeNo || "Aviso"}</div>
                        {notice.requiresReadConfirmation ? (
                          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800 ring-1 ring-amber-200">
                            Confirmación requerida
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 max-w-xl text-sm leading-6 text-forne-muted">
                        {notice.description || "Sin descripción adicional."}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                      {formatDateTime(notice.publishFrom)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                      {notice.noticeType || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                      {notice.priority ? (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityClass(notice.priority)}`}>
                          {notice.priority}
                        </span>
                      ) : (
                        <span className="text-forne-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                      <div>{notice.headerContractNo || notice.contractNo || "-"}</div>
                      <div className="mt-1 text-xs text-forne-muted/75">{notice.headerAssetNo || notice.assetNo || "-"}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(notice)}`}>
                        {statusLabel(notice)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                      {notice.isUnread || notice.requiresReadConfirmation ? (
                        <NoticeReadButton
                          compact
                          noticeId={notice.noticeId}
                          lineNo={notice.lineNo}
                          requiresReadConfirmation={notice.requiresReadConfirmation}
                        />
                      ) : (
                        <span className="text-forne-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalTableCard>
    </div>
  );
}
