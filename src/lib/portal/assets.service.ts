import { env } from "@/lib/config/env";
import { bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { inFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { AssetDto } from "@/lib/dto/asset.dto";
import { mockAssets } from "@/lib/mock/data";
import { getContracts } from "./contracts.service";
import { resolvePortalUserContext } from "./user-context";

function normalizeAsset(asset: Partial<AssetDto>): AssetDto {
  return {
    id: String(asset.id || asset.number || ""),
    number: String(asset.number || ""),
    description: String(asset.description || ""),
    description2: asset.description2 ?? null,
    type: asset.type ?? null,
    assetType: asset.assetType ?? null,
    status: asset.status ?? null,
    propertyNo: asset.propertyNo ?? null,
    propertyDescription: asset.propertyDescription ?? null,
    address: asset.address ?? null,
    address2: asset.address2 ?? null,
    city: asset.city ?? null,
    postCode: asset.postCode ?? null,
    county: asset.county ?? null,
    countryRegionCode: asset.countryRegionCode ?? null,
    streetName: asset.streetName ?? null,
    streetNumber: asset.streetNumber ?? null,
    floor: asset.floor ?? null,
    composedAddress: asset.composedAddress ?? null,
    googleUrl: asset.googleUrl ?? null,
    yearOfConstruction: asset.yearOfConstruction ?? null,
    builtAreaM2: asset.builtAreaM2 ?? null,
    commercialDescription: asset.commercialDescription ?? null,
    cadastralReference: asset.cadastralReference ?? null,
    cadastralUrl: asset.cadastralUrl ?? null,
    cadastralAssetValue: asset.cadastralAssetValue ?? null,
    cadastralConstructionValue: asset.cadastralConstructionValue ?? null,
    totalCadastralAssetValue: asset.totalCadastralAssetValue ?? null,
    totalCadastralConstructionValue: asset.totalCadastralConstructionValue ?? null,
    ownerName: asset.ownerName ?? null,
    lastRentalPrice: asset.lastRentalPrice ?? null,
    minimumRentalPrice: asset.minimumRentalPrice ?? null,
    lastContractPrice: asset.lastContractPrice ?? null,
    referencePriceMin: asset.referencePriceMin ?? null,
    referencePriceMax: asset.referencePriceMax ?? null,
    salesPrice: asset.salesPrice ?? null,
    minimumSalesPrice: asset.minimumSalesPrice ?? null,
    managed: Boolean(asset.managed),
    acquired: Boolean(asset.acquired),
    blocked: Boolean(asset.blocked),
    underMaintenance: Boolean(asset.underMaintenance),
    insured: Boolean(asset.insured),
    hasComments: Boolean(asset.hasComments),
    image: asset.image ?? null,
    lastDateModified: asset.lastDateModified ?? null
  };
}

export async function getAssets(): Promise<AssetDto[]> {
  if (env.useMockApi) return mockAssets;

  const contracts = await getContracts();
  const assetNumbers = Array.from(
    new Set(
      contracts
        .map((contract) => contract.fixedRealEstateNo)
        .filter((value): value is string => Boolean(value && value.trim()))
    )
  );

  if (assetNumbers.length === 0) return [];

  const user = await resolvePortalUserContext();
  const payload = await bcGetForCompany<{ value?: Partial<AssetDto>[] }>(
    { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
    bcEndpoints.assets,
    odataQuery({
      filter: inFilter("number", assetNumbers),
      top: Math.max(assetNumbers.length, 20)
    })
  );

  return unwrap(payload).map(normalizeAsset);
}
