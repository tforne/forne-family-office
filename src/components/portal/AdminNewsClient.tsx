"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { NewsItem } from "@/lib/content/news";

function createEmptyNewsItem(): NewsItem {
  return {
    id: crypto.randomUUID(),
    category: "Aviso general",
    categoryColor: "#A36A00",
    categoryBackground: "#FBF2DF",
    date: "",
    title: "",
    description: "",
    link: ""
  };
}

export default function AdminNewsClient({ initialItems }: { initialItems: NewsItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateItem = (id: string, patch: Partial<NewsItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setItems((current) => [...current, createEmptyNewsItem()]);
  };

  const saveItems = async () => {
    setPending(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "No se pudieron guardar las noticias.");
      }

      setItems(Array.isArray(payload.items) ? payload.items : items);
      setMessage("Noticias guardadas correctamente.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar las noticias.");
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
            <h2 className="text-xl font-semibold text-forne-ink">Noticias y avisos</h2>
            <p className="mt-1 text-sm text-forne-muted">
              Edita el contenido que aparece en la home pública.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={addItem}
              className="rounded-xl border border-forne-line px-4 py-2.5 text-sm font-semibold text-forne-ink transition hover:bg-forne-cloud"
            >
              Añadir noticia
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
              <h3 className="text-base font-semibold text-forne-ink">Listado de noticias</h3>
              <p className="text-sm text-forne-muted">
                Vista rápida sin descripción para localizar antes cada aviso.
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
                    Noticia {index + 1}
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-forne-ink">
                    {item.title || "Sin titular"}
                  </div>
                  <div className="mt-1 text-xs text-forne-muted">
                    {item.category || "Sin categoría"} · {item.date || "Sin fecha"}
                  </div>
                  <div className="mt-1 text-xs text-forne-muted">
                    {item.link ? "Con enlace" : "Sin enlace"}
                  </div>
                </div>

                <a
                  href={`#news-item-${item.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-forne-line px-4 py-2 text-sm font-semibold text-forne-ink transition hover:bg-forne-cloud"
                >
                  Editar noticia
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
              id={`news-item-${item.id}`}
              className="scroll-mt-24 rounded-[20px] border border-forne-line bg-forne-cloud/40 p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-forne-ink">Noticia {index + 1}</div>
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
                  <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Categoría</span>
                  <input
                    value={item.category}
                    onChange={(event) => updateItem(item.id, { category: event.target.value })}
                    className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Fecha visible</span>
                  <input
                    value={item.date}
                    onChange={(event) => updateItem(item.id, { date: event.target.value })}
                    className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Color texto badge</span>
                  <input
                    value={item.categoryColor}
                    onChange={(event) => updateItem(item.id, { categoryColor: event.target.value })}
                    className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Color fondo badge</span>
                  <input
                    value={item.categoryBackground}
                    onChange={(event) => updateItem(item.id, { categoryBackground: event.target.value })}
                    className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Titular</span>
                <input
                  value={item.title}
                  onChange={(event) => updateItem(item.id, { title: event.target.value })}
                  className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Descripción</span>
                <textarea
                  value={item.description}
                  onChange={(event) => updateItem(item.id, { description: event.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-forne-ink"
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Link noticia</span>
                <input
                  value={item.link}
                  onChange={(event) => updateItem(item.id, { link: event.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-forne-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forne-ink"
                />
              </label>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
