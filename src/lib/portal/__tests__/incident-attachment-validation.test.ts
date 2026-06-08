import { describe, expect, it } from "vitest";
import {
  existingIncidentAttachmentMaxBytes,
  validateExistingIncidentAttachment
} from "@/lib/portal/incident-attachment-validation";

describe("validateExistingIncidentAttachment", () => {
  it("rejects missing files", async () => {
    await expect(validateExistingIncidentAttachment(null)).rejects.toThrow(
      "Debes seleccionar un archivo antes de continuar."
    );
  });

  it("rejects unsupported content types", async () => {
    const file = new File(["plain text"], "nota.txt", { type: "text/plain" });

    await expect(validateExistingIncidentAttachment(file)).rejects.toThrow(
      "El archivo no es válido. Puedes adjuntar imágenes JPG, PNG, WEBP o documentos PDF."
    );
  });

  it("rejects files above the 10 MB limit", async () => {
    const file = new File([new Uint8Array(existingIncidentAttachmentMaxBytes + 1)], "foto.jpg", {
      type: "image/jpeg"
    });

    await expect(validateExistingIncidentAttachment(file)).rejects.toThrow(
      "El archivo supera el tamaño máximo permitido de 10 MB."
    );
  });

  it("accepts valid files and sanitizes the file name", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "  foto..final<>.jpg  ", {
      type: "image/jpeg"
    });

    const result = await validateExistingIncidentAttachment(file);

    expect(result.contentType).toBe("image/jpeg");
    expect(result.fileName).toBe("foto.final--.jpg");
    expect(Array.from(result.bytes)).toEqual([1, 2, 3]);
  });
});
