import { bcGetForCompany, getBusinessCentralMetadata } from "@/lib/bc/client";
import { inFilter, odataQuery, orFilters, unwrap } from "@/lib/bc/odata";
import { env } from "@/lib/config/env";
import type { AssetDto } from "@/lib/dto/asset.dto";
import type { ContractDto } from "@/lib/dto/contract.dto";
import { getAssets } from "@/lib/portal/assets.service";
import { getContracts } from "@/lib/portal/contracts.service";
import { resolvePortalUserContext } from "@/lib/portal/user-context";
import type { PortalMediaAsset, PortalMediaFile, PortalMediaViewerType } from "@/lib/portal/media-assets.types";

const mediaCatalogPropertyFields = [
  "propertyNo",
  "propertyCode",
  "fixedRealEstateNo",
  "assetNo",
  "assetNumber",
  "buildingNo",
  "realEstateNo",
  "freNo",
  "no"
];

const mediaFileLookupFields = ["id", "mediaAssetId", "mediaId", "assetId", "fileId"];
let mediaEndpointDiscoveryCache: { catalog: string[]; files: string[] } | null = null;

function sanitizeText(value: string | null | undefined) {
  return (value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDate(value: string | null | undefined) {
  const trimmed = (value || "").trim();
  if (!trimmed || trimmed.startsWith("0001-01-01")) return undefined;
  return trimmed;
}

function normalizeKey(value: string | null | undefined) {
  return sanitizeText(value || "")
    .toLowerCase()
    .replace(/[{}]/g, "")
    .trim();
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && sanitizeText(value)) {
      return sanitizeText(value);
    }
  }
  return "";
}

function readRawString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readDate(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const cleaned = cleanDate(value);
      if (cleaned) return cleaned;
    }
  }
  return undefined;
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "1", "si", "sí"].includes(normalized)) return true;
      if (["false", "no", "0"].includes(normalized)) return false;
    }
  }
  return undefined;
}

function formatBytes(bytes: number | undefined) {
  if (!Number.isFinite(bytes) || !bytes || bytes <= 0) return undefined;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function guessContentType(filename: string, value?: string) {
  const source = `${filename} ${value || ""}`.toLowerCase();
  if (/\.avif(\?|$)|\.bmp(\?|$)|\.gif(\?|$)|\.heic(\?|$)|\.heif(\?|$)|\.jpe?g(\?|$)|\.png(\?|$)|\.svg(\?|$)|\.webp(\?|$)/.test(source)) {
    if (source.includes(".png")) return "image/png";
    if (source.includes(".webp")) return "image/webp";
    if (source.includes(".svg")) return "image/svg+xml";
    if (source.includes(".gif")) return "image/gif";
    if (source.includes(".bmp")) return "image/bmp";
    if (source.includes(".avif")) return "image/avif";
    if (source.includes(".heic")) return "image/heic";
    if (source.includes(".heif")) return "image/heif";
    return "image/jpeg";
  }
  if (/\.pdf(\?|$)/.test(source)) return "application/pdf";
  return "";
}

function viewerTypeFrom(contentType: string, filename: string, mediaType?: string): PortalMediaViewerType {
  const normalized = `${contentType} ${filename}`.toLowerCase();
  const normalizedMediaType = sanitizeText(mediaType || "").toLowerCase();
  if (normalized.includes("application/pdf") || /\.pdf$/.test(normalized)) return "pdf";
  if (
    ["photo", "image", "picture", "thumbnail"].includes(normalizedMediaType) ||
    normalized.includes("image/") ||
    /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/.test(normalized)
  ) {
    return "image";
  }
  return "file";
}

function readableCategory(value: string) {
  const cleaned = sanitizeText(value);
  return cleaned || "General";
}

function normalizeEnumValue(value: string | null | undefined) {
  return sanitizeText(value || "").toLowerCase().replace(/\s+/g, "");
}

function isPublishedPortalMedia(record: Record<string, unknown>) {
  const visibility = readString(record, ["visibility"]);
  const status = readString(record, ["status"]);
  const published = readBoolean(record, ["published"]);

  if (visibility && normalizeEnumValue(visibility) !== "tenantportal") return false;
  if (status && normalizeEnumValue(status) !== "published") return false;
  if (published === false) return false;
  return true;
}

function buildAllowedPropertyKeys(assets: AssetDto[]) {
  return new Set(
    assets
      .flatMap((asset) => [asset.number, asset.propertyNo])
      .map((value) => normalizeKey(value))
      .filter(Boolean)
  );
}

function buildPropertyFilterValues(assets: AssetDto[]) {
  return Array.from(
    new Set(
      assets
        .flatMap((asset) => [asset.number, asset.propertyNo])
        .map((value) => sanitizeText(value))
        .filter(Boolean)
    )
  );
}

function buildAllowedPropertyKeysFromContracts(contracts: ContractDto[]) {
  return new Set(
    contracts
      .map((contract) => normalizeKey(contract.fixedRealEstateNo))
      .filter(Boolean)
  );
}

function buildPropertyFilterValuesFromContracts(contracts: ContractDto[]) {
  return Array.from(
    new Set(
      contracts
        .map((contract) => sanitizeText(contract.fixedRealEstateNo))
        .filter(Boolean)
    )
  );
}

function isForbiddenError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("403") || message.includes("prevented the action") || message.includes("permissions");
}

function tryReadPropertyNo(record: Record<string, unknown>) {
  return readString(record, mediaCatalogPropertyFields);
}

function tryReadFileId(record: Record<string, unknown>) {
  return readString(record, ["id", "mediaAssetId", "mediaId", "assetId", "fileId", "systemId"]);
}

function buildMediaAssetMatchCandidates(asset: Pick<PortalMediaAsset, "id" | "entryNo" | "propertyNo" | "title" | "filename">) {
  return {
    ids: new Set([asset.id].map((value) => normalizeKey(value)).filter(Boolean)),
    entryNos: new Set([asset.entryNo].filter((value): value is number => Number.isFinite(value))),
    propertyKeys: new Set([asset.propertyNo].map((value) => normalizeKey(value)).filter(Boolean)),
    titleKeys: new Set([asset.title, asset.filename].map((value) => normalizeKey(value)).filter(Boolean))
  };
}

function recordMatchesMediaAsset(record: Record<string, unknown>, asset: Pick<PortalMediaAsset, "id" | "entryNo" | "propertyNo" | "title" | "filename">) {
  const candidates = buildMediaAssetMatchCandidates(asset);
  const recordId = normalizeKey(tryReadFileId(record));
  const recordMediaAssetId = normalizeKey(readString(record, ["mediaAssetId", "mediaId", "assetId"]));
  const recordEntryNo = readNumber(record, ["entryNo"]);
  const recordPropertyNo = normalizeKey(tryReadPropertyNo(record));
  const recordTitle = normalizeKey(readString(record, ["title", "fileName", "filename", "name", "displayName"]));

  if (recordId && candidates.ids.has(recordId)) return true;
  if (recordMediaAssetId && candidates.ids.has(recordMediaAssetId)) return true;
  if (typeof recordEntryNo === "number" && candidates.entryNos.has(recordEntryNo)) return true;
  if (recordPropertyNo && candidates.propertyKeys.has(recordPropertyNo) && recordTitle && candidates.titleKeys.has(recordTitle)) {
    return true;
  }
  return false;
}

export function normalizePortalMediaCatalog(records: unknown[], allowedPropertyKeys: Set<string>): PortalMediaAsset[] {
  const deduped = new Map<string, PortalMediaAsset>();

  for (const value of records) {
    const record = toRecord(value);
    if (!record) continue;
    if (!isPublishedPortalMedia(record)) continue;

    const propertyNo = tryReadPropertyNo(record);
    const normalizedPropertyNo = normalizeKey(propertyNo);
    if (allowedPropertyKeys.size > 0 && (!normalizedPropertyNo || !allowedPropertyKeys.has(normalizedPropertyNo))) {
      continue;
    }

    const id = readString(record, ["id", "mediaAssetId", "systemId", "fileId"]);
    const filename = readString(record, ["fileName", "filename", "name", "title", "displayName"]);
    if (!id || !filename) continue;

    const contentType =
      readString(record, ["contentType", "mimeType", "fileType"]) || guessContentType(filename);
    const entryNo = readNumber(record, ["entryNo"]);
    const sortOrder = readNumber(record, ["sortOrder"]);
    const mediaType = readString(record, ["mediaType"]) || undefined;
    const asset: PortalMediaAsset = {
      id,
      entryNo,
      title: readString(record, ["title", "caption", "displayName", "name"]) || filename,
      filename,
      category: readableCategory(readString(record, ["category", "album", "folder", "mediaCategory", "tag"])),
      propertyNo,
      propertyLabel: readString(record, ["propertyDescription", "fixedRealEstateDescription", "assetDescription"]) || undefined,
      description: readString(record, ["description", "note", "summary", "captionText"]) || undefined,
      aiDescription: readString(record, ["aiDescription"]) || undefined,
      mediaType,
      contentType: contentType || undefined,
      externalUrl: readString(record, ["externalUrl"]) || undefined,
      thumbnailUrl: readString(record, ["thumbnailUrl"]) || undefined,
      visibility: readString(record, ["visibility"]) || undefined,
      status: readString(record, ["status"]) || undefined,
      published: readBoolean(record, ["published"]),
      sortOrder,
      validFrom: readDate(record, ["validFrom"]),
      validTo: readDate(record, ["validTo"]),
      createdAt: readDate(record, ["createdAt", "createdOn", "creationDate", "uploadedAt"]),
      updatedAt: readDate(record, ["updatedAt", "modifiedOn", "lastModifiedOn", "changedAt"]),
      byteSizeLabel: formatBytes(readNumber(record, ["size", "fileSize", "contentLength", "bytes"])),
      viewerType: viewerTypeFrom(contentType, filename, mediaType)
    };

    if (!deduped.has(asset.id)) {
      deduped.set(asset.id, asset);
    }
  }

  return Array.from(deduped.values()).sort((left, right) => {
    const leftSortOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightSortOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftSortOrder !== rightSortOrder) return leftSortOrder - rightSortOrder;

    const leftEntryNo = left.entryNo ?? Number.MAX_SAFE_INTEGER;
    const rightEntryNo = right.entryNo ?? Number.MAX_SAFE_INTEGER;
    if (leftEntryNo !== rightEntryNo) return leftEntryNo - rightEntryNo;

    const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
    if (rightTime !== leftTime) return rightTime - leftTime;
    return left.title.localeCompare(right.title, "es");
  });
}

export function normalizePortalMediaFileRecord(
  value: unknown,
  fallback?: Pick<PortalMediaAsset, "id" | "filename" | "contentType">
): PortalMediaFile | null {
  const record = toRecord(value);
  if (!record) return null;

  const contentBase64 = readRawString(record, [
    "contentBase64",
    "fileContentBase64",
    "mediaContentBase64",
    "base64",
    "content"
  ]).replace(/\s+/g, "");
  if (!contentBase64) return null;

  const id = readString(record, ["id", "mediaAssetId", "mediaId", "assetId", "fileId"]) || fallback?.id || "";
  const filename =
    readString(record, ["fileName", "filename", "name", "title", "displayName"]) || fallback?.filename || "";
  const contentType =
    readString(record, ["contentType", "mimeType", "fileType"]) ||
    fallback?.contentType ||
    guessContentType(filename);

  if (!id || !filename || !contentType) return null;

  return {
    id,
    mediaAssetId: readString(record, ["mediaAssetId", "mediaId", "assetId"]) || fallback?.id || undefined,
    entryNo: readNumber(record, ["entryNo"]),
    propertyNo: readString(record, ["propertyNo"]) || undefined,
    title: readString(record, ["title"]) || undefined,
    hasContent: readBoolean(record, ["hasContent"]),
    filename,
    contentType,
    contentBase64
  };
}

export function normalizePortalMediaCatalogFromFiles(records: unknown[], allowedPropertyKeys: Set<string>): PortalMediaAsset[] {
  const deduped = new Map<string, PortalMediaAsset>();

  for (const value of records) {
    const record = toRecord(value);
    if (!record) continue;

    const file = normalizePortalMediaFileRecord(record);
    if (!file) continue;

    const propertyNo = readString(record, ["propertyNo", "fixedRealEstateNo"]);
    const normalizedPropertyNo = normalizeKey(propertyNo);
    if (allowedPropertyKeys.size > 0 && (!normalizedPropertyNo || !allowedPropertyKeys.has(normalizedPropertyNo))) {
      continue;
    }

    const id = file.mediaAssetId || file.id;
    const title = readString(record, ["title", "displayName", "name"]) || file.filename;
    const category = readableCategory(readString(record, ["category", "mediaCategory", "album", "folder", "tag"]));
    const contentType = file.contentType || guessContentType(file.filename);
    const sortOrder = readNumber(record, ["sortOrder"]);
    const entryNo = file.entryNo ?? readNumber(record, ["entryNo"]);
    const mediaType = readString(record, ["mediaType"]) || undefined;

    if (!id || !file.filename || !contentType) continue;

    if (!deduped.has(id)) {
      deduped.set(id, {
        id,
        entryNo,
        title,
        filename: file.filename,
        category,
        propertyNo,
        propertyLabel: readString(record, ["propertyDescription", "fixedRealEstateDescription", "assetDescription"]) || undefined,
        description: readString(record, ["description", "summary", "note"]) || undefined,
        mediaType,
        contentType,
        visibility: readString(record, ["visibility"]) || undefined,
        status: readString(record, ["status"]) || undefined,
        published: readBoolean(record, ["published"]),
        sortOrder,
        validFrom: readDate(record, ["validFrom"]),
        validTo: readDate(record, ["validTo"]),
        createdAt: readDate(record, ["createdAt", "createdOn", "creationDate", "uploadedAt"]),
        updatedAt: readDate(record, ["updatedAt", "modifiedOn", "lastModifiedOn", "changedAt"]),
        byteSizeLabel: formatBytes(readNumber(record, ["size", "fileSize", "contentLength", "bytes"])),
        viewerType: viewerTypeFrom(contentType, file.filename, mediaType)
      });
    }
  }

  return Array.from(deduped.values()).sort((left, right) => {
    const leftSortOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightSortOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftSortOrder !== rightSortOrder) return leftSortOrder - rightSortOrder;

    const leftEntryNo = left.entryNo ?? Number.MAX_SAFE_INTEGER;
    const rightEntryNo = right.entryNo ?? Number.MAX_SAFE_INTEGER;
    if (leftEntryNo !== rightEntryNo) return leftEntryNo - rightEntryNo;

    return left.title.localeCompare(right.title, "es");
  });
}

function isRecoverableFieldError(message: string) {
  return (
    message.includes("404") ||
    message.includes("NotFound") ||
    message.includes("Could not find a property named") ||
    message.includes("BadRequest")
  );
}

function isMediaBackendUnavailableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("404") ||
    message.includes("NotFound") ||
    message.includes("BadRequest") ||
    message.includes("Could not find a property named")
  );
}

function logMediaDiagnostic(label: string, payload: Record<string, unknown>) {
  console.log(`[portal/media] ${label}`, JSON.stringify(payload));
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => sanitizeText(value || ""))
        .filter(Boolean)
    )
  );
}

export function discoverPortalMediaEndpointsFromMetadata(metadata: string) {
  const entitySets = Array.from(metadata.matchAll(/<EntitySet\s+Name="([^"]+)"/g))
    .map((match) => sanitizeText(match[1]))
    .filter(Boolean);

  const catalog = uniqueStrings(
    entitySets.filter((name) =>
      /(media.*asset|asset.*media|portal.*media.*asset|tenant.*media.*asset)/i.test(name)
    )
  );
  const files = uniqueStrings(
    entitySets.filter((name) =>
      /(media.*file|file.*media|portal.*media.*file|tenant.*media.*file|media.*content|content.*media)/i.test(name)
    )
  );

  return { entitySets, catalog, files };
}

async function resolvePortalMediaEndpoints() {
  if (mediaEndpointDiscoveryCache) {
    return mediaEndpointDiscoveryCache;
  }

  try {
    const metadata = await getBusinessCentralMetadata();
    const discovered = discoverPortalMediaEndpointsFromMetadata(metadata);
    mediaEndpointDiscoveryCache = {
      catalog: uniqueStrings([env.bcMediaAssetsEndpoint, ...discovered.catalog]),
      files: uniqueStrings([env.bcMediaFilesEndpoint, ...discovered.files])
    };
    logMediaDiagnostic("metadata-discovery", {
      catalogCandidates: mediaEndpointDiscoveryCache.catalog,
      fileCandidates: mediaEndpointDiscoveryCache.files
    });
    return mediaEndpointDiscoveryCache;
  } catch (error) {
    const fallback = {
      catalog: uniqueStrings([env.bcMediaAssetsEndpoint]),
      files: uniqueStrings([env.bcMediaFilesEndpoint])
    };
    mediaEndpointDiscoveryCache = fallback;
    logMediaDiagnostic("metadata-discovery", {
      catalogCandidates: fallback.catalog,
      fileCandidates: fallback.files,
      error: error instanceof Error ? error.message : String(error)
    });
    return fallback;
  }
}

async function fetchCatalogRecords(
  endpoint: string,
  propertyFilterValues: string[],
  company: { companyId?: string; companyName?: string }
) {
  let lastError: Error | null = null;

  for (const field of mediaCatalogPropertyFields) {
    try {
      const query = odataQuery({
        filter: propertyFilterValues.length ? inFilter(field, propertyFilterValues) : undefined,
        top: 100
      });
      const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(company, endpoint, query);
      const results = unwrap(payload);
      if (results.length > 0 || !propertyFilterValues.length) {
        return results;
      }
      lastError = new Error(`Empty media catalog response using property field "${field}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isRecoverableFieldError(message)) {
        lastError = error instanceof Error ? error : new Error(message);
        continue;
      }
      throw error;
    }
  }

  try {
    const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
      company,
      endpoint,
      odataQuery({ top: 100 })
    );
    return unwrap(payload);
  } catch (error) {
    if (lastError) {
      console.warn("[portal/media] Falling back without property filter failed after field attempts.", lastError);
    }
    throw error;
  }
}

async function fetchFileRecords(
  endpoint: string,
  catalogItem: Pick<PortalMediaAsset, "id" | "entryNo" | "propertyNo" | "title" | "filename">,
  company: { companyId?: string; companyName?: string }
) {
  let lastError: Error | null = null;
  const escapedMediaId = catalogItem.id.replace(/'/g, "''");

  for (const field of mediaFileLookupFields) {
    try {
      const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
        company,
        endpoint,
        odataQuery({
          filter: orFilters(
            `${field} eq '${escapedMediaId}'`,
            field === "id" ? undefined : `id eq '${escapedMediaId}'`
          ),
          top: 5
        })
      );
      const results = unwrap(payload);
      if (results.length > 0) return results;
      lastError = new Error(`Empty media file response using lookup field "${field}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isRecoverableFieldError(message)) {
        lastError = error instanceof Error ? error : new Error(message);
        continue;
      }
      throw error;
    }
  }

  if (catalogItem.entryNo !== undefined) {
    try {
      const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
        company,
        endpoint,
        odataQuery({
          filter: `entryNo eq ${catalogItem.entryNo}`,
          top: 20
        })
      );
      const results = unwrap(payload);
      if (results.length > 0) return results;
      lastError = new Error(`Empty media file response using entryNo "${catalogItem.entryNo}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isRecoverableFieldError(message)) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(message);
    }
  }

  if (catalogItem.propertyNo) {
    for (const field of mediaCatalogPropertyFields) {
      try {
        const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
          company,
          endpoint,
          odataQuery({
            filter: `${field} eq '${catalogItem.propertyNo.replace(/'/g, "''")}'`,
            top: 100
          })
        );
        const results = unwrap(payload);
        if (results.length > 0) return results;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!isRecoverableFieldError(message)) {
          throw error;
        }
        lastError = error instanceof Error ? error : new Error(message);
      }
    }
  }

  try {
    const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
      company,
      endpoint,
      odataQuery({ top: 100 })
    );
    const results = unwrap(payload);
    if (results.length > 0) return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isRecoverableFieldError(message)) {
      throw error;
    }
    lastError = error instanceof Error ? error : new Error(message);
  }

  if (lastError) {
    console.warn("[portal/media] No compatible file lookup field found.", lastError);
  }
  return [];
}

async function fetchPropertyFileRecords(
  endpoint: string,
  propertyFilterValues: string[],
  company: { companyId?: string; companyName?: string }
) {
  let lastError: Error | null = null;

  for (const field of mediaCatalogPropertyFields) {
    try {
      const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
        company,
        endpoint,
        odataQuery({
          filter: propertyFilterValues.length ? inFilter(field, propertyFilterValues) : undefined,
          top: 100
        })
      );
      const results = unwrap(payload);
      if (results.length > 0 || !propertyFilterValues.length) {
        return results;
      }
      lastError = new Error(`Empty media file catalog response using property field "${field}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isRecoverableFieldError(message)) {
        lastError = error instanceof Error ? error : new Error(message);
        continue;
      }
      throw error;
    }
  }

  try {
    const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
      company,
      endpoint,
      odataQuery({ top: 100 })
    );
    return unwrap(payload);
  } catch (error) {
    if (lastError) {
      console.warn("[portal/media] Falling back to media files without property filter failed after field attempts.", lastError);
    }
    throw error;
  }
}

function mockSvgBase64(title: string, accent: string) {
  const safeTitle = sanitizeText(title) || "Media";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#123861"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#g)"/>
  <circle cx="930" cy="220" r="150" fill="rgba(255,255,255,0.12)"/>
  <circle cx="250" cy="680" r="190" fill="rgba(255,255,255,0.10)"/>
  <rect x="120" y="120" width="440" height="300" rx="30" fill="rgba(255,255,255,0.12)"/>
  <text x="120" y="520" fill="#ffffff" font-family="Georgia, serif" font-size="54" font-weight="700">${safeTitle}</text>
  <text x="120" y="590" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif" font-size="28">Multimedia demo del portal</text>
</svg>`;
  return Buffer.from(svg).toString("base64");
}

const mockMediaAssets: PortalMediaAsset[] = [
  {
    id: "mock-media-1",
    title: "Salon principal",
    filename: "salon-principal.svg",
    category: "Interior",
    propertyNo: "RE-001",
    propertyLabel: "Vivienda Barcelona",
    description: "Vista general del salón para la ficha multimedia del inquilino.",
    contentType: "image/svg+xml",
    createdAt: "2026-06-10T09:15:00Z",
    updatedAt: "2026-06-15T11:20:00Z",
    viewerType: "image"
  },
  {
    id: "mock-media-2",
    title: "Dormitorio principal",
    filename: "dormitorio-principal.svg",
    category: "Interior",
    propertyNo: "RE-001",
    propertyLabel: "Vivienda Barcelona",
    description: "Imagen representativa del dormitorio principal.",
    contentType: "image/svg+xml",
    createdAt: "2026-06-09T12:00:00Z",
    updatedAt: "2026-06-14T08:45:00Z",
    viewerType: "image"
  },
  {
    id: "mock-media-3",
    title: "Memoria comercial",
    filename: "memoria-comercial.pdf",
    category: "Documentacion",
    propertyNo: "RE-001",
    propertyLabel: "Vivienda Barcelona",
    description: "PDF de ejemplo para la experiencia multimedia.",
    contentType: "application/pdf",
    createdAt: "2026-06-08T16:10:00Z",
    updatedAt: "2026-06-13T10:30:00Z",
    viewerType: "pdf"
  }
];

const mockMediaFiles = new Map<string, PortalMediaFile>([
  [
    "mock-media-1",
    {
      id: "mock-media-1",
      filename: "salon-principal.svg",
      contentType: "image/svg+xml",
      contentBase64: mockSvgBase64("Salon principal", "#1b6fd8")
    }
  ],
  [
    "mock-media-2",
    {
      id: "mock-media-2",
      filename: "dormitorio-principal.svg",
      contentType: "image/svg+xml",
      contentBase64: mockSvgBase64("Dormitorio principal", "#b89b6d")
    }
  ],
  [
    "mock-media-3",
    {
      id: "mock-media-3",
      filename: "memoria-comercial.pdf",
      contentType: "application/pdf",
      contentBase64: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF").toString("base64")
    }
  ]
]);

export async function getPortalMediaCatalog(): Promise<PortalMediaAsset[]> {
  const contracts = await getContracts();
  let allowedPropertyKeys = buildAllowedPropertyKeysFromContracts(contracts);
  let propertyFilterValues = buildPropertyFilterValuesFromContracts(contracts);

  logMediaDiagnostic("contract-scope", {
    contractCount: contracts.length,
    propertyFilterValues
  });

  try {
    const assets = await getAssets();
    const assetKeys = buildAllowedPropertyKeys(assets);
    const assetValues = buildPropertyFilterValues(assets);
    if (assetKeys.size > 0) {
      allowedPropertyKeys = assetKeys;
    }
    if (assetValues.length > 0) {
      propertyFilterValues = assetValues;
    }
  } catch (error) {
    if (!isForbiddenError(error)) {
      throw error;
    }
    console.warn("[portal/media] tenantAssets not accessible for media enrichment. Falling back to contract references.");
  }

  if (env.useMockApi) {
    return mockMediaAssets.filter((item) => allowedPropertyKeys.has(normalizeKey(item.propertyNo)));
  }

  const endpoints = await resolvePortalMediaEndpoints();

  if (endpoints.catalog.length === 0) {
    return [];
  }

  const user = await resolvePortalUserContext();
  const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };
  let lastCatalogError: unknown = null;

  for (const catalogEndpoint of endpoints.catalog) {
    try {
      const records = await fetchCatalogRecords(catalogEndpoint, propertyFilterValues, company);
      let normalized = normalizePortalMediaCatalog(records, allowedPropertyKeys);
      let mediaFilesFallbackRawCount = 0;

      if (normalized.length === 0 && endpoints.files.length > 0) {
        for (const fileEndpoint of endpoints.files) {
          try {
            const fileRecords = await fetchPropertyFileRecords(fileEndpoint, propertyFilterValues, company);
            mediaFilesFallbackRawCount = fileRecords.length;
            normalized = normalizePortalMediaCatalogFromFiles(fileRecords, allowedPropertyKeys);
            logMediaDiagnostic("catalog-fallback-files", {
              endpoint: fileEndpoint,
              rawCount: fileRecords.length,
              normalizedCount: normalized.length,
              firstRaw: fileRecords[0]
                ? {
                    id: readString(fileRecords[0], ["id"]),
                    mediaAssetId: readString(fileRecords[0], ["mediaAssetId"]),
                    entryNo: readNumber(fileRecords[0], ["entryNo"]),
                    propertyNo: readString(fileRecords[0], ["propertyNo"]),
                    fileName: readString(fileRecords[0], ["fileName"]),
                    contentType: readString(fileRecords[0], ["contentType"]),
                    hasBase64: Boolean(readRawString(fileRecords[0], ["contentBase64", "fileContentBase64", "mediaContentBase64", "base64", "content"]))
                  }
                : null
            });
            if (normalized.length > 0 || fileRecords.length > 0) {
              break;
            }
          } catch (error) {
            if (!isMediaBackendUnavailableError(error)) {
              throw error;
            }
          }
        }
      }

      logMediaDiagnostic("catalog-response", {
        endpoint: catalogEndpoint,
        rawCount: records.length,
        normalizedCount: normalized.length,
        mediaFilesFallbackRawCount,
        firstRaw: records[0]
          ? {
              id: readString(records[0], ["id"]),
              entryNo: readNumber(records[0], ["entryNo"]),
              propertyNo: readString(records[0], ["propertyNo"]),
              mediaType: readString(records[0], ["mediaType"]),
              category: readString(records[0], ["category"]),
              visibility: readString(records[0], ["visibility"]),
              status: readString(records[0], ["status"]),
              published: readBoolean(records[0], ["published"])
            }
          : null,
        firstNormalized: normalized[0]
          ? {
              id: normalized[0].id,
              entryNo: normalized[0].entryNo,
              propertyNo: normalized[0].propertyNo,
              title: normalized[0].title,
              category: normalized[0].category,
              sortOrder: normalized[0].sortOrder
            }
          : null
      });

      if (normalized.length > 0 || records.length > 0) {
        return normalized;
      }
    } catch (error) {
      if (isMediaBackendUnavailableError(error)) {
        lastCatalogError = error;
        continue;
      }
      throw error;
    }
  }

  if (lastCatalogError) {
    console.warn("[portal/media] Multimedia catalog endpoints unavailable. Rendering empty state instead.");
  }

  return [];
}

export async function getPortalMediaFile(mediaId: string): Promise<PortalMediaFile | null> {
  const safeMediaId = sanitizeText(mediaId);
  if (!safeMediaId) return null;

  const catalog = await getPortalMediaCatalog();
  const catalogItem = catalog.find((item) => item.id === safeMediaId);
  logMediaDiagnostic("file-request", {
    mediaId: safeMediaId,
    catalogCount: catalog.length,
    catalogHit: Boolean(catalogItem)
  });
  if (!catalogItem) return null;

  if (env.useMockApi) {
    return mockMediaFiles.get(safeMediaId) || null;
  }

  const user = await resolvePortalUserContext();
  const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };
  const resolvedEndpoints = await resolvePortalMediaEndpoints();
  const endpointsToTry = uniqueStrings([...resolvedEndpoints.files, ...resolvedEndpoints.catalog]);

  for (const endpoint of endpointsToTry) {
    let records: Record<string, unknown>[] = [];
    try {
      records = await fetchFileRecords(endpoint, catalogItem, company);
    } catch (error) {
      if (isMediaBackendUnavailableError(error)) {
        continue;
      }
      throw error;
    }
    logMediaDiagnostic("file-response", {
      endpoint,
      mediaId: safeMediaId,
      rawCount: records.length,
      firstRaw: records[0]
        ? {
            id: readString(records[0], ["id"]),
            mediaAssetId: readString(records[0], ["mediaAssetId"]),
            entryNo: readNumber(records[0], ["entryNo"]),
            propertyNo: readString(records[0], ["propertyNo"]),
            hasContent: readBoolean(records[0], ["hasContent"]),
            fileName: readString(records[0], ["fileName"]),
            contentType: readString(records[0], ["contentType"]),
            hasBase64: Boolean(readRawString(records[0], ["contentBase64", "fileContentBase64", "mediaContentBase64", "base64", "content"]))
          }
        : null
    });
    const matchedRecords = records.filter((record) => recordMatchesMediaAsset(record, catalogItem));
    const recordsToNormalize = matchedRecords.length > 0 ? matchedRecords : records;

    logMediaDiagnostic("file-match", {
      endpoint,
      mediaId: safeMediaId,
      matchedCount: matchedRecords.length,
      fallbackToFirstRecord: matchedRecords.length === 0 && records.length > 0
    });

    for (const record of recordsToNormalize) {
      const normalized = normalizePortalMediaFileRecord(record, catalogItem);
      if (normalized) {
        logMediaDiagnostic("file-normalized", {
          endpoint,
          mediaId: safeMediaId,
          id: normalized.id,
          mediaAssetId: normalized.mediaAssetId,
          hasContent: normalized.hasContent,
          fileName: normalized.filename,
          contentType: normalized.contentType,
          hasBase64: Boolean(normalized.contentBase64)
        });
        return normalized;
      }
    }
  }

  return null;
}
