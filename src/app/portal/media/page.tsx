import PortalPageContext from "@/components/portal/PortalPageContext";
import MediaGallery from "@/components/portal/media/MediaGallery";
import { getPortalMediaCatalog } from "@/lib/portal/media-assets.service";
import type { PortalMediaAsset } from "@/lib/portal/media-assets.types";

function isRecoverableMediaPageError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("AADSTS7000215") ||
    message.includes("invalid_client") ||
    message.includes("Unauthorized") ||
    message.includes("The credentials provided are incorrect") ||
    message.includes("Falta configuración de Business Central") ||
    message.includes("PORTAL_USER_NOT_FOUND") ||
    message.includes("PORTAL_USER_MISSING_CUSTOMER") ||
    message.includes("Could not find a property named") ||
    message.includes("BadRequest") ||
    message.includes("404") ||
    message.includes("NotFound")
  );
}

function formatDate(value: string | undefined) {
  if (!value) return "Sin fecha visible";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export default async function PortalMediaPage() {
  let items: PortalMediaAsset[] = [];
  let loadError: string | null = null;

  try {
    items = await getPortalMediaCatalog();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown portal media error";
    if (isRecoverableMediaPageError(error)) {
      console.warn("[portal/media] Recoverable media loading issue. Rendering empty state.", message);
      items = [];
    } else {
      loadError = message;
      console.error("[portal/media]", loadError, error);
    }
  }

  const categories = Array.from(new Set(items.map((item) => item.category))).sort((left, right) =>
    left.localeCompare(right, "es")
  );
  const latestItem = items[0];

  const pageContext = {
    pageTitle: "Multimedia",
    pageSummary: "Galería privada de imágenes y documentos del inmueble vinculada al inquilino autenticado.",
    visibleFacts: [
      { label: "Archivos", value: String(items.length), helper: "Piezas multimedia visibles en el portal." },
      { label: "Categorías", value: String(categories.length), helper: "Agrupaciones detectadas desde el catálogo multimedia." },
      { label: "Última actualización", value: formatDate(latestItem?.updatedAt || latestItem?.createdAt), helper: "Referencia temporal más reciente disponible." }
    ],
    visibleSections: [
      {
        title: "Galería multimedia",
        summary: "Imágenes y documentos cargados bajo demanda para este inmueble, sin exponer rutas externas."
      }
    ]
  };

  return (
    <div className="space-y-6">
      <PortalPageContext payload={pageContext} />

      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/52">Portal multimedia</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.4rem]">
              Imágenes y documentos del inmueble
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
              Consulta la galería privada del portal con carga segura desde Business Central, categorías visibles y vista ampliada cuando el formato lo permite.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Archivos visibles</div>
              <div className="mt-2 text-3xl font-semibold text-white">{items.length}</div>
              <div className="mt-1 text-xs text-white/64">Multimedia publicada para este inmueble.</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Categorías</div>
              <div className="mt-2 text-3xl font-semibold text-white">{categories.length}</div>
              <div className="mt-1 text-xs text-white/64">Agrupaciones disponibles en la galería.</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Última actualización</div>
              <div className="mt-2 text-lg font-semibold text-white">{formatDate(latestItem?.updatedAt || latestItem?.createdAt)}</div>
              <div className="mt-1 text-xs text-white/64">Fecha más reciente expuesta por el catálogo.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="ffo-portal-card rounded-[32px] p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Galería</div>
            <div className="mt-2 text-base font-semibold text-forne-ink">Contenido multimedia privado</div>
            <div className="mt-2 text-sm leading-6 text-forne-muted">
              Las imágenes se cargan bajo demanda y los documentos se abren dentro del portal cuando el formato lo permite.
            </div>
          </div>
        </div>

        <div className="mt-5">
          <MediaGallery items={items} loadError={loadError} />
        </div>
      </section>
    </div>
  );
}
