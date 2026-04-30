import { bcGetForCompany } from "@/lib/bc/client";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { AssetAttributeDto } from "@/lib/dto/asset-attribute.dto";
import { resolvePortalUserContext } from "./user-context";

const ASSET_ATTRIBUTES_ENDPOINT = "tenantAssetAttributes";

function normalizeAttribute(attribute: Partial<AssetAttributeDto>): AssetAttributeDto {
  return {
    id: String(attribute.id || ""),
    tableId: typeof attribute.tableId === "number" ? attribute.tableId : null,
    realEstateNo: String(attribute.realEstateNo || (attribute as { fixedRealEstateNo?: string }).fixedRealEstateNo || ""),
    attributeId: typeof attribute.attributeId === "number" ? attribute.attributeId : null,
    attributeValueId: typeof attribute.attributeValueId === "number" ? attribute.attributeValueId : null,
    attributeName: String(attribute.attributeName || ""),
    attributeType: attribute.attributeType ?? null,
    value: attribute.value ?? null,
    unitOfMeasure: attribute.unitOfMeasure ?? null,
    comment: attribute.comment ?? null
  };
}

export async function getAssetAttributes(realEstateNo?: string | null): Promise<AssetAttributeDto[]> {
  if (!realEstateNo?.trim()) return [];

  const user = await resolvePortalUserContext();

  try {
    const payload = await bcGetForCompany<{ value?: Partial<AssetAttributeDto>[] }>(
      { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
      ASSET_ATTRIBUTES_ENDPOINT,
      odataQuery({
        filter: eqFilter("fixedRealEstateNo", realEstateNo.trim()),
        top: 200
      })
    );

    return unwrap(payload).map(normalizeAttribute);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("404")) {
      return [];
    }
    throw error;
  }
}
