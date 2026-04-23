import Link from "next/link";
import NewIncidentForm from "@/components/portal/NewIncidentForm";
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
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">
          {isAdmin ? "Administración" : "Portal privado"}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">
          {isAdmin ? "Incidencias abiertas" : "Incidencias"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-forne-muted">
          {isAdmin
            ? "Seguimiento global de solicitudes, averías y comunicaciones abiertas."
            : "Seguimiento de solicitudes, averías y comunicaciones asociadas a tus contratos."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Abiertas" value={String(openCount)} />
        <PortalStatCard title="Solicitudes" value={String(requestCount)} />
        <PortalStatCard title="Problemas" value={String(problemCount)} />
      </div>

      {isAdmin ? null : <NewIncidentForm contracts={contractOptions} />}

      <PortalTableCard
        title={isAdmin ? "Listado de incidencias abiertas" : "Listado de incidencias"}
        subtitle={`${incidents.length} incidencia${incidents.length === 1 ? "" : "s"} encontradas`}
      >
        {incidents.length === 0 ? (
          <div className="px-5 py-10 text-sm text-forne-muted">
            No hay incidencias registradas para tus contratos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-forne-cloud text-xs uppercase tracking-wide text-forne-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Incidencia</th>
                  <th className="px-5 py-3 font-semibold">Inmueble</th>
                  <th className="px-5 py-3 font-semibold">Contrato</th>
                  <th className="px-5 py-3 font-semibold">Prioridad</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {incidents.map((incident) => {
                  const status = statusLabel(incident);

                  return (
                    <tr key={incident.id} className="align-top">
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {cleanDate(incident.incidentDate)}
                      </td>
                      <td className="min-w-72 px-5 py-4">
                        <div className="font-medium text-forne-ink">{incident.title}</div>
                        <div className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-forne-muted">
                          {incident.description || incident.incidentId}
                        </div>
                      </td>
                      <td className="min-w-52 px-5 py-4 text-forne-muted">
                        <div>{incident.refDescription || "Sin referencia"}</div>
                        {incident.fixedRealEstateNo ? (
                          <div className="mt-1 text-xs text-forne-muted/75">{incident.fixedRealEstateNo}</div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {incident.contractNo || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {incident.priority || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          href={`/portal/incidents/${encodeURIComponent(incident.id || incident.incidentId)}`}
                          className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:bg-forne-cloud"
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
        )}
      </PortalTableCard>
    </div>
  );
}
