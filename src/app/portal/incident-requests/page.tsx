import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalTableCard from "@/components/portal/PortalTableCard";
import { getIncidentRequests } from "@/lib/portal/incident-requests.service";
import type { IncidentRequestDto } from "@/lib/dto/incident-request.dto";

function cleanDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function caseTypeLabel(value: string | null | undefined) {
  const normalized = value?.toLowerCase() || "";
  if (normalized === "request") return "Solicitud";
  if (normalized === "problem") return "Avería";
  if (normalized === "question") return "Consulta";
  return value || "Sin tipo";
}

function requestStatusLabel(request: IncidentRequestDto) {
  const normalized = request.status?.toLowerCase() || "";

  if (normalized === "error") return "Error";
  if (["created", "new", "pending"].includes(normalized)) return "Pendiente";
  if (["active", "processing", "inprogress", "in progress"].includes(normalized)) return "En curso";
  if (["resolved", "closed", "completed"].includes(normalized)) return "Cerrada";
  if (request.createdIncidentNo) return "Tramitada";

  return request.status || "Sin estado";
}

function requestStatusClass(status: string) {
  if (status === "Pendiente") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (status === "En curso" || status === "Tramitada") return "bg-sky-50 text-sky-800 ring-sky-200";
  if (status === "Cerrada") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (status === "Error") return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-forne-cloud text-forne-muted ring-forne-line";
}

function normalizeIncidentHref(value: string) {
  return value.trim().replace(/[{}]/g, "");
}

export default async function IncidentRequestsPage() {
  const incidentRequests = await getIncidentRequests();
  const pendingCount = incidentRequests.filter((request) => requestStatusLabel(request) === "Pendiente").length;
  const inProgressCount = incidentRequests.filter((request) => requestStatusLabel(request) === "En curso").length;
  const processedCount = incidentRequests.filter((request) => request.createdIncidentNo).length;

  return (
    <div className="space-y-8">
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-6 text-white lg:p-7">
        <div className="relative z-[1] grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
              Portal privado
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.35rem]">Peticiones de incidencia</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              Consulta el estado de cada solicitud enviada desde el portal, su respuesta y la referencia creada cuando ya se ha tramitado.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
              >
                <span aria-hidden="true">‹</span>
                Volver al resumen
              </Link>
              <Link
                href="/portal/incidents"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Ver incidencias
                <BrandIcon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Pendientes</div>
              <div className="mt-2 text-3xl font-semibold text-white">{pendingCount}</div>
              <div className="mt-1 text-xs text-white/65">recibidas y por tramitar</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">En curso</div>
              <div className="mt-2 text-3xl font-semibold text-white">{inProgressCount}</div>
              <div className="mt-1 text-xs text-white/65">en seguimiento activo</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Tramitadas</div>
              <div className="mt-2 text-3xl font-semibold text-white">{processedCount}</div>
              <div className="mt-1 text-xs text-white/65">con incidencia ya creada</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard
          title="Pendientes"
          value={String(pendingCount)}
          description="Peticiones recibidas que todavía no constan como tramitadas o cerradas."
        />
        <PortalStatCard
          title="En curso"
          value={String(inProgressCount)}
          description="Solicitudes que siguen en revisión o con seguimiento activo."
        />
        <PortalStatCard
          title="Con incidencia creada"
          value={String(processedCount)}
          description="Peticiones que ya han generado una incidencia o una referencia interna."
        />
      </div>

      <PortalTableCard
        title="Listado de peticiones"
        subtitle={`${incidentRequests.length} petición${incidentRequests.length === 1 ? "" : "es"} encontrada${incidentRequests.length === 1 ? "" : "s"}`}
      >
        {incidentRequests.length === 0 ? (
          <div className="p-5">
            <PortalEmptyState
              icon="attention"
              title="No hay peticiones registradas"
              description="No hay peticiones de incidencia registradas para tus contratos en este momento."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Petición</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Inmueble</th>
                  <th className="px-5 py-3 font-semibold">Contrato</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Respuesta</th>
                  <th className="px-5 py-3 font-semibold">Referencia creada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {incidentRequests.map((request) => {
                  const status = requestStatusLabel(request);

                  return (
                    <tr
                      key={request.id || request.requestId || String(request.entryNo)}
                      className="align-top transition hover:bg-[#f8fbff]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {cleanDate(request.createdAt || request.incidentDate)}
                      </td>
                      <td className="min-w-72 px-5 py-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
                            <BrandIcon name="guide" className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-medium text-forne-ink">
                              {request.title || request.requestId || "Petición de incidencia"}
                            </div>
                            <div className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-forne-muted">
                              {request.description || "Sin descripción adicional."}
                            </div>
                            {request.requestId ? (
                              <div className="mt-2 text-xs text-forne-muted/80">
                                Id petición: {request.requestId}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        <span className="inline-flex rounded-full border border-forne-line bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-forne-ink">
                          {caseTypeLabel(request.caseType)}
                        </span>
                      </td>
                      <td className="min-w-52 px-5 py-4 text-forne-muted">
                        <div>{request.refDescription || "Sin referencia"}</div>
                        {request.fixedRealEstateNo ? (
                          <div className="mt-1 text-xs text-forne-muted/75">{request.fixedRealEstateNo}</div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {request.contractNo || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${requestStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="min-w-64 px-5 py-4 text-forne-muted">
                        {request.portalDecisionMessage ? (
                          <div className="max-w-md">
                            <div className="line-clamp-3 leading-6 text-forne-muted">
                              {request.portalDecisionMessage}
                            </div>
                            <details className="mt-2">
                              <summary className="cursor-pointer list-none font-medium text-[#0078D4] transition hover:text-[#005A9E] hover:underline">
                                Ver texto completo
                              </summary>
                              <div className="mt-3 rounded-2xl bg-forne-cloud/70 px-3 py-3 text-sm leading-6 text-forne-ink">
                                {request.portalDecisionMessage}
                              </div>
                            </details>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {request.createdIncidentNo ? (
                          <Link
                            href={`/portal/incidents/${encodeURIComponent(normalizeIncidentHref(request.createdIncidentNo))}`}
                            className="font-medium text-[#0078D4] transition hover:text-[#005A9E] hover:underline"
                          >
                            {request.createdIncidentNo}
                          </Link>
                        ) : (
                          request.errorMessage || "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PortalTableCard>
    </div>
  );
}
