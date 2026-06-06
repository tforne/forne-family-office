import bundledFeaturedAssets from "@/data/featured-assets.json";

export type BundledFeaturedAsset = {
  id: string;
  badge: string;
  title: string;
  location: string;
  price: string;
  note: string;
};

function normalizeItem(item: Partial<BundledFeaturedAsset>, index: number): BundledFeaturedAsset {
  return {
    id: String(item.id || `featured-asset-${index + 1}`),
    badge: String(item.badge || "Activo destacado"),
    title: String(item.title || ""),
    location: String(item.location || ""),
    price: String(item.price || ""),
    note: String(item.note || "")
  };
}

export function listBundledFeaturedAssets() {
  return (bundledFeaturedAssets as Partial<BundledFeaturedAsset>[]).map(normalizeItem);
}
