"use client";

import { useState } from "react";
import BrandIcon from "@/components/brand/BrandIcon";
import ServiceDetailModal from "./ServiceDetailModal";
import type { PortalStakeholder } from "@/lib/portal/stakeholders.types";

function presentCategory(category: string) {
  const normalized = category.trim().toLowerCase();
  if (!normalized || normalized === "undefined") {
    return "Servicio esencial";
  }

  return category;
}

export default function ServiceCard({
  service
}: {
  service: PortalStakeholder;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <article className="group overflow-hidden rounded-[32px] border border-[rgba(18,56,97,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,249,252,0.98)_100%)] p-5 shadow-[0_28px_65px_-42px_rgba(10,25,44,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_34px_75px_-42px_rgba(10,25,44,0.34)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b6fd8]">
              <BrandIcon name="operations" className="h-3.5 w-3.5" />
              {presentCategory(service.category)}
            </div>
            <h3 className="mt-4 text-[1.55rem] font-semibold leading-tight tracking-[-0.03em] text-forne-ink sm:text-[1.95rem]">
              {service.serviceTitle}
            </h3>
            <div className="mt-2 text-sm font-medium text-[#66758A]">{service.stakeholderName}</div>
          </div>
          {typeof service.priorityScore === "number" ? (
            <div className="shrink-0 rounded-2xl bg-[#f1f6fb] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forne-muted">
              {service.priorityScore}
            </div>
          ) : null}
        </div>

        <p className="mt-5 text-sm leading-6 text-[#627286] sm:leading-7">
          {service.portalDescription || "Servicio visible para este inmueble sin descripción ampliada publicada."}
        </p>

        {service.phoneNo || service.email ? (
          <div className="mt-5 space-y-2 text-sm text-[#627286]">
            {service.phoneHref ? (
              <div>
                <a href={service.phoneHref} className="font-medium text-forne-ink underline-offset-4 hover:underline">
                  {service.phoneNo}
                </a>
              </div>
            ) : service.phoneNo ? (
              <div>{service.phoneNo}</div>
            ) : null}
            {service.emailHref ? (
              <div className="break-all">
                <a href={service.emailHref} className="font-medium text-forne-ink underline-offset-4 hover:underline">
                  {service.email}
                </a>
              </div>
            ) : service.email ? (
              <div className="break-all">{service.email}</div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
          {service.phoneHref ? (
            <a
              href={service.phoneHref}
              aria-label={`Llamar a ${service.stakeholderName}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#132c4c]/14 bg-[#132c4c] px-4 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.82)] transition hover:bg-[#10233c] sm:min-w-[124px]"
              title={service.phoneNo ? `Llamar: ${service.phoneNo}` : "Llamar"}
            >
              <BrandIcon name="phone" className="h-4.5 w-4.5 shrink-0" />
              <span>Llamar</span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[rgba(18,56,97,0.1)] bg-white px-4 py-3 text-sm font-semibold text-forne-ink transition hover:border-forne-ink/15"
          >
            Ver detalle
          </button>
          {service.whatsappHref ? (
            <a
              href={service.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#132c4c] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_30px_-22px_rgba(15,23,42,0.85)] transition hover:bg-[#10233c]"
            >
              WhatsApp
            </a>
          ) : null}
          {service.bookingUrl ? (
            <a
              href={service.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-forne-line bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-forne-ink transition hover:border-forne-ink/15"
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
