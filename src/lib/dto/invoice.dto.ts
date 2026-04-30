export interface InvoiceDto {
  id: string;
  invoiceNo: string;
  billToCustomerNo: string;
  billToCustomerName?: string | null;
  sellToCustomerNo: string | null;
  sellToCustomerName?: string | null;
  postingDate: string | null;
  documentDate: string | null;
  dueDate: string | null;
  currencyCode: string | null;
  amountIncludingVat: number | null;
  remainingAmount: number | null;
}
