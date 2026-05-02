import Link from "next/link";
import { getAssets } from "@/lib/portal/assets.service";
import { getAssetAttributes } from "@/lib/portal/asset-attributes.service";
import { getContracts } from "@/lib/portal/contracts.service";
import { getEquipment } from "@/lib/portal/equipment.service";
import { getInvoices } from "@/lib/portal/invoices.service";
import type { AssetDto } from "@/lib/dto/asset.dto";
import type { AssetAttributeDto } from "@/lib/dto/asset-attribute.dto";
import type { ContractDto } from "@/lib/dto/contract.dto";
import type { EquipmentDto } from "@/lib/dto/equipment.dto";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

async function safeLoad<T>(loader: () => Promise<T>, fallback: T) {
  try {
    return { data: await loader(), failed: false, errorMessage: "" };
  } catch (error) {
    console.error("[portal/contracts] Error loading resource", error);
    return {
      data: fallback,
      failed: true,
      errorMessage: error instanceof Error ? error.message : "Unknown resource error"
    };
  }
}

function formatDate(value: string | null | undefined) {
  if (!value || value.startsWith("0001-01-01")) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatMoney(value: number | null | undefined, currencyCode = "EUR") {
  if (value == null) return "No disponible";

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode
  }).format(value);
}

function formatNumber(value: number | null | undefined, suffix = "") {
  if (value == null) return "No disponible";
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(value)}${suffix}`;
}

function safeText(value: string | null | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}

function hasUsefulText(value: string | null | undefined) {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;

  return normalized !== "no disponible" && normalized !== "-";
}

function hasMeaningfulAttributeContent(attribute: AssetAttributeDto) {
  return Boolean(
    hasUsefulText(attribute.value) ||
      hasUsefulText(attribute.comment)
  );
}

function getPrimaryContract(contracts: ContractDto[]) {
  return [...contracts].sort((left, right) => {
    const leftDate = left.expirationDate || left.nextInvoiceDate || left.contractDate || "";
    const rightDate = right.expirationDate || right.nextInvoiceDate || right.contractDate || "";
    return rightDate.localeCompare(leftDate);
  })[0];
}

function getPrimaryAsset(assets: AssetDto[], contract?: ContractDto) {
  if (contract?.fixedRealEstateNo) {
    const match = assets.find((asset) => asset.number === contract.fixedRealEstateNo);
    if (match) return match;
  }

  return assets[0];
}

function getNextPendingInvoice(invoices: InvoiceDto[], contract?: ContractDto) {
  const pendingInvoices = invoices.filter((invoice) => (invoice.remainingAmount ?? 0) > 0);

  if (contract?.customerNo) {
    const match = pendingInvoices
      .filter((invoice) => invoice.billToCustomerNo === contract.customerNo)
      .sort((left, right) => {
        const leftDate = left.dueDate || left.postingDate || left.documentDate || "";
        const rightDate = right.dueDate || right.postingDate || right.documentDate || "";
        return leftDate.localeCompare(rightDate);
      })[0];

    if (match) return match;
  }

  return pendingInvoices.sort((left, right) => {
    const leftDate = left.dueDate || left.postingDate || left.documentDate || "";
    const rightDate = right.dueDate || right.postingDate || right.documentDate || "";
    return leftDate.localeCompare(rightDate);
  })[0];
}

function statusLabel(status?: string | null) {
  const normalized = status?.toLowerCase() || "";
  if (normalized === "signed") return "Vigente";
  if (normalized === "open") return "Activo";
  if (normalized === "closed") return "Finalizado";
  if (normalized === "alquilado") return "Alquilado";
  if (normalized === "en alquiler") return "En alquiler";
  return status || "Sin estado";
}

function buildAddress(asset?: AssetDto) {
  if (!asset) return "No disponible";

  return safeText(
    asset.composedAddress ||
      [asset.address, asset.address2, asset.city, asset.postCode].filter(Boolean).join(", "),
    "No disponible"
  );
}

function buildFallbackAssetTitle(asset?: AssetDto, contract?: ContractDto) {
  return safeText(
    asset?.description || asset?.propertyDescription,
    safeText(contract?.fixedRealEstateDescription, "Activo sin descripción")
  );
}

function buildFallbackAssetDescription(asset?: AssetDto, contract?: ContractDto) {
  return safeText(
    asset?.commercialDescription || asset?.description2 || asset?.propertyDescription,
    contract?.description || "No hay una descripción comercial disponible para este activo."
  );
}

function buildAssetAddress(asset?: AssetDto, contract?: ContractDto) {
  const assetAddress = buildAddress(asset);
  if (assetAddress !== "No disponible") return assetAddress;

  return safeText(contract?.fixedRealEstateDescription, "No disponible");
}

function formatBoolean(value: boolean) {
  return value ? "Sí" : "No";
}

function DetailCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7FAFC] p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forne-muted">{label}</div>
      <div className="mt-3 text-xl font-semibold text-forne-ink">{value}</div>
      {helper ? <div className="mt-2 text-sm leading-6 text-forne-muted">{helper}</div> : null}
    </div>
  );
}

export default async function ContractsPage() {
  const [contractsResult, invoicesResult, assetsResult] = await Promise.all([
    safeLoad(getContracts, []),
    safeLoad(getInvoices, []),
    safeLoad(getAssets, [])
  ]);

  const contracts = contractsResult.data;
  const invoices = invoicesResult.data;
  const assets = assetsResult.data;

  const primaryContract = getPrimaryContract(contracts);
  const primaryAsset = getPrimaryAsset(assets, primaryContract);
  const nextPendingInvoice = getNextPendingInvoice(invoices, primaryContract);
  const assetAttributesResult = await safeLoad<AssetAttributeDto[]>(
    () => getAssetAttributes(primaryAsset?.number || primaryContract?.fixedRealEstateNo),
    []
  );
  const equipmentResult = await safeLoad<EquipmentDto[]>(
    () => getEquipment(primaryAsset?.number || primaryContract?.fixedRealEstateNo),
    []
  );
  const visibleAssetAttributes = assetAttributesResult.data.filter(hasMeaningfulAttributeContent);
  const visibleEquipment = equipmentResult.data.filter((item) =>
    Boolean(item.description?.trim() || item.serialNo?.trim() || item.modelNo?.trim())
  );
  const hasContractualFallback =
    Boolean(primaryContract) ||
    Boolean(primaryContract?.fixedRealEstateDescription) ||
    Boolean(primaryContract?.fixedRealEstateNo);
  const showAssetsWarning = assetsResult.failed && !hasContractualFallback;
  const introText =
    assets.length > 0
      ? "Vista conectada con Business Central para consultar el activo asociado, su situación operativa y el resumen económico vinculado."
      : "Resumen del inmueble basado en la información contractual disponible, con la situación operativa y económica más relevante para el cliente.";
  const showAssetsDiagnostics = assetsResult.failed;
  const showAssetAttributesDiagnostics = assetAttributesResult.failed;
  const showEquipmentDiagnostics = equipmentResult.failed;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-forne-muted">Activo inmobiliario</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forne-ink">Ficha del inmueble</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-forne-muted">
            {introText}
          </p>
        </div>

        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forne-ink transition hover:text-[#0078D4]"
        >
          <span aria-hidden="true">‹</span>
          Volver al resumen
        </Link>
      </div>

      {showAssetsWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          No hemos podido cargar toda la ficha del activo desde Business Central. La página mantiene el resumen operativo con los datos contractuales disponibles.
        </div>
      ) : null}

      {showAssetsDiagnostics ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Diagnóstico temporal
          </div>
          <div className="mt-3">
            Error al cargar el activo desde Business Central:
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white px-4 py-3 text-xs leading-6 text-slate-800">
            {assetsResult.errorMessage || "No se recibió detalle adicional."}
          </pre>
        </section>
      ) : null}

      {showAssetAttributesDiagnostics ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Diagnóstico temporal atributos
          </div>
          <div className="mt-3">
            Error al cargar los atributos del inmueble desde Business Central:
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white px-4 py-3 text-xs leading-6 text-slate-800">
            {assetAttributesResult.errorMessage || "No se recibió detalle adicional."}
          </pre>
        </section>
      ) : null}

      {showEquipmentDiagnostics ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Diagnóstico temporal equipamientos
          </div>
          <div className="mt-3">
            Error al cargar los equipamientos del inmueble desde Business Central:
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white px-4 py-3 text-xs leading-6 text-slate-800">
            {equipmentResult.errorMessage || "No se recibió detalle adicional."}
          </pre>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[30px] bg-[#0B1020] p-6 text-white shadow-[0_30px_90px_-40px_rgba(11,16,32,0.65)] sm:p-8 lg:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#CBB89A]">Activo principal</div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[2.3rem]">
          {buildFallbackAssetTitle(primaryAsset, primaryContract)}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#C8CFDD]">
          {buildAssetAddress(primaryAsset, primaryContract)}
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[24px] border border-white/10 bg-white/6 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="text-lg font-semibold text-[#D9C7AB]">Próximo recibo</div>
            <div className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-[2.65rem]">
              {nextPendingInvoice
                ? formatMoney(nextPendingInvoice.remainingAmount, nextPendingInvoice.currencyCode || "EUR")
                : formatMoney(primaryAsset?.lastContractPrice ?? primaryContract?.amountPerPeriod)}
            </div>
            <div className="mt-3 text-base text-[#C8CFDD]">
              {nextPendingInvoice
                ? `Vence el ${formatDate(nextPendingInvoice.dueDate)}`
                : primaryContract?.nextInvoiceDate
                ? `Próxima facturación prevista el ${formatDate(primaryContract.nextInvoiceDate)}`
                : "No hay vencimientos pendientes en este momento."}
            </div>
          </article>

          <article className="rounded-[24px] border border-white/10 bg-white/6 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="text-lg font-semibold text-[#D9C7AB]">Situación del activo</div>
            <div className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white">
              {statusLabel(primaryAsset?.status)}
            </div>
            <div className="mt-3 text-base text-[#C8CFDD]">
              {safeText(primaryAsset?.assetType, "Tipo de activo no informado")}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)] xl:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Características del inmueble</div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-forne-ink">
            {buildFallbackAssetTitle(primaryAsset, primaryContract)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-forne-muted">
            {buildFallbackAssetDescription(primaryAsset, primaryContract)}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DetailCard label="Dirección" value={buildAssetAddress(primaryAsset, primaryContract)} />
            <DetailCard label="Superficie construida" value={formatNumber(primaryAsset?.builtAreaM2, " m²")} />
            <DetailCard label="Año de construcción" value={primaryAsset?.yearOfConstruction?.toString() || "No disponible"} />
            <DetailCard label="Propietario" value={safeText(primaryAsset?.ownerName, "No disponible")} />
            <DetailCard label="Referencia catastral" value={safeText(primaryAsset?.cadastralReference, "No disponible")} />
            <DetailCard
              label="Estado operativo"
              value={primaryAsset?.underMaintenance ? "En mantenimiento" : "Operativo"}
              helper={primaryAsset?.insured ? "El activo consta como asegurado." : "Sin información de seguro."}
            />
          </div>
        </article>

        <article className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Resumen económico</div>
          <div className="mt-6 space-y-5">
            <div>
              <div className="text-sm text-forne-muted">Último precio de alquiler</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">
                {formatMoney(primaryAsset?.lastRentalPrice)}
              </div>
            </div>
            <div>
              <div className="text-sm text-forne-muted">Contrato actual</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">
                {formatMoney(primaryAsset?.lastContractPrice ?? primaryContract?.amountPerPeriod)}
              </div>
            </div>
            <div>
              <div className="text-sm text-forne-muted">Índice de referencia</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-forne-ink">
                {primaryAsset?.referencePriceMin != null || primaryAsset?.referencePriceMax != null
                  ? `${formatMoney(primaryAsset?.referencePriceMin)} - ${formatMoney(primaryAsset?.referencePriceMax)}`
                  : "No disponible"}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Atributos del inmueble</div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">Relación disponible</h3>
            </div>
            <div className="text-sm text-forne-muted">{visibleAssetAttributes.length} atributo(s)</div>
          </div>

          {visibleAssetAttributes.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-[#F7FAFC] px-5 py-6 text-sm text-forne-muted">
              No hay atributos disponibles para este inmueble en este momento.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-forne-line">
              <table className="min-w-full divide-y divide-forne-line text-left text-sm">
                <thead className="bg-[#FBFCFD] text-xs uppercase tracking-wide text-forne-muted">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Atributo</th>
                    <th className="px-5 py-4 font-semibold">Valor</th>
                    <th className="px-5 py-4 font-semibold">Unidad</th>
                    <th className="px-5 py-4 font-semibold">Comentario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forne-line bg-white">
                  {visibleAssetAttributes.map((attribute) => (
                    <tr key={attribute.id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-forne-ink">{safeText(attribute.attributeName, "Sin atributo")}</div>
                      </td>
                      <td className="px-5 py-4 text-forne-muted">{safeText(attribute.value, "No disponible")}</td>
                      <td className="px-5 py-4 text-forne-muted">{safeText(attribute.unitOfMeasure, "-")}</td>
                      <td className="px-5 py-4 text-forne-muted">{safeText(attribute.comment, "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Equipamientos</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-forne-ink">Elementos vinculados al inmueble</h3>
          </div>
          <div className="text-sm text-forne-muted">{visibleEquipment.length} equipo(s)</div>
        </div>

        {visibleEquipment.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-[#F7FAFC] px-5 py-6 text-sm text-forne-muted">
            No hay equipamientos registrados para este inmueble en este momento.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-forne-line">
            <table className="min-w-full divide-y divide-forne-line text-left text-sm">
              <thead className="bg-[#FBFCFD] text-xs uppercase tracking-wide text-forne-muted">
                <tr>
                  <th className="px-5 py-4 font-semibold">Descripción</th>
                  <th className="px-5 py-4 font-semibold">Cantidad</th>
                  <th className="px-5 py-4 font-semibold">Modelo</th>
                  <th className="px-5 py-4 font-semibold">Serie</th>
                  <th className="px-5 py-4 font-semibold">Garantía</th>
                  <th className="px-5 py-4 font-semibold">Mantenimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forne-line bg-white">
                {visibleEquipment.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-forne-ink">{safeText(item.description, "Sin descripción")}</div>
                      <div className="mt-1 text-xs text-forne-muted">
                        Alta: {formatDate(item.acquisitionDate)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-forne-muted">{formatNumber(item.quantity)}</td>
                    <td className="px-5 py-4 text-forne-muted">{safeText(item.modelNo, "-")}</td>
                    <td className="px-5 py-4 text-forne-muted">{safeText(item.serialNo, "-")}</td>
                    <td className="px-5 py-4 text-forne-muted">{safeText(item.equipmentWarrantyPeriod, "-")}</td>
                    <td className="px-5 py-4 text-forne-muted">
                      {formatBoolean(item.needMaintenance)}
                      {item.maintenanceContractNo ? ` · ${item.maintenanceContractNo}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_24px_55px_-38px_rgba(15,23,42,0.28)]">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-forne-muted">Contrato vinculado</div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-forne-ink">
            {safeText(primaryContract?.contractNo, "Sin contrato principal")}
          </h3>
          <div className="mt-6 space-y-4">
            <DetailCard label="Estado" value={statusLabel(primaryContract?.status)} />
            <DetailCard label="Inicio" value={formatDate(primaryContract?.startingDate)} />
            <DetailCard label="Fin" value={formatDate(primaryContract?.expirationDate)} />
            <DetailCard
              label="Próxima factura"
              value={formatDate(primaryContract?.nextInvoiceDate)}
              helper={primaryContract?.description || "Resumen del contrato actual asociado al activo."}
            />
          </div>
        </article>
      </section>
    </div>
  );
}
