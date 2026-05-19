import Link from "next/link";
import { notFound } from "next/navigation";
import BrandIcon from "@/components/brand/BrandIcon";
import IncidentContactForm from "@/components/portal/IncidentContactForm";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalPageContext from "@/components/portal/PortalPageContext";
import { getIncidentComments } from "@/lib/portal/incident-comments.service";
import { getIncidentRequests } from "@/lib/portal/incident-requests.service";
import { getIncidents } from "@/lib/portal/incidents.service";
import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { IncidentCommentDto } from "@/lib/dto/incident-comment.dto";
import type { IncidentRequestDto } from "@/lib/dto/incident-request.dto";

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

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-b border-forne-line py-3 last:border-b-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">{label}</div>
      <div className="mt-1 text-sm leading-6 text-forne-ink">{value || "-"}</div>
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

function normalizeIncidentKey(value: string | null | undefined) {
  return (value || "").trim().replace(/[{}]/g, "").toLowerCase();
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

function isImageUrl(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("data:image/") ||
    /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)(\?|#|$)/.test(normalized)
  );
}

function getImageUrls(record: IncidentDto, keys: string[]) {
  const source = record as unknown as Record<string, unknown>;
  const urls = new Set<string>();

  const addCandidate = (value: unknown) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed && isImageUrl(trimmed)) urls.add(trimmed);
      return;
    }

    if (!value || typeof value !== "object") return;

    const objectValue = value as Record<string, unknown>;
    const directUrl = [objectValue.url, objectValue.src, objectValue.fileUrl, objectValue.imageUrl].find(
      (candidate) => typeof candidate === "string" && candidate.trim()
    );
    const mimeType = [objectValue.mimeType, objectValue.contentType].find(
      (candidate) => typeof candidate === "string" && candidate.trim()
    );
    const fileName = typeof objectValue.fileName === "string" ? objectValue.fileName : null;

    if (typeof directUrl === "string") {
      if (
        isImageUrl(directUrl) ||
        (typeof mimeType === "string" && mimeType.toLowerCase().startsWith("image/")) ||
        (fileName && /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i.test(fileName))
      ) {
        urls.add(directUrl);
      }
    }
  };

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) continue;

      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed) as unknown;
          if (Array.isArray(parsed)) {
            parsed.forEach(addCandidate);
            continue;
          }
          addCandidate(parsed);
          continue;
        } catch {
          addCandidate(trimmed);
          continue;
        }
      }

      addCandidate(trimmed);
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach(addCandidate);
      continue;
    }

    addCandidate(value);
  }

  return Array.from(urls);
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative pl-7">
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-forne-ink shadow-sm" />
      <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-forne-ink">{value}</div>
    </div>
  );
}

function CommentItem({ comment }: { comment: IncidentCommentDto }) {
  return (
    <div className="border-b border-forne-line py-4 last:border-b-0">
      <div className="flex justify-end">
        <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">
          {cleanDate(comment.commentDate || comment.createdAt)}
        </div>
      </div>
      <div className="mt-2 whitespace-pre-line text-sm leading-7 text-forne-muted">
        {comment.commentText || "Comentario sin texto."}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-forne-line bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fe_100%)] p-5 shadow-[0_18px_38px_-34px_rgba(15,47,87,0.2)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-forne-ink">{value}</div>
      <div className="mt-2 text-sm leading-6 text-forne-muted">{helper}</div>
    </div>
  );
}

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const [incidents, incidentRequests] = await Promise.all([getIncidents(), getIncidentRequests()]);
  const incidentId = decodeURIComponent(params.id);
  const normalizedIncidentId = normalizeIncidentKey(incidentId);
  const incident = incidents.find(
    (item) =>
      normalizeIncidentKey(item.id) === normalizedIncidentId ||
      normalizeIncidentKey(item.incidentId) === normalizedIncidentId
  );

  if (!incident) {
    const request = incidentRequests.find(
      (item) =>
        normalizeIncidentKey(item.id) === normalizedIncidentId ||
        normalizeIncidentKey(item.requestId) === normalizedIncidentId ||
        normalizeIncidentKey(item.createdIncidentNo) === normalizedIncidentId
    );

    if (!request) notFound();

    const status = requestStatusLabel(request);

    return (
      <div className="space-y-6">
        <div className="ffo-portal-dark rounded-[34px] border border-white/8 p-6 text-white lg:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/portal/incident-requests"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
              >
                <span aria-hidden="true">‹</span>
                Volver a peticiones
              </Link>
              <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/55">
                {request.createdIncidentNo || request.requestId || request.id}
              </div>
              <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-white sm:text-[2.35rem]">
                {request.title || "Petición de incidencia"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                Esta referencia todavía no tiene una ficha de incidencia publicada en el portal. Mostramos el detalle disponible de la petición enviada.
              </p>
              <div className="mt-5 rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur xl:max-w-[40rem]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Lectura recomendada</div>
                <div className="mt-2 text-base font-semibold text-white">
                  Revisa primero el estado de la petición y la referencia creada.
                </div>
                <div className="mt-2 text-sm leading-6 text-white/64">
                  Si todavía no existe una incidencia publicada, esta ficha actúa como expediente provisional de seguimiento.
                </div>
              </div>
            </div>
            <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ring-1 ${requestStatusClass(status)}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="ffo-portal-card rounded-[30px] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Expediente</div>
              <div className="mt-2 text-base font-semibold text-forne-ink">Descripción</div>
              <div className="mt-4 rounded-2xl bg-forne-cloud p-5 text-sm leading-7 text-forne-muted">
                {request.description || "No hay descripción adicional para esta petición."}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="ffo-portal-card rounded-[30px] p-6">
              <div className="text-base font-semibold text-forne-ink">Datos de la petición</div>
              <div className="mt-3">
                <DetailItem label="Id petición" value={request.requestId || request.id} />
                <DetailItem label="Referencia creada" value={request.createdIncidentNo} />
                <DetailItem label="Fecha" value={cleanDate(request.createdAt || request.incidentDate)} />
                <DetailItem label="Tipo" value={request.caseType} />
              </div>
            </section>

            <section className="ffo-portal-card rounded-[30px] p-6">
              <div className="text-base font-semibold text-forne-ink">Inmueble y contrato</div>
              <div className="mt-3">
                <DetailItem label="Inmueble" value={request.refDescription} />
                <DetailItem label="Referencia inmueble" value={request.fixedRealEstateNo} />
                <DetailItem label="Contrato" value={request.contractNo} />
              </div>
            </section>

            <section className="ffo-portal-card rounded-[30px] p-6">
              <div className="text-base font-semibold text-forne-ink">Contacto</div>
              <div className="mt-3">
                <DetailItem label="Nombre" value={request.contactName} />
                <DetailItem label="Teléfono" value={request.contactPhoneNo} />
                <DetailItem label="Email" value={request.contactEmail} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  const comments = await getIncidentComments(incident.incidentId, incident.id);
  const status = statusLabel(incident);
  const imageUrls = getImageUrls(incident, [
    "incidentImages",
    "images",
    "imageUrls",
    "incidentImageUrls",
    "attachments",
    "incidentAttachments",
    "photos",
    "photoUrls",
    "files"
  ]);
  const insurance = {
    policyNo: getTextValue(incident, ["insurancePolicyNo", "insurancePolicyNumber", "policyNo", "insuranceNo", "noPolizaSeguro", "polizaSeguroNo"]),
    policyDescription: getTextValue(incident, ["insurancePolicyDescription", "policyDescription", "insuranceDescription", "descripcionPolizaSeguro", "descripcionSeguro"]),
    companyName: getTextValue(incident, ["insuranceCompanyName", "insuranceCompany", "insurerName", "insurer", "aseguradora", "nombreAseguradora", "nombreSeguro"]),
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
  const nextControlDate = cleanDate(incident.expectedResolutionDate || incident.followupBy || incident.resolutionDate);
  const recommendedAction =
    status === "Abierta"
      ? "Conviene revisar evolución, contacto y próxima fecha de seguimiento."
      : "La incidencia parece cerrada; usa esta ficha como expediente de referencia y trazabilidad.";
  const latestComment = comments[0];
  const chatPageContext = {
    pageTitle: incident.title,
    pageSummary: "Seguimiento detallado de la incidencia, con contexto del inmueble, contacto y fechas relevantes.",
    visibleFacts: [
      { label: "Estado", value: status, helper: "Situación principal visible en el expediente." },
      { label: "Prioridad", value: incident.priority || "-", helper: "Nivel de atención informado en la incidencia." },
      { label: "Seguimiento", value: cleanDate(incident.followupBy), helper: "Siguiente fecha interna o de control disponible." },
      { label: "Contrato", value: incident.contractNo || "-", helper: "Referencia contractual asociada a la gestión." },
      { label: "Siguiente control", value: nextControlDate, helper: "Fecha de referencia para seguimiento o cierre prevista en el expediente." }
    ],
    visibleSections: [
      {
        title: "Lectura recomendada",
        summary: `${recommendedAction} Estado actual, referencias del inmueble y comentarios forman el núcleo de seguimiento más útil.`
      },
      ...(hasInsurance
        ? [
            {
              title: "Seguro",
              summary: `Cobertura o seguro asociado${insurance.companyName ? ` con ${insurance.companyName}` : ""}${insurance.status ? ` en estado ${insurance.status}` : ""}.`
            }
          ]
        : [])
    ],
    visibleUpdates: latestComment
      ? [
          {
            date: cleanDate(latestComment.commentDate || latestComment.createdAt),
            text: latestComment.commentText || "Comentario sin texto."
          }
        ]
      : []
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PortalPageContext payload={chatPageContext} />
      <div id="incident-overview" className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/portal/incidents"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
            >
              <span aria-hidden="true">‹</span>
              Salir de la incidencia
            </Link>
            <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/55">
              {incident.incidentId || incident.id}
            </div>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-white sm:text-[2.35rem]">{incident.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
              Seguimiento detallado de la incidencia, con contexto del inmueble, contacto y fechas relevantes.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:max-w-[42rem]">
              <div className="rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Lectura recomendada</div>
                <div className="mt-2 text-base font-semibold text-white">{recommendedAction}</div>
                <div className="mt-2 text-sm leading-6 text-white/64">
                  Estado actual, referencias del inmueble y comentarios forman el núcleo de seguimiento más útil.
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Siguiente control</div>
                <div className="mt-2 text-base font-semibold text-white">{nextControlDate}</div>
                <div className="mt-2 text-sm leading-6 text-white/64">
                  Fecha de referencia para seguimiento o cierre prevista en el expediente.
                </div>
              </div>
            </div>
          </div>
          <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ring-1 ${statusClass(status)}`}>
            {status}
          </span>
        </div>
      </div>

      <section id="incident-dossier" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Estado"
          value={status}
          helper="Situación principal visible en el expediente."
        />
        <SummaryCard
          label="Prioridad"
          value={incident.priority || "-"}
          helper="Nivel de atención informado en la incidencia."
        />
        <SummaryCard
          label="Seguimiento"
          value={cleanDate(incident.followupBy)}
          helper="Siguiente fecha interna o de control disponible."
        />
        <SummaryCard
          label="Contrato"
          value={incident.contractNo || "-"}
          helper="Referencia contractual asociada a la gestión."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section id="incident-timeline" className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Expediente</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Descripción</div>
            <div className="mt-4 rounded-2xl bg-forne-cloud p-5 text-sm leading-7 text-forne-muted">
              {incident.description || "No hay descripción adicional para esta incidencia."}
            </div>
          </section>

          {imageUrls.length > 0 ? (
            <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Adjuntos</div>
                  <div className="mt-2 text-base font-semibold text-forne-ink">Imágenes adjuntas</div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">
                  {imageUrls.length} imagen{imageUrls.length === 1 ? "" : "es"}
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {imageUrls.map((imageUrl, index) => (
                  <a
                    key={`${imageUrl}-${index}`}
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl border border-forne-line bg-forne-cloud"
                  >
                    <img
                      src={imageUrl}
                      alt={`Imagen adjunta ${index + 1} de la incidencia ${incident.incidentId || incident.id}`}
                      className="aspect-[4/3] w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          <section id="incident-comments" className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Cronología</div>
              <div className="mt-2 text-base font-semibold text-forne-ink">Evolución</div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <TimelineItem label="Apertura" value={cleanDate(incident.incidentDate)} />
                <TimelineItem label="Seguimiento" value={cleanDate(incident.followupBy)} />
                <TimelineItem label="Resolución prevista" value={cleanDate(incident.expectedResolutionDate)} />
              </div>
          </section>

          <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Seguimiento narrativo</div>
                <div className="mt-2 text-base font-semibold text-forne-ink">Comentarios</div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">
                {comments.length} comentario{comments.length === 1 ? "" : "s"}
              </div>
            </div>
            {comments.length === 0 ? (
              <div className="mt-4">
                <PortalEmptyState
                  icon="attention"
                  title="No hay comentarios publicados"
                  description="Todavía no se han registrado comentarios visibles para esta incidencia."
                />
              </div>
            ) : (
              <div className="mt-2">
                {comments.map((comment) => (
                  <CommentItem key={comment.id || `${comment.incidentNo}-${comment.entryNo}`} comment={comment} />
                ))}
              </div>
            )}
          </section>

          {hasInsurance ? (
            <section id="incident-insurance" className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Cobertura</div>
              <div className="mt-2 text-base font-semibold text-forne-ink">Seguro</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-forne-cloud p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Póliza</div>
                  <div className="mt-2 text-sm font-semibold text-forne-ink">{insurance.policyNo || "-"}</div>
                  <div className="mt-1 text-sm leading-6 text-forne-muted">{insurance.policyDescription || "Sin descripción de póliza."}</div>
                </div>
                <div className="rounded-2xl bg-forne-cloud p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Siniestro</div>
                  <div className="mt-2 text-sm font-semibold text-forne-ink">{insurance.claimNo || "-"}</div>
                  <div className="mt-1 text-sm leading-6 text-forne-muted">{insurance.status || "Sin estado de seguro."}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-forne-line bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Aseguradora</div>
                  <div className="mt-2 text-sm text-forne-ink">{insurance.companyName || "-"}</div>
                </div>
                <div className="rounded-2xl border border-forne-line bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Notificar seguro</div>
                  <div className="mt-2 text-sm text-forne-ink">{insurance.notifyInsurance || "-"}</div>
                </div>
                <div className="rounded-2xl border border-forne-line bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Seguro notificado</div>
                  <div className="mt-2 text-sm text-forne-ink">{insurance.insuranceNotified || "-"}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-1">
                <div className="rounded-2xl border border-forne-line bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Fecha notificación</div>
                  <div className="mt-2 text-sm text-forne-ink">{cleanDate(insurance.notificationDate)}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <DetailItem label="Email seguro" value={insurance.email} />
                <DetailItem label="Teléfono seguro" value={insurance.phone} />
              </div>
              {insurance.notes ? (
                <div className="mt-4 rounded-2xl border border-forne-line bg-white p-4 text-sm leading-7 text-forne-muted">
                  {insurance.notes}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Ficha técnica</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Datos de la incidencia</div>
            <div className="mt-3">
              <DetailItem label="Prioridad" value={incident.priority} />
              <DetailItem label="Tipo" value={incident.caseType} />
              <DetailItem label="Estado interno" value={incident.statusCode || incident.stateCode} />
              <DetailItem label="Fecha resolución" value={cleanDate(incident.resolutionDate)} />
            </div>
          </section>

          <section className="ffo-portal-card rounded-[30px] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Contexto</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Inmueble y contrato</div>
            <div className="mt-3">
              <DetailItem label="Inmueble" value={incident.refDescription} />
              <DetailItem label="Referencia inmueble" value={incident.fixedRealEstateNo} />
              <DetailItem label="Contrato" value={incident.contractNo} />
            </div>
          </section>

          <section className="ffo-portal-card rounded-[30px] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Interlocución</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Contacto</div>
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
