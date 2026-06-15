import { listBundledFeaturedAssets } from "@/lib/public/bundled-featured-assets";

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
  usedFallback: "bundled";
  errorMessage: string;
};

const MAX_PUBLIC_FEATURED_ASSETS = 3;

function sanitizeText(value: string) {
  return String(value || "").trim();
}

function isRenderableAsset(asset: PublicFeaturedAsset) {
  return Boolean(sanitizeText(asset.title));
}

function hasPrice(asset: PublicFeaturedAsset) {
  return Boolean(sanitizeText(asset.price));
}

export function buildPublicFeaturedAssetsFromContent(items: PublicFeaturedAsset[]) {
  const deduped = new Map<string, PublicFeaturedAsset>();

  for (const item of items) {
    const asset = {
      id: sanitizeText(item.id),
      status: sanitizeText(item.status),
      badge: sanitizeText(item.badge) || "Activo destacado",
      title: sanitizeText(item.title),
      location: sanitizeText(item.location),
      price: sanitizeText(item.price),
      note: sanitizeText(item.note)
    };

    if (!isRenderableAsset(asset)) continue;

    const key = asset.id || asset.title.toLowerCase();
    if (!deduped.has(key)) deduped.set(key, asset);
  }

  return Array.from(deduped.values()).slice(0, MAX_PUBLIC_FEATURED_ASSETS);
}

function loadPublicAssets() {
  const assets = buildPublicFeaturedAssetsFromContent(listBundledFeaturedAssets());

  return {
    assets,
    source: "bundled" as const,
    errorMessage: ""
  };
}

export async function listPublicFeaturedAssets(): Promise<PublicFeaturedAsset[]> {
  return loadPublicAssets().assets;
}

export async function getPublicFeaturedAssetsDiagnostics(): Promise<PublicFeaturedAssetsDiagnostics> {
  const { assets, source, errorMessage } = loadPublicAssets();

  return {
    selectedCount: assets.length,
    totalAssets: assets.length,
    matchedByStatus: assets.filter((asset) => Boolean(asset.status)).length,
    matchedByPrice: assets.filter(hasPrice).length,
    renderableAssets: assets.length,
    sampleStatuses: Array.from(new Set(assets.map((asset) => asset.status).filter(Boolean))).slice(0, 5),
    usedFallback: source,
    errorMessage
  };
}
