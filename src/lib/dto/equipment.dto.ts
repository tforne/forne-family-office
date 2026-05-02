export interface EquipmentDto {
  id: string;
  freNo: string;
  lineNo: number | null;
  quantity: number | null;
  description: string | null;
  serialNo: string | null;
  modelNo: string | null;
  acquisitionDate: string | null;
  acquisitionCost: number | null;
  equipmentWarrantyPeriod: string | null;
  needMaintenance: boolean;
  maintenanceContractNo: string | null;
}
