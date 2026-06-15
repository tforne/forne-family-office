import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { odataQuery, unwrap } from "@/lib/bc/odata";
import { env } from "@/lib/config/env";
import type { AssetDto } from "@/lib/dto/asset.dto";
import { mockAssets } from "@/lib/mock/data";

export type PublicFeaturedAsset = {
  id: string;
  status: string;
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
  usedFallback: "business-central" | "mock" | "none";
  errorMessage: string;
};

const MAX_PUBLIC_FEATURED_ASSETS = 3;
const ASSET_FETCH_TOP = 100;

function normalizeRentalStatus(status: string) {
  return status.trim().toLowerCase();
}

export function isAssetForRent(status: string | null | undefined) {
  const normalized = normalizeRentalStatus(status || "");
  if (!normalized) return false;
  return (
    normalized === "en alquiler" ||
    normalized === "de alquiler" ||
    normalized === "for rent" ||
    normalized.includes("alquiler") ||
    normalized.includes("rent")
  );
}

function pickTitle(asset: Partial<AssetDto>) {
  const record = asset as Partial<AssetDto> & Record<string, unknown>;
  return String(record.description || record.propertyDescription || record.title || record.name || "").trim();
}

function buildLocation(asset: Partial<AssetDto>) {
  const record = asset as Partial<AssetDto> & Record<string, unknown>;
  const parts: Array<string | null | undefined> = [
    record.composedAddress,
    [asset.address, asset.address2, asset.city, asset.postCode].filter(Boolean).join(", ")
  ];
  const location = typeof record.location === "string" ? record.location : undefined;

  return parts
    .concat(location)
    .map((value) => String(value || "").trim())
    .find(Boolean) || "";
}

function formatEuroAmount(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function buildPrice(asset: Partial<AssetDto>) {
  const record = asset as Partial<AssetDto> & Record<string, unknown>;
  if (typeof record.price === "string" && record.price.trim()) return record.price.trim();
  return (
    formatEuroAmount(asset.lastRentalPrice) ||
    formatEuroAmount(asset.minimumRentalPrice) ||
    formatEuroAmount(asset.referencePriceMin)
  );
}

function buildNote(asset: Partial<AssetDto>) {
  const record = asset as Partial<AssetDto> & Record<string, unknown>;
  return String(record.commercialDescription || record.assetType || record.note || "").trim();
}

export function mapAssetToPublicFeaturedAsset(asset: Partial<AssetDto>): PublicFeaturedAsset | null {
  const title = pickTitle(asset);
  const status = String(asset.status || "").trim();

  if (!title || !isAssetForRent(status)) return null;

  return {
    id: String(asset.id || asset.number || title),
    status,
    badge: "Activo destacado",
    title,
    location: buildLocation(asset),
    price: buildPrice(asset),
    note: buildNote(asset)
  };
}

export function buildPublicFeaturedAssetsFromAssets(assets: Array<Partial<AssetDto>>) {
  const deduped = new Map<string, PublicFeaturedAsset>();

  for (const asset of assets) {
    const mapped = mapAssetToPublicFeaturedAsset(asset);
    if (!mapped) continue;

    const key = mapped.id || mapped.title.toLowerCase();
    if (!deduped.has(key)) deduped.set(key, mapped);
  }

  return Array.from(deduped.values())
    .sort((left, right) => left.title.localeCompare(right.title, "es", { sensitivity: "base" }))
    .slice(0, MAX_PUBLIC_FEATURED_ASSETS);
}

async function loadPublicAssets() {
  if (env.useMockApi) {
    return {
      assets: mockAssets,
      source: "mock" as const,
      errorMessage: ""
    };
  }

  try {
    const payload = await bcGet<{ value?: Partial<AssetDto>[] }>(
      bcEndpoints.assets,
      odataQuery({ top: ASSET_FETCH_TOP })
    );

    return {
      assets: unwrap(payload),
      source: "business-central" as const,
      errorMessage: ""
    };
  } catch (error) {
    return {
      assets: [] as Partial<AssetDto>[],
      source: "none" as const,
      errorMessage: error instanceof Error ? error.message : "No se pudieron cargar los activos."
    };
  }
}

export async function listPublicFeaturedAssets(): Promise<PublicFeaturedAsset[]> {
  const { assets } = await loadPublicAssets();
  return buildPublicFeaturedAssetsFromAssets(assets);
}

export async function getPublicFeaturedAssetsDiagnostics(): Promise<PublicFeaturedAssetsDiagnostics> {
  const { assets, source, errorMessage } = await loadPublicAssets();
  const renderableAssets = buildPublicFeaturedAssetsFromAssets(assets);

  return {
    selectedCount: renderableAssets.length,
    totalAssets: assets.length,
    matchedByStatus: assets.filter((asset) => isAssetForRent(asset.status)).length,
    matchedByPrice: assets.filter(
      (asset) =>
        typeof asset.lastRentalPrice === "number" ||
        typeof asset.minimumRentalPrice === "number" ||
        typeof asset.referencePriceMin === "number"
    ).length,
    renderableAssets: renderableAssets.length,
    sampleStatuses: Array.from(new Set(assets.map((asset) => String(asset.status || "").trim()).filter(Boolean))).slice(0, 5),
    usedFallback: source,
    errorMessage
  };
}
