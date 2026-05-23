import { listBundledFeaturedAssets } from "@/lib/content/featured-assets";

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
  usedFallback: "renderable" | "none";
  errorMessage: string;
};

function isRenderableAsset(asset: PublicFeaturedAsset) {
  return Boolean(asset.title.trim() && asset.location.trim() && asset.note.trim());
}

export async function listPublicFeaturedAssets(): Promise<PublicFeaturedAsset[]> {
  const assets = await listBundledFeaturedAssets();
  return assets.filter(isRenderableAsset).slice(0, 3);
}

export async function getPublicFeaturedAssetsDiagnostics(): Promise<PublicFeaturedAssetsDiagnostics> {
  const assets = await listBundledFeaturedAssets();
  const renderableAssets = assets.filter(isRenderableAsset);

  return {
    selectedCount: renderableAssets.slice(0, 3).length,
    totalAssets: assets.length,
    matchedByStatus: 0,
    matchedByPrice: 0,
    renderableAssets: renderableAssets.length,
    sampleStatuses: [],
    usedFallback: renderableAssets.length > 0 ? "renderable" : "none",
    errorMessage: ""
  };
}
