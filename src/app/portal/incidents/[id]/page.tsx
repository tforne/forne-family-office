import Link from "next/link";
import { notFound } from "next/navigation";
import IncidentContactForm from "@/components/portal/IncidentContactForm";
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

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-b border-black/5 py-3 last:border-b-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">{label}</div>
      <div className="mt-1 text-sm leading-6 text-forne-forest">{value || "-"}</div>
    </div>
  );
}

function booleanLabel(value: boolean | null | undefined) {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return null;
}

function getTextValue(record: IncidentDto, keys: string[]) {
  const source = record as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return null;
}

function getBooleanValue(record: IncidentDto, keys: string[]) {
  const source = record as unknown as Record<string, unknown>;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "si", "sí"].includes(normalized)) return true;
      if (["false", "no"].includes(normalized)) return false;
    }
  }

  return null;
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative pl-7">
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-forne-forest shadow-sm" />
      <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">{label}</div>
      <div className="mt-1 text-sm font-medium text-forne-forest">{value}</div>
    </div>
  );
}

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const incidents = await getIncidents();
  const incidentId = decodeURIComponent(params.id);
  const incident = incidents.find((item) => item.id === incidentId || item.incidentId === incidentId);

  if (!incident) notFound();

  const status = statusLabel(incident);
  const insurance = {
    policyNo: getTextValue(incident, ["insurancePolicyNo", "insurancePolicyNumber", "policyNo", "insuranceNo", "noPolizaSeguro", "polizaSeguroNo"]),
    policyDescription: getTextValue(incident, ["insurancePolicyDescription", "policyDescription", "insuranceDescription", "descripcionPolizaSeguro", "descripcionSeguro"]),
    notifyInsurance: booleanLabel(getBooleanValue(incident, ["notifyInsurance", "insuranceNotify", "notificarSeguro"])),
    insuranceNotified: booleanLabel(getBooleanValue(incident, ["insuranceNotified", "notifiedInsurance", "seguroNotificado"])),
    notificationDate: getTextValue(incident, ["insuranceNotificationDate", "notificationInsuranceDate", "fechaNotificacionSeguro"]),
    claimNo: getTextValue(incident, ["insuranceClaimNo", "claimNo", "sinisterNo", "lossNo", "noSiniestro", "siniestroNo"]),
    status: getTextValue(incident, ["insuranceStatus", "insuranceState", "estadoSeguro"]),
    email: getTextValue(incident, ["insuranceEmail", "insuranceContactEmail", "correoElectronicoSeguro", "emailSeguro"]),
    phone: getTextValue(incident, ["insurancePhoneNo", "insurancePhone", "insuranceContactPhoneNo", "noTelefonoSiniestro", "telefonoSeguro"]),
    notes: getTextValue(incident, ["insuranceNotes", "insuranceNote", "notasSeguro"])
  };
  const hasInsurance = Object.values(insurance).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forne-stone bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/portal/incidents" className="text-sm font-semibold text-forne-forest hover:underline">
              Volver a incidencias
            </Link>
            <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-forne-slate">
              {incident.incidentId || incident.id}
            </div>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-forne-forest">{incident.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-forne-slate">
              Seguimiento detallado de la incidencia, con contexto del inmueble, contacto y fechas relevantes.
            </p>
          </div>
          <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ring-1 ${statusClass(status)}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-forne-stone bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-forest">Descripción</div>
            <div className="mt-4 rounded-2xl bg-forne-cream p-5 text-sm leading-7 text-forne-slate">
              {incident.description || "No hay descripción adicional para esta incidencia."}
            </div>
          </section>

          <section className="rounded-3xl border border-forne-stone bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-forest">Evolución</div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <TimelineItem label="Apertura" value={cleanDate(incident.incidentDate)} />
              <TimelineItem label="Seguimiento" value={cleanDate(incident.followupBy)} />
              <TimelineItem label="Resolución prevista" value={cleanDate(incident.expectedResolutionDate)} />
            </div>
          </section>

          {hasInsurance ? (
            <section className="rounded-3xl border border-forne-stone bg-white p-6 shadow-sm">
              <div className="text-base font-semibold text-forne-forest">Seguro</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-forne-cream p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">Póliza</div>
                  <div className="mt-2 text-sm font-semibold text-forne-forest">{insurance.policyNo || "-"}</div>
                  <div className="mt-1 text-sm leading-6 text-forne-slate">{insurance.policyDescription || "Sin descripción de póliza."}</div>
                </div>
                <div className="rounded-2xl bg-forne-cream p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">Siniestro</div>
                  <div className="mt-2 text-sm font-semibold text-forne-forest">{insurance.claimNo || "-"}</div>
                  <div className="mt-1 text-sm leading-6 text-forne-slate">{insurance.status || "Sin estado de seguro."}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-forne-stone bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">Notificar seguro</div>
                  <div className="mt-2 text-sm text-forne-forest">{insurance.notifyInsurance || "-"}</div>
                </div>
                <div className="rounded-2xl border border-forne-stone bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">Seguro notificado</div>
                  <div className="mt-2 text-sm text-forne-forest">{insurance.insuranceNotified || "-"}</div>
                </div>
                <div className="rounded-2xl border border-forne-stone bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-slate">Fecha notificación</div>
                  <div className="mt-2 text-sm text-forne-forest">{cleanDate(insurance.notificationDate)}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailItem label="Email seguro" value={insurance.email} />
                <DetailItem label="Teléfono seguro" value={insurance.phone} />
              </div>
              {insurance.notes ? (
                <div className="mt-4 rounded-2xl border border-forne-stone bg-white p-4 text-sm leading-7 text-forne-slate">
                  {insurance.notes}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-forne-stone bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-forest">Datos de la incidencia</div>
            <div className="mt-3">
              <DetailItem label="Prioridad" value={incident.priority} />
              <DetailItem label="Tipo" value={incident.caseType} />
              <DetailItem label="Estado interno" value={incident.statusCode || incident.stateCode} />
              <DetailItem label="Fecha resolución" value={cleanDate(incident.resolutionDate)} />
            </div>
          </section>

          <section className="rounded-3xl border border-forne-stone bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-forest">Inmueble y contrato</div>
            <div className="mt-3">
              <DetailItem label="Inmueble" value={incident.refDescription} />
              <DetailItem label="Referencia inmueble" value={incident.fixedRealEstateNo} />
              <DetailItem label="Contrato" value={incident.contractNo} />
            </div>
          </section>

          <section className="rounded-3xl border border-forne-stone bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-forne-forest">Contacto</div>
            <div className="mt-3">
              <DetailItem label="Nombre" value={incident.contactName} />
              <DetailItem label="Teléfono" value={incident.contactPhoneNo} />
              <DetailItem label="Email" value={incident.contactEmail} />
            </div>
          </section>
        </aside>
      </div>

      <IncidentContactForm
        incidentId={incident.incidentId || incident.id}
        title={incident.title}
        property={incident.refDescription}
        contractNo={incident.contractNo}
      />
    </div>
  );
}
