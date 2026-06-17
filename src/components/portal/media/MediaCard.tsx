"use client";

import type { PortalMediaAsset } from "@/lib/portal/media-assets.types";

function formatDateTime(value: string | undefined) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function normalizeText(value: string | undefined) {
  return (value || "").trim().toLowerCase();
}

export default function MediaCard({
  item,
  onOpen,
  featured = false
}: {
  item: PortalMediaAsset;
  onOpen: (item: PortalMediaAsset) => void;
  featured?: boolean;
}) {
  const previewSrc = item.viewerType === "image" ? `/api/portal/media/${encodeURIComponent(item.id)}` : "";
  const normalizedTitle = normalizeText(item.title);
  const normalizedFilename = normalizeText(item.filename);
  const normalizedDescription = normalizeText(item.description);
  const showFilename = normalizedFilename !== normalizedTitle;
  const showDescription =
    Boolean(item.description) && normalizedDescription !== normalizedTitle && normalizedDescription !== normalizedFilename;
  const propertyText = item.propertyLabel || item.propertyNo;
  const visibleDate = formatDateTime(item.updatedAt || item.createdAt);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`group overflow-hidden rounded-[28px] border border-forne-line bg-white text-left shadow-[0_22px_48px_-38px_rgba(15,47,87,0.24)] transition hover:-translate-y-1 hover:border-[#9fbfe4] ${
        featured ? "lg:h-full" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-[linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] ${
          featured ? "aspect-[16/11] min-h-[16rem] sm:min-h-[21rem] lg:min-h-[27rem]" : "aspect-[4/3] sm:aspect-[5/4]"
        }`}
      >
        {item.viewerType === "image" ? (
          <>
            <img
              src={previewSrc}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            <div
              className={`absolute inset-0 ${
                featured
                  ? "bg-[linear-gradient(180deg,rgba(7,19,34,0.04)_0%,rgba(7,19,34,0.08)_40%,rgba(7,19,34,0.72)_100%)]"
                  : "bg-[linear-gradient(180deg,rgba(7,19,34,0.06)_0%,rgba(7,19,34,0.12)_52%,rgba(7,19,34,0.6)_100%)]"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%),linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] p-5">
            <div className="rounded-2xl border border-white/14 bg-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/82">
              {item.viewerType === "pdf" ? "PDF" : "Archivo"}
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/24 bg-[rgba(7,19,34,0.42)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
            {item.viewerType === "image" ? "Imagen" : item.viewerType === "pdf" ? "PDF" : "Archivo"}
          </span>
          <span className="rounded-full border border-white/18 bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/88 backdrop-blur">
            {item.category}
          </span>
        </div>

        {featured ? (
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
            <div className="max-w-xl">
              <div className="text-xl font-semibold tracking-[-0.03em] sm:text-3xl">{item.title}</div>
              {showDescription ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/82">{item.description}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:gap-3 sm:text-xs">
                <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1">{propertyText}</span>
                <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1">{visibleDate}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`p-4 sm:p-5 ${featured ? "border-t border-forne-line/70 bg-white/96" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          {item.byteSizeLabel ? (
            <span className="rounded-full border border-forne-line px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-forne-muted">
              {item.byteSizeLabel}
            </span>
          ) : null}
          {item.mediaType ? (
            <span className="rounded-full bg-forne-cloud px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-forne-muted">
              {item.mediaType}
            </span>
          ) : null}
        </div>

        {!featured ? <div className="mt-4 text-lg font-semibold tracking-tight text-forne-ink sm:text-xl">{item.title}</div> : null}
        {!featured && showFilename ? <div className="mt-1 text-sm font-medium text-forne-muted">{item.filename}</div> : null}

        {!featured && showDescription ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-forne-muted">{item.description}</p>
        ) : null}

        {!featured ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-forne-muted">
            <span className="rounded-full bg-forne-cloud px-3 py-1">{propertyText}</span>
            <span className="rounded-full bg-forne-cloud px-3 py-1">{visibleDate}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}
