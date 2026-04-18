import type { InvoiceDto } from "@/lib/dto/invoice.dto";
export const mockInvoices: InvoiceDto[] = [
  { id: "1", invoiceNo: "FV-2026-001", billToCustomerNo: "C0001", sellToCustomerNo: "C0001", postingDate: "2026-04-01", documentDate: "2026-04-01", dueDate: "2026-04-10", currencyCode: "EUR", amountIncludingVat: 1000, remainingAmount: 0 },
  { id: "2", invoiceNo: "FV-2026-002", billToCustomerNo: "C0001", sellToCustomerNo: "C0001", postingDate: "2026-05-01", documentDate: "2026-05-01", dueDate: "2026-05-10", currencyCode: "EUR", amountIncludingVat: 1000, remainingAmount: 1000 }
];
