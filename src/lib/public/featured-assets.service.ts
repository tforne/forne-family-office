import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { env } from "@/lib/config/env";
import type { AssetDto } from "@/lib/dto/asset.dto";
import { mockAssets } from "@/lib/mock/data";
import { odataQuery, unwrap } from "@/lib/bc/odata";

export type PublicFeaturedAsset = {
  id: string;
  badge: string;
  title: string;
  location: string;
  price: string;
  note: string;
};

export type PublicFeaturedAssetsDiagnostics = {
  selectedCount: number;
  totalAssets: number;
  matchedByStatus: number;
  matchedByPrice: number;
  renderableAssets: number;
  sampleStatuses: string[];
  usedFallback: "status" | "price" | "renderable" | "none";
  errorMessage: string;
};

function normalizeAsset(asset: Partial<AssetDto>): AssetDto {
  return {
    id: String(asset.id || asset.number || ""),
    number: String(asset.number || ""),
    description: String(asset.description || ""),
    description2: asset.description2 ?? null,
    type: asset.type ?? null,
    assetType: asset.assetType ?? null,
    status: asset.status ?? null,
    propertyNo: asset.propertyNo ?? null,
    propertyDescription: asset.propertyDescription ?? null,
    address: asset.address ?? null,
    address2: asset.address2 ?? null,
    city: asset.city ?? null,
    postCode: asset.postCode ?? null,
    county: asset.county ?? null,
    countryRegionCode: asset.countryRegionCode ?? null,
    streetName: asset.streetName ?? null,
    streetNumber: asset.streetNumber ?? null,
    floor: asset.floor ?? null,
    composedAddress: asset.composedAddress ?? null,
    googleUrl: asset.googleUrl ?? null,
    yearOfConstruction: asset.yearOfConstruction ?? null,
    builtAreaM2: asset.builtAreaM2 ?? null,
    commercialDescription: asset.commercialDescription ?? null,
    cadastralReference: asset.cadastralReference ?? null,
    cadastralUrl: asset.cadastralUrl ?? null,
    cadastralAssetValue: asset.cadastralAssetValue ?? null,
    cadastralConstructionValue: asset.cadastralConstructionValue ?? null,
    totalCadastralAssetValue: asset.totalCadastralAssetValue ?? null,
    totalCadastralConstructionValue: asset.totalCadastralConstructionValue ?? null,
    ownerName: asset.ownerName ?? null,
    lastRentalPrice: asset.lastRentalPrice ?? null,
    minimumRentalPrice: asset.minimumRentalPrice ?? null,
    lastContractPrice: asset.lastContractPrice ?? null,
    referencePriceMin: asset.referencePriceMin ?? null,
    referencePriceMax: asset.referencePriceMax ?? null,
    salesPrice: asset.salesPrice ?? null,
    minimumSalesPrice: asset.minimumSalesPrice ?? null,
    managed: Boolean(asset.managed),
    acquired: Boolean(asset.acquired),
    blocked: Boolean(asset.blocked),
    underMaintenance: Boolean(asset.underMaintenance),
    insured: Boolean(asset.insured),
    hasComments: Boolean(asset.hasComments),
    image: asset.image ?? null,
    lastDateModified: asset.lastDateModified ?? null
  };
}

function normalizeStatus(value: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isAvailableForRent(asset: AssetDto) {
  const normalizedStatus = normalizeStatus(asset.status);

  return (
    normalizedStatus === "en alquiler" ||
    normalizedStatus.includes("alquiler") ||
    normalizedStatus.includes("disponible") ||
    normalizedStatus.includes("vacante")
  );
}

function hasRentalSignal(asset: AssetDto) {
  return (
    !asset.blocked &&
    (typeof asset.lastRentalPrice === "number" ||
      typeof asset.minimumRentalPrice === "number" ||
      typeof asset.referencePriceMin === "number")
  );
}

function isRenderableAsset(asset: AssetDto) {
  return !asset.blocked && Boolean(asset.id || asset.number || asset.description || asset.propertyDescription);
}

function formatPrice(asset: AssetDto) {
  const amount = asset.lastRentalPrice ?? asset.minimumRentalPrice ?? asset.referencePriceMin;

  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "Consultar precio";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatLocation(asset: AssetDto) {
  return asset.streetName || asset.address || asset.propertyDescription || asset.description2 || "Ubicación disponible bajo consulta";
}

function formatNote(asset: AssetDto) {
  const parts = [
    asset.assetType,
    typeof asset.builtAreaM2 === "number" ? `${asset.builtAreaM2} m2` : "",
    asset.commercialDescription || ""
  ].filter(Boolean);

  return parts.join(" · ") || "Activo disponible para alquiler.";
}

function toPublicFeaturedAsset(asset: AssetDto): PublicFeaturedAsset {
  return {
    id: asset.id || asset.number,
    badge: "En alquiler",
    title: asset.description || asset.propertyDescription || "Activo disponible",
    location: formatLocation(asset),
    price: formatPrice(asset),
    note: formatNote(asset)
  };
}

async function loadPublicAssetsSource() {
  try {
    const assets = env.useMockApi
      ? mockAssets.map((asset, index) =>
          index === 0 ? { ...asset, status: "En alquiler" } : asset
        )
      : unwrap(
          await bcGet<{ value?: Partial<AssetDto>[] }>(
            bcEndpoints.assets,
            odataQuery({
              orderBy: "lastDateModified desc",
              top: 50
            })
          )
        ).map(normalizeAsset);

    return { assets, errorMessage: "" };
  } catch (error) {
    console.error("[public-featured-assets] No se pudieron cargar los activos en alquiler.", error);
    return {
      assets: [] as AssetDto[],
      errorMessage: error instanceof Error ? error.message : "No se pudo cargar la lista de activos."
    };
  }
}

function pickSelectedAssets(assets: AssetDto[]) {
  const rentalAssets = assets.filter(isAvailableForRent);
  const pricedAssets = assets.filter(hasRentalSignal);
  const renderableAssets = assets.filter(isRenderableAsset);

  if (rentalAssets.length > 0) {
    return { selectedAssets: rentalAssets, usedFallback: "status" as const, rentalAssets, pricedAssets, renderableAssets };
  }

  if (pricedAssets.length > 0) {
    return { selectedAssets: pricedAssets, usedFallback: "price" as const, rentalAssets, pricedAssets, renderableAssets };
  }

  if (renderableAssets.length > 0) {
    return {
      selectedAssets: renderableAssets,
      usedFallback: "renderable" as const,
      rentalAssets,
      pricedAssets,
      renderableAssets
    };
  }

  return {
    selectedAssets: [] as AssetDto[],
    usedFallback: "none" as const,
    rentalAssets,
    pricedAssets,
    renderableAssets
  };
}

export async function listPublicFeaturedAssets(): Promise<PublicFeaturedAsset[]> {
  const { assets } = await loadPublicAssetsSource();
  const { selectedAssets } = pickSelectedAssets(assets);
  return selectedAssets.slice(0, 3).map(toPublicFeaturedAsset);
}

export async function getPublicFeaturedAssetsDiagnostics(): Promise<PublicFeaturedAssetsDiagnostics> {
  const { assets, errorMessage } = await loadPublicAssetsSource();
  const { selectedAssets, usedFallback, rentalAssets, pricedAssets, renderableAssets } = pickSelectedAssets(assets);

  return {
    selectedCount: selectedAssets.slice(0, 3).length,
    totalAssets: assets.length,
    matchedByStatus: rentalAssets.length,
    matchedByPrice: pricedAssets.length,
    renderableAssets: renderableAssets.length,
    sampleStatuses: Array.from(new Set(assets.map((asset) => asset.status || "Sin estado"))).slice(0, 10),
    usedFallback,
    errorMessage
  };
}
