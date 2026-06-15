import Link from "next/link";
import PortalEmptyState from "@/components/portal/PortalEmptyState";
import PortalPageContext from "@/components/portal/PortalPageContext";
import ServiceCard from "@/components/portal/services/ServiceCard";
import { getAssets } from "@/lib/portal/assets.service";
import { getContracts } from "@/lib/portal/contracts.service";
import {
  buildStakeholdersAIContext,
  buildStakeholderReferenceCandidates,
  getPortalStakeholders
} from "@/lib/portal/stakeholders.service";
import type { AssetDto } from "@/lib/dto/asset.dto";
import type { ContractDto } from "@/lib/dto/contract.dto";
import type { PortalStakeholder } from "@/lib/portal/stakeholders.types";

async function safeLoad<T>(label: string, loader: () => Promise<T>, fallback: T) {
  try {
    return { data: await loader(), failed: false, errorMessage: "" };
  } catch (error) {
    console.error(`[portal/services] Error loading ${label}`, error);
    return {
      data: fallback,
      failed: true,
      errorMessage: error instanceof Error ? error.message : "Unknown resource error"
    };
  }
}

function pickPrimaryContract(contracts: ContractDto[]) {
  return [...contracts].sort((left, right) => {
    const leftDate = left.expirationDate || left.nextInvoiceDate || left.contractDate || "";
    const rightDate = right.expirationDate || right.nextInvoiceDate || right.contractDate || "";
    return rightDate.localeCompare(leftDate);
  })[0];
}

function pickPrimaryAsset(assets: AssetDto[], contract?: ContractDto) {
  if (contract?.fixedRealEstateNo) {
    const match = assets.find((asset) => asset.number === contract.fixedRealEstateNo);
    if (match) return match;
  }

  return assets[0];
}

function resolvePropertyReference(asset?: AssetDto, contract?: ContractDto) {
  const propertyNo = asset?.propertyNo || contract?.fixedRealEstateNo || asset?.number || "";
  const propertyLabel =
    asset?.propertyDescription ||
    asset?.description ||
    contract?.fixedRealEstateDescription ||
    contract?.description ||
    propertyNo;

  return {
    propertyNo,
    propertyLabel
  };
}

function countDistinctCategories(services: PortalStakeholder[]) {
  return new Set(services.map((service) => service.category)).size;
}

function hasReusableAIContext(service: PortalStakeholder) {
  return service.availableForAI && Boolean(service.aiDescription || service.portalDescription);
}

export default async function ServicesPage() {
  const [contractsResult, assetsResult] = await Promise.all([
    safeLoad("contracts", getContracts, []),
    safeLoad("assets", getAssets, [])
  ]);

  const primaryContract = pickPrimaryContract(contractsResult.data);
  const primaryAsset = pickPrimaryAsset(assetsResult.data, primaryContract);
  const propertyRef = resolvePropertyReference(primaryAsset, primaryContract);
  const stakeholderReferences = buildStakeholderReferenceCandidates([
    primaryAsset?.propertyNo,
    primaryAsset?.number,
    primaryContract?.fixedRealEstateNo
  ]);

  const stakeholdersResult = stakeholderReferences.length
    ? await safeLoad(
        "stakeholders",
        () => getPortalStakeholders(stakeholderReferences[0], stakeholderReferences.slice(1)),
        []
      )
    : { data: [] as PortalStakeholder[], failed: false, errorMessage: "" };

  const services = stakeholdersResult.data;
  const aiContextPreview = buildStakeholdersAIContext(services);
  const categoriesCount = countDistinctCategories(services);
  const aiReadyCount = services.filter((service) => service.availableForAI).length;
  const reusableAiCount = services.filter(hasReusableAIContext).length;
  const pageSummary = propertyRef.propertyNo
    ? `Servicios y colaboradores visibles para ${propertyRef.propertyLabel}. La experiencia se apoya en Business Central y queda preparada para enriquecer futuras recomendaciones IA.`
    : "Todavía no hemos podido identificar un inmueble principal para mostrar servicios asociados.";

  return (
    <div className="space-y-6 sm:space-y-8">
      <PortalPageContext
        payload={{
          pageEyebrow: "Servicios",
          pageTitle: "Servicios del inmueble",
          pageSummary,
          visibleFacts: [
            { label: "Inmueble", value: propertyRef.propertyLabel || "Sin inmueble principal" },
            { label: "Referencia", value: propertyRef.propertyNo || "-" },
            { label: "Servicios visibles", value: String(services.length) },
            { label: "Categorías", value: String(categoriesCount), helper: "Agrupaciones públicas visibles en el portal." }
          ],
          visibleSections: [
            {
              title: "Preparado para IA",
              summary: `${aiReadyCount} servicio(s) están marcados como disponibles para futuro contexto IA tenant-safe.`
            }
          ]
        }}
      />

      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 text-white sm:p-6 lg:p-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9c8b0]" />
              Servicios
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.35rem]">Servicios del inmueble</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              {pageSummary}
            </p>
            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur xl:max-w-[42rem]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">Referencia activa</div>
              <div className="mt-2 text-base font-semibold text-white">{propertyRef.propertyLabel || "Sin inmueble principal"}</div>
              <div className="mt-2 text-sm leading-6 text-white/64">
                {propertyRef.propertyNo
                  ? `Consulta preparada sobre ${propertyRef.propertyNo} con acceso directo a servicios, contactos y futuros contextos IA.`
                  : "Cuando el portal pueda resolver el inmueble principal del tenant, aquí aparecerán los servicios asociados."}
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/portal/contracts"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#123861] shadow-[0_24px_45px_-30px_rgba(255,255,255,0.35)] transition hover:-translate-y-0.5"
              >
                Ver ficha del inmueble
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Servicios</div>
              <div className="mt-2 text-3xl font-semibold text-white">{services.length}</div>
              <div className="mt-1 text-xs text-white/65">visibles para este inmueble</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Categorías</div>
              <div className="mt-2 text-3xl font-semibold text-white">{categoriesCount}</div>
              <div className="mt-1 text-xs text-white/65">tipos de servicio publicados</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">IA futura</div>
              <div className="mt-2 text-3xl font-semibold text-white">{aiReadyCount}</div>
              <div className="mt-1 text-xs text-white/65">servicios marcados para contexto IA</div>
            </div>
          </div>
        </div>
      </section>

      {(contractsResult.failed || assetsResult.failed) && services.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          No hemos podido resolver toda la referencia del inmueble desde Business Central. La sección sigue mostrando la información visible disponible.
        </section>
      ) : null}

      {stakeholdersResult.failed ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Diagnóstico temporal</div>
          <div className="mt-3">Error al cargar los servicios visibles desde Business Central:</div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white px-4 py-3 text-xs leading-6 text-slate-800">
            {stakeholdersResult.errorMessage || "No se recibió detalle adicional."}
          </pre>
        </section>
      ) : null}

      {!propertyRef.propertyNo ? (
        <PortalEmptyState
          icon="guide"
          title="No hemos identificado todavía el inmueble principal"
          description="Esta sección necesita una referencia de inmueble o contrato visible para cargar los servicios asociados al tenant."
        />
      ) : services.length === 0 ? (
        <PortalEmptyState
          icon="guide"
          title="Todavía no hay servicios publicados para este inmueble"
          description="Cuando Business Central exponga stakeholders visibles para esta referencia, aparecerán aquí con acceso directo a detalle y contacto."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={`${service.propertyNo}-${service.entryNo}-${service.serviceTitle}`} service={service} />
          ))}
        </section>
      )}

      <section className="ffo-portal-card rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Preparación IA</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">Contexto reutilizable de servicios</h2>
          </div>
          <div className="text-sm text-forne-muted">Solo incluye servicios preparados para recomendaciones visibles en portal.</div>
        </div>
        {reusableAiCount === 0 ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-forne-line bg-[#f8fbff] px-5 py-5">
            <div className="text-sm font-semibold text-forne-ink">Todavía no hay contexto reutilizable visible para este inmueble</div>
            <div className="mt-2 text-sm leading-7 text-forne-muted">
              Cuando Business Central publique servicios marcados para apoyo contextual, esta sección resumirá la información operativa disponible sin mostrar formato técnico.
            </div>
          </div>
        ) : (
          <pre className="mt-5 overflow-x-auto rounded-[24px] bg-[#f5f9fe] px-5 py-5 text-xs leading-6 text-forne-ink">
            {aiContextPreview}
          </pre>
        )}
      </section>
    </div>
  );
}
