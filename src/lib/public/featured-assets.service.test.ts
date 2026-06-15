import { describe, expect, it } from "vitest";
import {
  buildPublicFeaturedAssetsFromAssets,
  isAssetForRent,
  mapAssetToPublicFeaturedAsset
} from "@/lib/public/featured-assets.service";

describe("isAssetForRent", () => {
  it("accepts supported rental statuses", () => {
    expect(isAssetForRent("En alquiler")).toBe(true);
    expect(isAssetForRent("de alquiler")).toBe(true);
    expect(isAssetForRent("For rent")).toBe(true);
    expect(isAssetForRent("Disponible para alquiler")).toBe(true);
  });

  it("rejects non-rental statuses", () => {
    expect(isAssetForRent("Alquilado")).toBe(false);
    expect(isAssetForRent("")).toBe(false);
  });
});

describe("mapAssetToPublicFeaturedAsset", () => {
  it("maps a rentable asset with title into a public card", () => {
    const result = mapAssetToPublicFeaturedAsset({
      id: "asset-1",
      status: "En alquiler",
      description: "Piso con terraza",
      city: "Barcelona",
      lastRentalPrice: 1250
    });

    expect(result).toMatchObject({
      id: "asset-1",
      status: "En alquiler",
      title: "Piso con terraza",
      location: "Barcelona"
    });
    expect(result?.price).toContain("€");
  });

  it("skips assets without rental status or title", () => {
    expect(mapAssetToPublicFeaturedAsset({ status: "En alquiler", description: "" })).toBeNull();
    expect(mapAssetToPublicFeaturedAsset({ status: "Alquilado", description: "Activo" })).toBeNull();
  });
});

describe("buildPublicFeaturedAssetsFromAssets", () => {
  it("returns only rentable titled assets sorted by title", () => {
    const result = buildPublicFeaturedAssetsFromAssets([
      { id: "2", status: "En alquiler", description: "Zeta" },
      { id: "1", status: "En alquiler", description: "Alfa" },
      { id: "3", status: "Alquilado", description: "Beta" }
    ]);

    expect(result.map((item) => item.title)).toEqual(["Alfa", "Zeta"]);
  });

  it("deduplicates repeated assets", () => {
    const result = buildPublicFeaturedAssetsFromAssets([
      { id: "1", status: "En alquiler", description: "Piso centro" },
      { id: "1", status: "En alquiler", description: "Piso centro" }
    ]);

    expect(result).toHaveLength(1);
  });
});
