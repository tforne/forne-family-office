"use client";

import { useEffect, useRef } from "react";
import BrandIcon from "@/components/brand/BrandIcon";
import type { PortalStakeholder } from "@/lib/portal/stakeholders.types";

function presentCategory(category: string) {
  const normalized = category.trim().toLowerCase();
  if (!normalized || normalized === "undefined") {
    return "Servicio esencial";
  }

  return category;
}

export default function ServiceDetailModal({
  service,
  isOpen,
  onClose
}: {
  service: PortalStakeholder;
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.28)] px-4 backdrop-blur-[6px]"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-6 shadow-[0_32px_80px_-34px_rgba(15,23,42,0.45)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`service-modal-title-${service.entryNo}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forne-muted">
              Servicio asociado
            </div>
            <h2
              id={`service-modal-title-${service.entryNo}`}
              className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink"
            >
              {service.serviceTitle}
            </h2>
            <div className="mt-2 text-sm text-forne-muted">
              {presentCategory(service.category)} · {service.stakeholderName}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-forne-line bg-white text-forne-muted transition hover:text-forne-ink"
            aria-label="Cerrar detalle del servicio"
          >
            <BrandIcon name="attention" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7ff_100%)] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">Descripción</div>
            <div className="mt-3 text-sm leading-7 text-forne-ink">
              {service.portalDescription || "No hay una descripción pública disponible para este servicio."}
            </div>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(180deg,#f8fbff_0%,#f1f7ff_100%)] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">Detalle</div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-forne-ink">
              <div><span className="font-semibold">Proveedor:</span> {service.stakeholderName}</div>
              <div><span className="font-semibold">Categoría:</span> {presentCategory(service.category)}</div>
              <div><span className="font-semibold">Inmueble:</span> {service.propertyNo}</div>
              {service.buildingNo ? <div><span className="font-semibold">Edificio:</span> {service.buildingNo}</div> : null}
              {service.phoneHref ? (
                <div>
                  <span className="font-semibold">Teléfono:</span>{" "}
                  <a href={service.phoneHref} className="underline-offset-4 hover:underline">
                    {service.phoneNo}
                  </a>
                </div>
              ) : service.phoneNo ? (
                <div><span className="font-semibold">Teléfono:</span> {service.phoneNo}</div>
              ) : null}
              {service.emailHref ? (
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  <a href={service.emailHref} className="underline-offset-4 hover:underline">
                    {service.email}
                  </a>
                </div>
              ) : service.email ? (
                <div><span className="font-semibold">Email:</span> {service.email}</div>
              ) : null}
            </div>
          </div>
        </div>

        {service.notes ? (
          <div className="mt-4 rounded-[24px] border border-forne-line bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">Notas visibles</div>
            <div className="mt-3 text-sm leading-7 text-forne-ink">{service.notes}</div>
          </div>
        ) : null}

        <div className="mt-4 rounded-[24px] border border-forne-line bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">Acciones</div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {service.whatsappHref ? (
              <a
                href={service.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-forne-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_30px_-22px_rgba(15,23,42,0.85)] transition hover:bg-forne-ink/92"
              >
                Abrir WhatsApp
              </a>
            ) : null}
            {service.bookingUrl ? (
              <a
                href={service.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-forne-line bg-white px-5 py-3 text-sm font-semibold text-forne-ink transition hover:border-forne-ink/15"
              >
                {service.bookingUrl ? "Contactar / Reservar" : "Contactar"}
              </a>
            ) : null}
            {service.emailHref ? (
              <a
                href={service.emailHref}
                className="inline-flex items-center justify-center rounded-2xl border border-forne-line bg-white px-5 py-3 text-sm font-semibold text-forne-ink transition hover:border-forne-ink/15"
              >
                Enviar email
              </a>
            ) : null}
            {service.phoneHref ? (
              <a
                href={service.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-forne-line bg-white px-5 py-3 text-sm font-semibold text-forne-ink transition hover:border-forne-ink/15"
              >
                <BrandIcon name="phone" className="h-4 w-4" />
                Llamar
              </a>
            ) : null}
            {!service.whatsappHref && !service.bookingUrl && !service.emailHref && !service.phoneHref ? (
              <div className="rounded-2xl border border-dashed border-forne-line px-5 py-3 text-sm text-forne-muted">
                Este servicio no tiene una acción directa publicada todavía.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
