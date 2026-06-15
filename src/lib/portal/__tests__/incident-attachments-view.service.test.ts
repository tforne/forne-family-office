import { describe, expect, it } from "vitest";
import {
  buildIncidentAttachmentViews,
  extractIncidentAttachmentValues
} from "@/lib/portal/incident-attachments-view.service";

describe("buildIncidentAttachmentViews", () => {
  it("builds safe attachment views from visible objects", () => {
    const result = buildIncidentAttachmentViews([
      {
        id: "att-1",
        fileName: " <b>humedad</b>.jpg ",
        contentType: "image/jpeg",
        uploadedAt: "2026-06-07T09:14:00Z",
        createdBy: "Tenant",
        url: "https://example.com/uploads/humedad.jpg"
      }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("humedad.jpg");
    expect(result[0].href).toBe("https://example.com/uploads/humedad.jpg");
    expect(result[0].contentType).toBe("image/jpeg");
  });

  it("deduplicates repeated visible attachments", () => {
    const result = buildIncidentAttachmentViews([
      "https://example.com/files/foto.png",
      { fileName: "foto.png", url: "https://example.com/files/foto.png" }
    ]);

    expect(result).toHaveLength(1);
  });

  it("drops unsafe attachment urls", () => {
    const result = buildIncidentAttachmentViews([
      {
        fileName: "evidencia.pdf",
        url: "javascript:alert(1)"
      }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].href).toBeUndefined();
  });
});

describe("extractIncidentAttachmentValues", () => {
  it("extracts values from known incident attachment fields", () => {
    const result = extractIncidentAttachmentValues({
      incidentAttachments: [{ fileName: "parte.pdf", url: "https://example.com/parte.pdf" }],
      photoUrls: ["https://example.com/foto.webp"]
    });

    expect(result).toHaveLength(2);
  });
});
