import Link from "next/link";
import BrandIcon from "@/components/brand/BrandIcon";
import NewIncidentForm from "@/components/portal/NewIncidentForm";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalTableCard from "@/components/portal/PortalTableCard";
import { getContracts } from "@/lib/portal/contracts.service";
import { getIncidents } from "@/lib/portal/incidents.service";
import { isCurrentPortalAdmin } from "@/lib/portal/admin-auth";
import type { IncidentDto } from "@/lib/dto/incident.dto";

function cleanDate(value: string | null) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function statusLabel(incident: IncidentDto) {
  if (incident.resolutionDate && !incident.resolutionDate.startsWith("0001-01-01")) {
    return "Resuelta";
  }

  if (incident.stateCode === "Active") return "Abierta";
  return incident.stateCode || "Sin estado";
}

function statusClass(status: string) {
  if (status === "Abierta") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (status === "Resuelta") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  return "bg-forne-cloud text-forne-muted ring-forne-line";
}

export default async function IncidentsPage() {
  const isAdmin = await isCurrentPortalAdmin();
  const [incidents, contracts] = await Promise.all([
    getIncidents(),
    isAdmin ? Promise.resolve([]) : getContracts()
  ]);
  const openCount = incidents.filter((incident) => statusLabel(incident) === "Abierta").length;
  const requestCount = incidents.filter((incident) => incident.caseType === "Request").length;
  const problemCount = incidents.filter((incident) => incident.caseType === "Problem").length;
  const contractOptions = contracts.map((contract) => ({
    contractNo: contract.contractNo,
    description: contract.description,
    property: contract.fixedRealEstateDescription || contract.fixedRealEstateNo || contract.description,
    propertyNo: contract.fixedRealEstateNo || ""
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="relative z-[1] grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
              {isAdmin ? "Administración" : "Portal privado"}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.35rem]">
              {isAdmin ? "Incidencias abiertas" : "Incidencias"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              {isAdmin
                ? "Supervisa solicitudes, averías y comunicaciones en curso con una visión operativa más clara."
                : "Haz seguimiento de averías, peticiones y comunicaciones ligadas a tus contratos desde un único panel."}
            </p>
            {!isAdmin ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white">
                <BrandIcon name="incident" className="h-4 w-4" />
                Nuevo parte disponible desde esta misma página
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Abiertas</div>
              <div className="mt-2 text-3xl font-semibold text-white">{openCount}</div>
              <div className="mt-1 text-xs text-white/65">casos activos con seguimiento</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Solicitudes</div>
              <div className="mt-2 text-3xl font-semibold text-white">{requestCount}</div>
              <div className="mt-1 text-xs text-white/65">gestiones no técnicas</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Problemas</div>
              <div className="mt-2 text-3xl font-semibold text-white">{problemCount}</div>
              <div className="mt-1 text-xs text-white/65">averías o incidencias técnicas</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard
          title="Abiertas"
          value={String(openCount)}
          description="Total de incidencias que siguen en curso y todavia requieren seguimiento."
        />
        <PortalStatCard
          title="Solicitudes"
          value={String(requestCount)}
          description="Consultas o peticiones de gestion que no siempre implican una averia tecnica."
        />
        <PortalStatCard
          title="Problemas"
          value={String(problemCount)}
          description="Casos asociados a averias, incidencias tecnicas o situaciones que necesitan resolucion."
        />
      </div>

      {isAdmin ? null : <NewIncidentForm contracts={contractOptions} />}

      <PortalTableCard
        title={isAdmin ? "Listado de incidencias abiertas" : "Listado de incidencias"}
        subtitle={`${incidents.length} incidencia${incidents.length === 1 ? "" : "s"} encontradas`}
      >
        {incidents.length === 0 ? (
          <div className="p-5">
            <PortalEmptyState
              icon="incident"
              title="No hay incidencias registradas"
              description="No hay incidencias registradas para tus contratos en este momento."
            />
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-3 sm:p-4 md:hidden">
              {incidents.map((incident) => {
                const status = statusLabel(incident);

                return (
                  <article
                    key={incident.id}
                    className="rounded-[24px] border border-forne-line bg-white p-4 shadow-[0_18px_36px_-32px_rgba(15,47,87,0.24)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-forne-ink">{incident.title}</div>
                        <div className="mt-1 line-clamp-2 text-xs leading-5 text-forne-muted">
                          {incident.description || incident.incidentId}
                        </div>
                      </div>
                      <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}>
                        {status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#f8fbff] px-3 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forne-muted">Fecha</div>
                        <div className="mt-1 text-sm font-medium text-forne-ink">{cleanDate(incident.incidentDate)}</div>
                      </div>
                      <div className="rounded-2xl bg-[#f8fbff] px-3 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forne-muted">Prioridad</div>
                        <div className="mt-1 text-sm font-medium text-forne-ink">{incident.priority || "-"}</div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#f8fbff] px-3 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-forne-muted">Inmueble</div>
                      <div className="mt-1 text-sm font-medium text-forne-ink">{incident.refDescription || "Sin referencia"}</div>
                      {incident.fixedRealEstateNo ? (
                        <div className="mt-1 text-xs text-forne-muted">{incident.fixedRealEstateNo}</div>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-xs text-forne-muted">
                        {incident.contractNo ? `Contrato ${incident.contractNo}` : "Sin contrato asociado"}
                      </div>
                      <Link
                        href={`/portal/incidents/${encodeURIComponent(incident.id || incident.incidentId)}`}
                        className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-forne-cloud"
                      >
                        + información
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">Fecha</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Incidencia</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Inmueble</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Contrato</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Prioridad</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Estado</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {incidents.map((incident) => {
                  const status = statusLabel(incident);

                  return (
                    <tr key={incident.id} className="align-top transition hover:bg-[#f8fbff]">
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {cleanDate(incident.incidentDate)}
                      </td>
                      <td className="min-w-[16rem] px-4 py-3 sm:px-5 sm:py-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
                            <BrandIcon name="incident" className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-medium text-forne-ink">{incident.title}</div>
                            <div className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-forne-muted">
                              {incident.description || incident.incidentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="min-w-[13rem] px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        <div>{incident.refDescription || "Sin referencia"}</div>
                        {incident.fixedRealEstateNo ? (
                          <div className="mt-1 text-xs text-forne-muted/75">{incident.fixedRealEstateNo}</div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {incident.contractNo || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        <span className="inline-flex rounded-full border border-forne-line bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-forne-ink">
                          {incident.priority || "-"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <Link
                          href={`/portal/incidents/${encodeURIComponent(incident.id || incident.incidentId)}`}
                          className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-forne-cloud"
                        >
                          + información
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </PortalTableCard>
    </div>
  );
}
