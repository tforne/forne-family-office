import PortalStatCard from "@/components/portal/PortalStatCard";
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
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Portal privado</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">Documentos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-forne-muted">
          Consulta la documentación vinculada a tu perfil, revisa su vigencia y descarga los archivos publicados directamente desde el portal.
        </p>
      </div>

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
          <div className="px-5 py-10 text-sm text-forne-muted">
            No hay documentos vinculados a tu perfil en este momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-forne-cloud text-xs uppercase tracking-wide text-forne-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Documento</th>
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Emisión</th>
                  <th className="px-5 py-3 font-semibold">Vigencia</th>
                  <th className="px-5 py-3 font-semibold">Publicación</th>
                  <th className="px-5 py-3 font-semibold">Revisión</th>
                  <th className="px-5 py-3 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {documents.map((document) => {
                  const publication = publicationLabel(document);
                  const review = reviewLabel(document);

                  return (
                    <tr key={document.id || document.no} className="align-top">
                      <td className="px-5 py-4">
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
                      </td>
                      <td className="px-5 py-4 text-forne-muted">
                        <div>{document.category || document.documentTypeCode || "Sin categoría"}</div>
                        <div className="mt-1 text-xs text-forne-muted/80">
                          {document.companyName || "Business Central"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {formatDate(document.issueDate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-forne-muted">
                        {document.expirationDate ? formatDate(document.expirationDate) : "Sin vencimiento"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${publicationClass(publication)}`}>
                          {publication}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${reviewClass(review)}`}>
                          {review}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          {canDownload(document) ? (
                            <a
                              href={`/api/me/documents/${encodeURIComponent(document.id)}/download?download=1`}
                              className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:bg-forne-cloud"
                            >
                              Descargar documento
                            </a>
                          ) : document.fileUrl ? (
                            <a
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-xl border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink shadow-sm transition hover:bg-forne-cloud"
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
