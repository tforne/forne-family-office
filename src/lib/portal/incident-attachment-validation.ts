import type { IncidentAttachmentInput } from "@/lib/portal/incident-attachment-sync.service";

export const existingIncidentAttachmentMaxBytes = 10 * 1024 * 1024;

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

function sanitizeFileName(value: string) {
  const trimmed = value.trim().replace(/[/\\?%*:|"<>]/g, "-");
  const collapsed = trimmed.replace(/\s+/g, " ").replace(/\.\.+/g, ".").trim();
  return collapsed || "adjunto";
}

function hasAllowedExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  return allowedExtensions.some((extension) => normalized.endsWith(extension));
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export async function validateExistingIncidentAttachment(file: FormDataEntryValue | null): Promise<IncidentAttachmentInput> {
  if (!isFileLike(file) || file.size <= 0) {
    throw new Error("Debes seleccionar un archivo antes de continuar.");
  }

  const cleanFileName = sanitizeFileName(file.name || "adjunto");
  const contentType = (file.type || "").trim().toLowerCase();

  if (file.size > existingIncidentAttachmentMaxBytes) {
    throw new Error("El archivo supera el tamaño máximo permitido de 10 MB.");
  }

  if (!allowedContentTypes.has(contentType) || !hasAllowedExtension(cleanFileName)) {
    throw new Error("El archivo no es válido. Puedes adjuntar imágenes JPG, PNG, WEBP o documentos PDF.");
  }

  return {
    fileName: cleanFileName,
    contentType,
    bytes: new Uint8Array(await file.arrayBuffer())
  };
}
