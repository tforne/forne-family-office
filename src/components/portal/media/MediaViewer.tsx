"use client";

import { useEffect, useRef, type TouchEvent } from "react";
import type { PortalMediaAsset } from "@/lib/portal/media-assets.types";

const actionButtonClassName =
  "rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-35";

const arrowButtonClassName =
  "hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-xl text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-35 sm:flex";

function HeaderActionButton({
  label,
  ariaLabel,
  onClick,
  disabled = false,
  className = ""
}: {
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${actionButtonClassName} ${className}`.trim()}
    >
      {label}
    </button>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled = false
}: {
  direction: "previous" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={arrowButtonClassName}
      aria-label={direction === "previous" ? "Anterior" : "Siguiente"}
    >
      {direction === "previous" ? "‹" : "›"}
    </button>
  );
}

export default function MediaViewer({
  item,
  items,
  onClose,
  onSelect
}: {
  item: PortalMediaAsset | null;
  items: PortalMediaAsset[];
  onClose: () => void;
  onSelect: (item: PortalMediaAsset) => void;
}) {
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const currentIndex = item ? items.findIndex((candidate) => candidate.id === item.id) : -1;
  const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  useEffect(() => {
    if (!item) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && previousItem) onSelect(previousItem);
      if (event.key === "ArrowRight" && nextItem) onSelect(nextItem);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [item, nextItem, onClose, onSelect, previousItem]);

  if (!item) return null;

  const fileHref = `/api/portal/media/${encodeURIComponent(item.id)}`;

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0 && nextItem) {
      onSelect(nextItem);
    }

    if (deltaX > 0 && previousItem) {
      onSelect(previousItem);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,19,34,0.82)] p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#081322] text-white shadow-[0_32px_80px_-28px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/52">{item.category}</div>
            <div className="mt-2 text-xl font-semibold">{item.title}</div>
            <div className="mt-1 text-sm text-white/64">{item.filename}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <HeaderActionButton
              label="Anterior"
              onClick={() => previousItem && onSelect(previousItem)}
              disabled={!previousItem}
              className="hidden sm:inline-flex"
            />
            <HeaderActionButton
              label="Siguiente"
              onClick={() => nextItem && onSelect(nextItem)}
              disabled={!nextItem}
              className="hidden sm:inline-flex"
            />
            <HeaderActionButton label="Cerrar" ariaLabel="Cerrar visor" onClick={onClose} />
          </div>
        </div>

        <div className="max-h-[calc(92vh-96px)] overflow-auto bg-[linear-gradient(180deg,#09192d_0%,#10233A_100%)] p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <ArrowButton direction="previous" onClick={() => previousItem && onSelect(previousItem)} disabled={!previousItem} />

            <div className="min-w-0 flex-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              {item.viewerType === "image" ? (
                <img src={fileHref} alt={item.title} className="mx-auto max-h-[75vh] w-auto max-w-full rounded-[24px] bg-white/4" />
              ) : item.viewerType === "pdf" ? (
                <iframe
                  src={fileHref}
                  title={item.title}
                  className="h-[75vh] w-full rounded-[24px] border border-white/10 bg-white"
                />
              ) : (
                <div className="flex min-h-[22rem] items-center justify-center rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
                  <div>
                    <div className="text-lg font-semibold">Vista previa no disponible</div>
                    <div className="mt-2 text-sm leading-6 text-white/64">
                      El archivo se puede abrir en una pestaña aparte si el navegador soporta este formato.
                    </div>
                    <a
                      href={fileHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#123861]"
                    >
                      Abrir archivo
                    </a>
                  </div>
                </div>
              )}
            </div>

            <ArrowButton direction="next" onClick={() => nextItem && onSelect(nextItem)} disabled={!nextItem} />
          </div>

          {items.length > 1 ? (
            <>
              <div className="mt-4 text-center text-[11px] font-medium text-white/48 sm:hidden">
                Desliza para cambiar de imagen
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                {items.map((candidate, index) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => onSelect(candidate)}
                    className={`h-2.5 rounded-full transition ${
                      candidate.id === item.id ? "w-8 bg-white" : "w-2.5 bg-white/28 hover:bg-white/48"
                    }`}
                    aria-label={`Ir al elemento ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
