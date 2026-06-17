import { NextResponse } from "next/server";
import { bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { getAssets } from "@/lib/portal/assets.service";
import { getPortalAdminSession } from "@/lib/portal/admin-auth";
import { getContracts } from "@/lib/portal/contracts.service";
import { resolvePortalUserContext } from "@/lib/portal/user-context";
import { inFilter, odataQuery, unwrap } from "@/lib/bc/odata";

const propertyFields = [
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

function sanitizeText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeList(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => sanitizeText(value)).filter(Boolean)));
}

function isForbiddenError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("403") || message.includes("prevented the action") || message.includes("permissions");
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

function sampleRecord(record?: Record<string, unknown>) {
  if (!record) return null;
  return {
    id: readString(record, ["id"]),
    mediaAssetId: readString(record, ["mediaAssetId"]),
    entryNo: readNumber(record, ["entryNo"]),
    propertyNo: readString(record, propertyFields),
    title: readString(record, ["title"]),
    fileName: readString(record, ["fileName", "filename", "name", "displayName"]),
    mediaType: readString(record, ["mediaType"]),
    category: readString(record, ["category"]),
    visibility: readString(record, ["visibility"]),
    status: readString(record, ["status"]),
    published: readBoolean(record, ["published"]),
    hasContent: readBoolean(record, ["hasContent"]),
    contentType: readString(record, ["contentType"]),
    hasBase64: Boolean(readString(record, ["contentBase64", "fileContentBase64", "mediaContentBase64", "base64", "content"]))
  };
}

async function readEndpointSample(
  endpoint: string,
  propertyFilterValues: string[],
  company: { companyId?: string; companyName?: string }
) {
  const perField = [];

  for (const field of propertyFields) {
    try {
      const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(
        company,
        endpoint,
        odataQuery({
          filter: propertyFilterValues.length ? inFilter(field, propertyFilterValues) : undefined,
          top: 5
        })
      );
      const records = unwrap(payload);
      perField.push({
        field,
        rawCount: records.length,
        firstRecord: sampleRecord(records[0])
      });
    } catch (error) {
      perField.push({
        field,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  try {
    const payload = await bcGetForCompany<{ value?: Record<string, unknown>[] }>(company, endpoint, odataQuery({ top: 5 }));
    const records = unwrap(payload);
    return {
      endpoint,
      noFilter: {
        rawCount: records.length,
        firstRecord: sampleRecord(records[0])
      },
      perField
    };
  } catch (error) {
    return {
      endpoint,
      noFilter: {
        error: error instanceof Error ? error.message : String(error)
      },
      perField
    };
  }
}

export async function GET() {
  try {
    await getPortalAdminSession();
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = code === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "No autorizado." }, { status });
  }

  try {
    const user = await resolvePortalUserContext();
    const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };
    const contracts = await getContracts();
    const contractPropertyFilterValues = normalizeList(contracts.map((contract) => contract.fixedRealEstateNo));

    let assetPropertyFilterValues: string[] = [];
    let tenantAssetsStatus: Record<string, unknown> = { accessible: true };
    try {
      const assets = await getAssets();
      assetPropertyFilterValues = normalizeList(assets.flatMap((asset) => [asset.number, asset.propertyNo]));
      tenantAssetsStatus = {
        accessible: true,
        assetCount: assets.length
      };
    } catch (error) {
      tenantAssetsStatus = {
        accessible: false,
        forbidden: isForbiddenError(error),
        error: error instanceof Error ? error.message : String(error)
      };
    }

    const propertyFilterValues = assetPropertyFilterValues.length > 0 ? assetPropertyFilterValues : contractPropertyFilterValues;

    const mediaAssets = bcEndpoints.mediaAssets
      ? await readEndpointSample(bcEndpoints.mediaAssets, propertyFilterValues, company)
      : { endpoint: "", error: "BC_MEDIA_ASSETS_ENDPOINT is not configured" };
    const mediaFiles = bcEndpoints.mediaFiles
      ? await readEndpointSample(bcEndpoints.mediaFiles, propertyFilterValues, company)
      : { endpoint: "", error: "BC_MEDIA_FILES_ENDPOINT is not configured" };

    return NextResponse.json({
      company,
      user: {
        email: user.email,
        customerNo: user.customerNo,
        customerName: user.customerName
      },
      tenantAssetsStatus,
      propertyFilterValues,
      contractPropertyFilterValues,
      assetPropertyFilterValues,
      mediaAssets,
      mediaFiles
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown media diagnostics error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
