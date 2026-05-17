export interface ContractLineDto {
  [key: string]: unknown;
  id: string;
  contractId?: string | null;
  contractNo?: string | null;
  lineNo?: number | null;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  amount?: number | null;
  amountIncludingVat?: number | null;
  currencyCode?: string | null;
}
