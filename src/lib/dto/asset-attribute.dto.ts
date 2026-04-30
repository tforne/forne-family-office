export interface AssetAttributeDto {
  id: string;
  tableId: number | null;
  realEstateNo: string;
  attributeId: number | null;
  attributeValueId: number | null;
  attributeName: string;
  attributeType: string | null;
  value: string | null;
  unitOfMeasure: string | null;
  comment: string | null;
}
