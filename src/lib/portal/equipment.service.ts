import type { EquipmentDto } from "@/lib/dto/equipment.dto";
import { bcGetForCompany } from "@/lib/bc/client";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import { env } from "@/lib/config/env";
import { resolvePortalUserContext } from "./user-context";

const EQUIPMENT_ENDPOINT = "tenantEquipments";

function normalizeEquipment(equipment: Partial<EquipmentDto>): EquipmentDto {
  return {
    id: String(equipment.id || ""),
    freNo: String(equipment.freNo || (equipment as { fixedRealEstateNo?: string }).fixedRealEstateNo || ""),
    lineNo: typeof equipment.lineNo === "number" ? equipment.lineNo : null,
    quantity: typeof equipment.quantity === "number" ? equipment.quantity : null,
    description: equipment.description ?? null,
    serialNo: equipment.serialNo ?? null,
    modelNo: equipment.modelNo ?? null,
    acquisitionDate: equipment.acquisitionDate ?? null,
    acquisitionCost: typeof equipment.acquisitionCost === "number" ? equipment.acquisitionCost : null,
    equipmentWarrantyPeriod: equipment.equipmentWarrantyPeriod ?? null,
    needMaintenance: Boolean(equipment.needMaintenance),
    maintenanceContractNo: equipment.maintenanceContractNo ?? null
  };
}

export async function getEquipment(realEstateNo?: string | null): Promise<EquipmentDto[]> {
  if (!realEstateNo?.trim()) return [];
  if (env.useMockApi) return [];

  const user = await resolvePortalUserContext();

  try {
    const payload = await bcGetForCompany<{ value?: Partial<EquipmentDto>[] }>(
      { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
      EQUIPMENT_ENDPOINT,
      odataQuery({
        filter: eqFilter("freNo", realEstateNo.trim()),
        top: 200
      })
    );

    return unwrap(payload).map(normalizeEquipment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      message.includes("404") ||
      message.includes("Could not find a property named") ||
      message.includes("BadRequest")
    ) {
      return [];
    }
    throw error;
  }
}
