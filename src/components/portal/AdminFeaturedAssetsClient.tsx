"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FeaturedAsset } from "@/lib/content/featured-assets";

function createEmptyFeaturedAsset(): FeaturedAsset {
  return {
    id: crypto.randomUUID(),
    badge: "Activo destacado",
    title: "",
    location: "",
    price: "",
    note: ""
  };
}

export default function AdminFeaturedAssetsClient({ initialItems }: { initialItems: FeaturedAsset[] }) {
  const router = useRouter();
  const [items, setItems] = useState<FeaturedAsset[]>(initialItems);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateItem = (id: string, patch: Partial<FeaturedAsset>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setItems((current) => [...current, createEmptyFeaturedAsset()]);
  };

  const saveItems = async () => {
    setPending(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/featured-assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "No se pudieron guardar los activos destacados."
        );
      }

      setItems(Array.isArray(payload.items) ? payload.items : items);
      setMessage("Activos destacados guardados correctamente.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los activos destacados.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {(message || error) ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || message}
        </div>
      ) : null}

      <section className="rounded-[24px] border border-forne-line bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-forne-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-forne-ink">Activos destacados</h2>
            <p className="mt-1 text-sm text-forne-muted">
              Edita los anuncios que se muestran en la home pública dentro de oportunidades.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={addItem}
              className="rounded-xl border border-forne-line px-4 py-2.5 text-sm font-semibold text-forne-ink transition hover:bg-forne-cloud"
            >
              Añadir activo
            </button>
            <button
              type="button"
              onClick={saveItems}
              disabled={pending}
              className="rounded-xl bg-forne-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:opacity-60"
            >
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[20px] border border-forne-line bg-forne-cloud/20 p-4">
          <div className="flex flex-col gap-1 border-b border-forne-line pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-forne-ink">Vista rápida</h3>
              <p className="text-sm text-forne-muted">
                Resumen de los anuncios que aparecen en la franja comercial.
              </p>
            </div>
            <span className="text-sm text-forne-muted">{items.length} elementos</span>
          </div>

          <div className="mt-4 space-y-3">
            {items.map((item, index) => (
              <div
                key={`summary-${item.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-forne-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-forne-muted">
                    Activo {index + 1}
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-forne-ink">
                    {item.title || "Sin título"}
                  </div>
                  <div className="mt-1 text-xs text-forne-muted">
                    {item.location || "Sin ubicación"} · {item.price || "Sin precio"}
                  </div>
                </div>

                <a
                  href={`#featured-asset-${item.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-forne-line px-4 py-2 text-sm font-semibold text-forne-ink transition hover:bg-forne-cloud"
                >
                  Editar activo
                  <span aria-hidden="true">›</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {items.map((item, index) => (
            <article
              key={item.id}
              id={`featured-asset-${item.id}`}
              className="scroll-mt-24 rounded-[20px] border border-forne-line bg-forne-cloud/40 p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-forne-ink">Activo {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-sm font-semibold text-rose-700 transition hover:text-rose-800"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Etiqueta</span>
                  <input
                    value={item.badge}
                    onChange={(event) => updateItem(item.id, { badge: event.target.value })}
                    className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Precio</span>
                  <input
                    value={item.price}
                    onChange={(event) => updateItem(item.id, { price: event.target.value })}
                    className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Título</span>
                <input
                  value={item.title}
                  onChange={(event) => updateItem(item.id, { title: event.target.value })}
                  className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Ubicación</span>
                <input
                  value={item.location}
                  onChange={(event) => updateItem(item.id, { location: event.target.value })}
                  className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Texto de apoyo</span>
                <textarea
                  value={item.note}
                  onChange={(event) => updateItem(item.id, { note: event.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-forne-ink"
                />
              </label>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
