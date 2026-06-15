"use client";

import { useState } from "react";
import BrandIcon from "@/components/brand/BrandIcon";
import ServiceDetailModal from "./ServiceDetailModal";
import type { PortalStakeholder } from "@/lib/portal/stakeholders.types";

export default function ServiceCard({
  service
}: {
  service: PortalStakeholder;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <article className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b6fd8]">
              <BrandIcon name="operations" className="h-3.5 w-3.5" />
              {service.category}
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-forne-ink">
              {service.serviceTitle}
            </h3>
            <div className="mt-2 text-sm font-medium text-forne-muted">{service.stakeholderName}</div>
          </div>
          {typeof service.priorityScore === "number" ? (
            <div className="rounded-2xl bg-[#f5f9fe] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forne-muted">
              {service.priorityScore}
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-7 text-forne-muted">
          {service.portalDescription || "Servicio visible para este inmueble sin descripción ampliada publicada."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl border border-forne-line bg-white px-4 py-3 text-sm font-semibold text-forne-ink transition hover:border-forne-ink/15"
          >
            Ver detalle
          </button>
          {service.whatsappHref ? (
            <a
              href={service.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-forne-ink px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_30px_-22px_rgba(15,23,42,0.85)] transition hover:bg-forne-ink/92"
            >
              WhatsApp
            </a>
          ) : null}
          {service.bookingUrl ? (
            <a
              href={service.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-forne-line bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-forne-ink transition hover:border-forne-ink/15"
            >
              Contactar / Reservar
            </a>
          ) : null}
        </div>
      </article>

      <ServiceDetailModal service={service} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
