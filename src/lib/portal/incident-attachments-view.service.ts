export interface IncidentAttachmentView {
  id: string;
  filename: string;
  contentType?: string;
  sizeLabel?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  href?: string;
}

const defaultAttachmentKeys = [
  "attachments",
  "incidentAttachments",
  "files",
  "documents",
  "incidentFiles",
  "photos",
  "incidentImages",
  "images",
  "imageUrls",
  "incidentImageUrls",
  "photoUrls"
];

function sanitizeText(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeFilename(value: string) {
  const cleaned = sanitizeText(value)
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+\./g, ".")
    .replace(/\.\.+/g, ".");
  return cleaned || "Archivo adjunto";
}

function cleanUrl(value: string | null | undefined) {
  const trimmed = (value || "").trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("/")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^data:(image\/|application\/pdf)/i.test(trimmed)) return trimmed;
  return undefined;
}

function cleanDate(value: string | null | undefined) {
  const trimmed = (value || "").trim();
  if (!trimmed || trimmed.startsWith("0001-01-01")) return undefined;
  return trimmed;
}

function normalizeContentType(value: string | null | undefined) {
  const trimmed = (value || "").trim().toLowerCase();
  return trimmed || undefined;
}

function extensionFromFilename(fileName: string) {
  const normalized = fileName.toLowerCase();
  const match = normalized.match(/\.([a-z0-9]{2,8})(?:$|\?)/i);
  return match?.[1] || "";
}

function guessContentType(fileName: string, href?: string) {
  const source = `${fileName} ${href || ""}`.toLowerCase();
  if (/\.jpe?g(\?|$)|data:image\/jpeg/.test(source)) return "image/jpeg";
  if (/\.png(\?|$)|data:image\/png/.test(source)) return "image/png";
  if (/\.webp(\?|$)|data:image\/webp/.test(source)) return "image/webp";
  if (/\.gif(\?|$)|data:image\/gif/.test(source)) return "image/gif";
  if (/\.svg(\?|$)|data:image\/svg\+xml/.test(source)) return "image/svg+xml";
  if (/\.pdf(\?|$)|data:application\/pdf/.test(source)) return "application/pdf";
  return undefined;
}

function formatBytes(bytes: number | null | undefined) {
  if (!Number.isFinite(bytes) || !bytes || bytes <= 0) return undefined;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function extractFilenameFromHref(href: string) {
  if (href.startsWith("data:")) return "Adjunto";
  const withoutQuery = href.split(/[?#]/)[0];
  const segments = withoutQuery.split("/").filter(Boolean);
  return segments.length ? decodeURIComponent(segments[segments.length - 1]) : "Adjunto";
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function coerceDate(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const cleaned = cleanDate(value);
      if (cleaned) return cleaned;
    }
  }
  return undefined;
}

function coerceString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && sanitizeText(value)) {
      return sanitizeText(value);
    }
  }
  return undefined;
}

function coerceNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return undefined;
}

function buildViewFromString(value: string, index: number): IncidentAttachmentView | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const nested = buildIncidentAttachmentViews(Array.isArray(parsed) ? parsed : [parsed]);
      return nested[0] || null;
    } catch {
      return null;
    }
  }

  const href = cleanUrl(trimmed);
  if (!href) return null;
  const filename = sanitizeFilename(extractFilenameFromHref(href));

  return {
    id: `attachment-${index}-${filename}`,
    filename,
    href,
    contentType: guessContentType(filename, href)
  };
}

function buildViewFromRecord(record: Record<string, unknown>, index: number): IncidentAttachmentView | null {
  const href = cleanUrl(
    [record.href, record.url, record.src, record.fileUrl, record.imageUrl, record.downloadUrl].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    )
  );
  const rawFilename =
    coerceString(record, ["filename", "fileName", "name", "displayName", "title"]) ||
    (href ? sanitizeFilename(extractFilenameFromHref(href)) : "");
  const filename = sanitizeFilename(rawFilename);

  if (!filename && !href) return null;

  const contentType =
    normalizeContentType(coerceString(record, ["contentType", "mimeType", "fileType"])) ||
    guessContentType(filename, href);

  return {
    id:
      coerceString(record, ["id", "attachmentId", "entryNo", "systemId"]) ||
      `attachment-${index}-${filename || "item"}`,
    filename,
    contentType,
    sizeLabel: formatBytes(coerceNumber(record, ["size", "fileSize", "bytes", "contentLength"])),
    uploadedAt: coerceDate(record, ["uploadedAt", "createdAt", "createdOn", "modifiedOn", "timestamp", "date"]),
    uploadedBy: coerceString(record, ["uploadedBy", "createdBy", "author", "user", "source"]),
    href
  };
}

export function extractIncidentAttachmentValues(
  incident: unknown,
  keys: string[] = defaultAttachmentKeys
): unknown[] {
  const record = toRecord(incident);
  if (!record) return [];

  const values: unknown[] = [];
  for (const key of keys) {
    const rawValue = record[key];
    if (Array.isArray(rawValue)) {
      values.push(...rawValue);
      continue;
    }

    if (typeof rawValue === "string") {
      const trimmed = rawValue.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          const parsed = JSON.parse(trimmed) as unknown;
          if (Array.isArray(parsed)) {
            values.push(...parsed);
          } else {
            values.push(parsed);
          }
          continue;
        } catch {
          values.push(trimmed);
          continue;
        }
      }

      values.push(trimmed);
      continue;
    }

    if (rawValue) {
      values.push(rawValue);
    }
  }

  return values;
}

export function buildIncidentAttachmentViews(attachments: unknown[]): IncidentAttachmentView[] {
  const deduped = new Map<string, IncidentAttachmentView>();

  attachments.forEach((attachment, index) => {
    let view: IncidentAttachmentView | null = null;

    if (typeof attachment === "string") {
      view = buildViewFromString(attachment, index);
    } else {
      const record = toRecord(attachment);
      if (record) {
        view = buildViewFromRecord(record, index);
      }
    }

    if (!view) return;

    const key = `${view.filename.toLowerCase()}::${view.href || ""}`;
    if (!deduped.has(key)) {
      deduped.set(key, view);
    }
  });

  return Array.from(deduped.values());
}
