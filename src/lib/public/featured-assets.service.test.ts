import { describe, expect, it } from "vitest";
import { buildPublicFeaturedAssetsFromContent } from "@/lib/public/featured-assets.service";

describe("buildPublicFeaturedAssetsFromContent", () => {
  it("keeps only renderable assets", () => {
    const result = buildPublicFeaturedAssetsFromContent([
      {
        id: "1",
        status: "En alquiler",
        badge: "Activo destacado",
        title: "Piso con terraza",
        location: "Barcelona",
        price: "1250 EUR",
        note: "Exterior"
      },
      {
        id: "2",
        status: "",
        badge: "Activo destacado",
        title: "   ",
        location: "",
        price: "",
        note: ""
      }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Piso con terraza");
  });

  it("deduplicates repeated assets by id", () => {
    const result = buildPublicFeaturedAssetsFromContent([
      {
        id: "1",
        status: "En alquiler",
        badge: "Activo destacado",
        title: "Piso centro",
        location: "",
        price: "",
        note: ""
      },
      {
        id: "1",
        status: "En alquiler",
        badge: "Activo destacado",
        title: "Piso centro",
        location: "",
        price: "",
        note: ""
      }
    ]);

    expect(result).toHaveLength(1);
  });

  it("limits the public list to three assets", () => {
    const result = buildPublicFeaturedAssetsFromContent([
      { id: "1", status: "", badge: "", title: "Uno", location: "", price: "", note: "" },
      { id: "2", status: "", badge: "", title: "Dos", location: "", price: "", note: "" },
      { id: "3", status: "", badge: "", title: "Tres", location: "", price: "", note: "" },
      { id: "4", status: "", badge: "", title: "Cuatro", location: "", price: "", note: "" }
    ]);

    expect(result.map((item) => item.title)).toEqual(["Uno", "Dos", "Tres"]);
  });
});
