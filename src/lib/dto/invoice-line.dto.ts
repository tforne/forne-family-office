export interface InvoiceLineDto {
  id: string;
  invoiceId?: string | null;
  invoiceNo?: string | null;
  lineNo?: number | null;
  description: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  amount?: number | null;
  amountIncludingVat?: number | null;
  vatPercent?: number | null;
  currencyCode?: string | null;
}
