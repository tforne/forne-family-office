import "server-only";
import { readContentFile, writeContentFile } from "@/lib/content/storage";

export type FeaturedAsset = {
  id: string;
  badge: string;
  title: string;
  location: string;
  price: string;
  note: string;
};

function normalizeItem(item: Partial<FeaturedAsset>, index: number): FeaturedAsset {
  return {
    id: String(item.id || `featured-asset-${index + 1}`),
    badge: String(item.badge || "Activo destacado"),
    title: String(item.title || ""),
    location: String(item.location || ""),
    price: String(item.price || ""),
    note: String(item.note || "")
  };
}

export async function listFeaturedAssets() {
  const raw = await readContentFile("featured-assets.json");
  const parsed = JSON.parse(raw) as Partial<FeaturedAsset>[];
  return parsed.map(normalizeItem);
}

export async function saveFeaturedAssets(items: FeaturedAsset[]) {
  const normalized = items.map(normalizeItem);
  await writeContentFile("featured-assets.json", `${JSON.stringify(normalized, null, 2)}\n`);
  return normalized;
}
