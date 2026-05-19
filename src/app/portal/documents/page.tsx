import BrandIcon from "@/components/brand/BrandIcon";
import PortalStatCard from "@/components/portal/PortalStatCard";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalTableCard from "@/components/portal/PortalTableCard";
import DocumentCopyRequestButton from "@/components/portal/DocumentCopyRequestButton";
import { getDocuments } from "@/lib/portal/documents.service";
import type { DocumentDto } from "@/lib/dto/document.dto";

function formatDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function hasDirectAccess(document: DocumentDto) {
  return Boolean(document.fileUrl?.trim());
}

function canDownload(document: DocumentDto) {
  return document.hasAttachment && document.downloadAllowed !== false;
}

function isExpired(document: DocumentDto) {
  if (!document.expirationDate || document.expirationDate.startsWith("0001-01-01")) return false;

  const expiration = Date.parse(document.expirationDate);
  if (Number.isNaN(expiration)) return false;

  return expiration < Date.now();
}

function publicationLabel(document: DocumentDto) {
  if (canDownload(document)) return "Disponible";
  if (hasDirectAccess(document)) return "Enlace externo";
  if (document.hasAttachment || document.hasLinks) return "Registrado";
  return "Sin acceso directo";
}

function publicationClass(label: string) {
  if (label === "Disponible") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (label === "Registrado") return "bg-sky-50 text-sky-800 ring-sky-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function reviewLabel(document: DocumentDto) {
  if (document.missingMandatoryData) return "Incompleto";

  const normalized = document.reviewStatus?.trim().toLowerCase() || "";
  if (normalized === "reviewed") return "Revisado";
  if (normalized === "pending") return "Pendiente";

  return document.reviewStatus || "Sin revisión";
}

function reviewClass(label: string) {
  if (label === "Revisado") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (label === "Pendiente" || label === "Incompleto") return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function documentTitle(document: DocumentDto) {
  return document.description?.trim() || document.attachmentFileName?.trim() || document.no || "Documento";
}

export default async function DocumentsPage() {
  const documents = await getDocuments();
  const withDownload = documents.filter(canDownload).length;
  const pendingReview = documents.filter((document) => reviewLabel(document) !== "Revisado").length;
  const expiredDocuments = documents.filter(isExpired).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="relative z-[1] grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
              Portal privado
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.35rem]">Documentos</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              Revisa la documentación asociada a tu perfil, detecta vigencias y accede a descargas o solicitudes de copia desde un entorno más claro.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white">
              <BrandIcon name="guide" className="h-4 w-4" />
              Historial documental y acciones centralizadas
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Documentos</div>
              <div className="mt-2 text-3xl font-semibold text-white">{documents.length}</div>
              <div className="mt-1 text-xs text-white/65">elementos vinculados al perfil</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Descargables</div>
              <div className="mt-2 text-3xl font-semibold text-white">{withDownload}</div>
              <div className="mt-1 text-xs text-white/65">con acceso inmediato</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Pendientes</div>
              <div className="mt-2 text-3xl font-semibold text-white">{pendingReview}</div>
              <div className="mt-1 text-xs text-white/65">
                {expiredDocuments > 0 ? `${expiredDocuments} con vigencia vencida` : "sin revisión completada"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Documentos" value={String(documents.length)} />
        <PortalStatCard title="Con descarga disponible" value={String(withDownload)} />
        <PortalStatCard title="Pendientes o sin revisar" value={String(pendingReview)} description={expiredDocuments > 0 ? `${expiredDocuments} documento(s) con vigencia vencida.` : undefined} />
      </div>

      <PortalTableCard
        title="Listado de documentos"
        subtitle={`${documents.length} documento${documents.length === 1 ? "" : "s"} vinculado${documents.length === 1 ? "" : "s"} a este perfil`}
      >
        {documents.length === 0 ? (
          <div className="p-5">
            <PortalEmptyState
              icon="guide"
              title="No hay documentos vinculados"
              description="No hay documentos vinculados a tu perfil en este momento."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-[linear-gradient(180deg,#fbfcff_0%,#f5f9fe_100%)] text-xs uppercase tracking-[0.16em] text-forne-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">Documento</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Categoría</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Emisión</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Vigencia</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Publicación</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Revisión</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {documents.map((document) => {
                  const publication = publicationLabel(document);
                  const review = reviewLabel(document);

                  return (
                    <tr key={document.id || document.no} className="align-top transition hover:bg-[#f8fbff]">
                      <td className="px-4 py-3 sm:px-5 sm:py-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
                            <BrandIcon name="guide" className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-medium text-forne-ink">{documentTitle(document)}</div>
                            <div className="mt-1 text-xs text-forne-muted">
                              {document.no}
                              {document.attachmentFileName ? ` · ${document.attachmentFileName}` : ""}
                            </div>
                            {document.notes ? (
                              <div className="mt-2 max-w-xl text-xs leading-5 text-forne-muted">
                                {document.notes}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        <div>{document.category || document.documentTypeCode || "Sin categoría"}</div>
                        <div className="mt-1 text-xs text-forne-muted/80">
                          {document.companyName || "Business Central"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {formatDate(document.issueDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-forne-muted sm:px-5 sm:py-4">
                        {document.expirationDate ? formatDate(document.expirationDate) : "Sin vencimiento"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${publicationClass(publication)}`}>
                          {publication}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${reviewClass(review)}`}>
                          {review}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5 sm:py-4">
                        <div className="flex flex-col items-start gap-2">
                          {canDownload(document) ? (
                            <a
                              href={`/api/me/documents/${encodeURIComponent(document.id)}/download?download=1`}
                              className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-forne-cloud"
                            >
                              Descargar documento
                            </a>
                          ) : document.fileUrl ? (
                            <a
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-forne-cloud"
                            >
                              Abrir enlace
                            </a>
                          ) : (
                            <span className="text-xs text-forne-muted">
                              Sin descarga directa
                            </span>
                          )}
                          <DocumentCopyRequestButton
                            documentId={document.id}
                            documentNo={document.no}
                            documentTitle={documentTitle(document)}
                            sourceNo={document.sourceNo}
                            compact
                          />
                        </div>
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
