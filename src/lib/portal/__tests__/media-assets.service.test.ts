import { describe, expect, it } from "vitest";
import {
  discoverPortalMediaEndpointsFromMetadata,
  normalizePortalMediaCatalog,
  normalizePortalMediaCatalogFromFiles,
  normalizePortalMediaFileRecord
} from "@/lib/portal/media-assets.service";

describe("normalizePortalMediaCatalog", () => {
  it("keeps only media tied to allowed properties", () => {
    const result = normalizePortalMediaCatalog(
      [
        {
          id: "media-1",
          fileName: "salon.jpg",
          title: "Salon",
          propertyNo: "RE-001",
          category: "Interior",
          contentType: "image/jpeg"
        },
        {
          id: "media-2",
          fileName: "otra.jpg",
          title: "Otra",
          propertyNo: "RE-999",
          category: "Exterior",
          contentType: "image/jpeg"
        }
      ],
      new Set(["re-001"])
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("media-1");
  });

  it("sanitizes text and deduplicates repeated ids", () => {
    const result = normalizePortalMediaCatalog(
      [
        {
          id: "media-1",
          fileName: " <b>salon</b>.jpg ",
          title: "<script>alert(1)</script> Salon principal",
          propertyNo: "RE-001",
          category: "<b>Interior</b>",
          contentType: "image/jpeg"
        },
        {
          id: "media-1",
          fileName: "duplicado.jpg",
          title: "Duplicado",
          propertyNo: "RE-001",
          category: "Interior"
        }
      ],
      new Set(["re-001"])
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Salon principal");
    expect(result[0].filename).toBe("salon .jpg");
    expect(result[0].category).toBe("Interior");
  });

  it("keeps only tenant-published records and sorts by sortOrder then entryNo", () => {
    const result = normalizePortalMediaCatalog(
      [
        {
          id: "media-2",
          entryNo: 30,
          propertyNo: "AFI-19-00031",
          fileName: "dos.jpg",
          title: "Dos",
          mediaType: "Photo",
          category: "GENERAL",
          visibility: "TenantPortal",
          status: "Published",
          published: true,
          sortOrder: 50
        },
        {
          id: "media-1",
          entryNo: 10,
          propertyNo: "AFI-19-00031",
          fileName: "uno.jpg",
          title: "Uno",
          mediaType: "Photo",
          category: "GENERAL",
          visibility: "TenantPortal",
          status: "Published",
          published: true,
          sortOrder: 10
        },
        {
          id: "media-hidden",
          entryNo: 5,
          propertyNo: "AFI-19-00031",
          fileName: "hidden.jpg",
          title: "Oculta",
          visibility: "Internal",
          status: "Published",
          published: true
        }
      ],
      new Set(["afi-19-00031"])
    );

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("media-1");
    expect(result[1].id).toBe("media-2");
  });

  it("accepts visibility and status values with case and spacing differences", () => {
    const result = normalizePortalMediaCatalog(
      [
        {
          id: "media-1",
          entryNo: 10,
          propertyNo: "AFI-19-00031",
          title: "Uno",
          mediaType: "Photo",
          category: "GENERAL",
          visibility: "tenant portal",
          status: " published ",
          published: "true"
        }
      ],
      new Set(["afi-19-00031"])
    );

    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("Uno");
  });
});

describe("normalizePortalMediaFileRecord", () => {
  it("builds a visible file payload from base64 data", () => {
    const result = normalizePortalMediaFileRecord({
      id: "media-1",
      mediaAssetId: "media-1",
      entryNo: 23,
      propertyNo: "AFI-19-00031",
      title: "Memoria",
      hasContent: true,
      fileName: "memoria.pdf",
      contentType: "application/pdf",
      contentBase64: "UERG"
    });

    expect(result).toEqual({
      id: "media-1",
      mediaAssetId: "media-1",
      entryNo: 23,
      propertyNo: "AFI-19-00031",
      title: "Memoria",
      hasContent: true,
      filename: "memoria.pdf",
      contentType: "application/pdf",
      contentBase64: "UERG"
    });
  });

  it("returns null when the file content is missing", () => {
    const result = normalizePortalMediaFileRecord({
      id: "media-1",
      fileName: "memoria.pdf"
    });

    expect(result).toBeNull();
  });

  it("uses the catalog fallback when the file payload omits name and mime type", () => {
    const result = normalizePortalMediaFileRecord(
      {
        mediaAssetId: "media-1",
        contentBase64: "UERG"
      },
      {
        id: "media-1",
        filename: "memoria.pdf",
        contentType: "application/pdf"
      }
    );

    expect(result).toEqual({
      id: "media-1",
      mediaAssetId: "media-1",
      filename: "memoria.pdf",
      contentType: "application/pdf",
      contentBase64: "UERG"
    });
  });
});

describe("normalizePortalMediaCatalogFromFiles", () => {
  it("builds gallery items directly from mediaFiles records", () => {
    const result = normalizePortalMediaCatalogFromFiles(
      [
        {
          id: "file-1",
          mediaAssetId: "asset-1",
          entryNo: 23,
          propertyNo: "AFI-19-00031",
          title: "IMG 6909",
          fileName: "IMG_6909.jpg",
          contentType: "image/jpeg",
          contentBase64: "UERG",
          sortOrder: 50
        }
      ],
      new Set(["afi-19-00031"])
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "asset-1",
      entryNo: 23,
      propertyNo: "AFI-19-00031",
      title: "IMG 6909",
      filename: "IMG_6909.jpg",
      contentType: "image/jpeg",
      viewerType: "image"
    });
  });
});

describe("discoverPortalMediaEndpointsFromMetadata", () => {
  it("finds candidate media entity sets from bc metadata", () => {
    const metadata = `
      <EntitySet Name="tenantPortalUsers" EntityType="x.y" />
      <EntitySet Name="portalMediaAssets" EntityType="x.y" />
      <EntitySet Name="portalMediaFiles" EntityType="x.y" />
      <EntitySet Name="tenantIncidentComments" EntityType="x.y" />
    `;

    const result = discoverPortalMediaEndpointsFromMetadata(metadata);

    expect(result.catalog).toContain("portalMediaAssets");
    expect(result.files).toContain("portalMediaFiles");
  });
});
