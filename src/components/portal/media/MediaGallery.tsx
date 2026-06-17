"use client";

import { useEffect, useMemo, useState } from "react";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import MediaCard from "@/components/portal/media/MediaCard";
import MediaCategoryTabs from "@/components/portal/media/MediaCategoryTabs";
import MediaViewer from "@/components/portal/media/MediaViewer";
import type { PortalMediaAsset } from "@/lib/portal/media-assets.types";

export default function MediaGallery({
  items,
  loadError
}: {
  items: PortalMediaAsset[];
  loadError?: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<PortalMediaAsset | null>(null);
  const [featuredItemId, setFeaturedItemId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    }

    return [
      { id: "all", label: "Todo", count: items.length },
      ...Array.from(counts.entries())
        .sort((left, right) => left[0].localeCompare(right[0], "es"))
        .map(([label, count]) => ({
          id: label,
          label,
          count
        }))
    ];
  }, [items]);

  const visibleItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  useEffect(() => {
    if (!visibleItems.length) {
      setFeaturedItemId(null);
      return;
    }

    if (!featuredItemId || !visibleItems.some((item) => item.id === featuredItemId)) {
      setFeaturedItemId(visibleItems[0].id);
    }
  }, [featuredItemId, visibleItems]);

  const featuredItem = visibleItems.find((item) => item.id === featuredItemId) || visibleItems[0] || null;
  const secondaryItems = visibleItems.filter((item) => item.id !== featuredItem?.id);
  const thumbnailItems = featuredItem ? visibleItems : [];

  if (loadError) {
    return (
      <PortalEmptyState
        icon="clarity"
        title="La multimedia todavía no está disponible"
        description="Todavía no hay imágenes o documentos visibles para este inmueble en el portal."
      />
    );
  }

  if (items.length === 0) {
    return (
      <PortalEmptyState
        icon="clarity"
        title="No hay contenido multimedia visible"
        description="Todavía no hay imágenes o documentos visibles para este inmueble en el portal."
      />
    );
  }

  return (
    <div className="space-y-5">
      <MediaCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {visibleItems.length === 0 ? (
        <PortalEmptyState
          icon="clarity"
          title="No hay archivos en esta categoría"
          description="Prueba otra categoría o vuelve a revisar cuando haya más contenido publicado."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-[22px] border border-forne-line/80 bg-forne-cloud/55 px-4 py-3 text-sm text-forne-muted">
            <span>Selecciona una miniatura para cambiar la imagen principal.</span>
            <span className="hidden font-medium sm:inline">Pulsa cualquier tarjeta para ampliar.</span>
          </div>

          {featuredItem ? (
            <div className="space-y-4">
              <MediaCard item={featuredItem} onOpen={setSelectedItem} featured />

              {secondaryItems.length > 0 ? (
                <div className="-mx-1 overflow-x-auto pb-2">
                  <div className="flex gap-3 px-1">
                    {thumbnailItems.map((item) => {
                      const active = item.id === featuredItem.id;
                      const previewSrc = item.viewerType === "image" ? `/api/portal/media/${encodeURIComponent(item.id)}` : "";
                      const fileLabel = item.viewerType === "pdf" ? "PDF" : "Archivo";

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFeaturedItemId(item.id)}
                          className={`group relative shrink-0 overflow-hidden rounded-[22px] border transition ${
                            active
                              ? "border-[#1b6fd8] shadow-[0_18px_34px_-24px_rgba(27,111,216,0.55)]"
                              : "border-forne-line bg-white hover:border-[#9fbfe4]"
                          }`}
                        >
                          <div className="relative h-24 w-24 overflow-hidden sm:h-28 sm:w-32">
                            {item.viewerType === "image" ? (
                              <>
                                <img
                                  src={previewSrc}
                                  alt={item.title}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,19,34,0.04)_0%,rgba(7,19,34,0.08)_45%,rgba(7,19,34,0.58)_100%)]" />
                              </>
                            ) : (
                              <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%),linear-gradient(135deg,#123861_0%,#1b6fd8_100%)] p-3">
                                <div className="rounded-full border border-white/16 bg-white/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/84">
                                  {fileLabel}
                                </div>
                              </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 p-2 text-left">
                              <div className="line-clamp-2 text-xs font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                                {item.title}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {secondaryItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {secondaryItems.map((item) => (
                <MediaCard key={item.id} item={item} onOpen={setSelectedItem} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <MediaViewer
        item={selectedItem}
        items={visibleItems}
        onClose={() => setSelectedItem(null)}
        onSelect={setSelectedItem}
      />
    </div>
  );
}
