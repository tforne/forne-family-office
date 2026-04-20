import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalTableCard from "@/components/portal/PortalTableCard";
import { getIncidents } from "@/lib/portal/incidents.service";
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
  return "bg-forne-cream text-forne-slate ring-forne-stone";
}

export default async function IncidentsPage() {
  const incidents = await getIncidents();
  const openCount = incidents.filter((incident) => statusLabel(incident) === "Abierta").length;
  const requestCount = incidents.filter((incident) => incident.caseType === "Request").length;
  const problemCount = incidents.filter((incident) => incident.caseType === "Problem").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-forne-forest">Incidencias</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-forne-slate">
          Seguimiento de solicitudes, averías y comunicaciones asociadas a tus contratos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Abiertas" value={String(openCount)} />
        <PortalStatCard title="Solicitudes" value={String(requestCount)} />
        <PortalStatCard title="Problemas" value={String(problemCount)} />
      </div>

      <PortalTableCard
        title="Listado de incidencias"
        subtitle={`${incidents.length} incidencia${incidents.length === 1 ? "" : "s"} encontradas`}
      >
        {incidents.length === 0 ? (
          <div className="px-5 py-10 text-sm text-forne-slate">
            No hay incidencias registradas para tus contratos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5 text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-forne-slate">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Incidencia</th>
                  <th className="px-5 py-3 font-semibold">Inmueble</th>
                  <th className="px-5 py-3 font-semibold">Contrato</th>
                  <th className="px-5 py-3 font-semibold">Prioridad</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {incidents.map((incident) => {
                  const status = statusLabel(incident);

                  return (
                    <tr key={incident.id} className="align-top">
                      <td className="whitespace-nowrap px-5 py-4 text-forne-slate">
                        {cleanDate(incident.incidentDate)}
                      </td>
                      <td className="min-w-72 px-5 py-4">
                        <div className="font-medium text-forne-forest">{incident.title}</div>
                        <div className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-forne-slate">
                          {incident.description || incident.incidentId}
                        </div>
                      </td>
                      <td className="min-w-52 px-5 py-4 text-forne-slate">
                        <div>{incident.refDescription || "Sin referencia"}</div>
                        {incident.fixedRealEstateNo ? (
                          <div className="mt-1 text-xs text-forne-slate/75">{incident.fixedRealEstateNo}</div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-slate">
                        {incident.contractNo || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-slate">
                        {incident.priority || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(status)}`}>
                          {status}
                        </span>
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
