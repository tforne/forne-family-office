import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

export type FeaturedAsset = {
  id: string;
  badge: string;
  title: string;
  location: string;
  price: string;
  note: string;
};

const featuredAssetsFilePath = path.join(process.cwd(), "src", "data", "featured-assets.json");

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
  const raw = await fs.readFile(featuredAssetsFilePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<FeaturedAsset>[];
  return parsed.map(normalizeItem);
}

export async function saveFeaturedAssets(items: FeaturedAsset[]) {
  const normalized = items.map(normalizeItem);
  await fs.writeFile(featuredAssetsFilePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}
