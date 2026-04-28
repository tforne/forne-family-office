import { env } from "@/lib/config/env";
import { mockInvoiceLines, mockInvoices } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { isCurrentPortalAdmin } from "./admin-auth";
import { bcGet, bcGetForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, orFilters, unwrap } from "@/lib/bc/odata";
import type { InvoiceLineDto } from "@/lib/dto/invoice-line.dto";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

export async function getInvoices(): Promise<InvoiceDto[]> {
  if (env.useMockApi) return mockInvoices;
  const isAdmin = await isCurrentPortalAdmin();

  if (isAdmin) {
    const payload = await bcGet<{ value?: InvoiceDto[] }>(
      bcEndpoints.invoices,
      odataQuery({
        orderBy: "postingDate desc",
        top: 250
      })
    );

    return unwrap(payload);
  }

  const user = await resolvePortalUserContext();
  const payload = await bcGetForCompany<{ value?: InvoiceDto[] }>(
    { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
    bcEndpoints.invoices,
    odataQuery({
      filter: eqFilter("billToCustomerNo", user.customerNo),
      orderBy: "postingDate desc"
    })
  );
  return unwrap(payload);
}

export async function getInvoiceById(id: string): Promise<InvoiceDto | undefined> {
  const invoices = await getInvoices();
  return invoices.find((invoice) => invoice.id === id || invoice.invoiceNo === id);
}

export async function getInvoiceLines(invoice: InvoiceDto): Promise<InvoiceLineDto[]> {
  if (env.useMockApi) {
    return mockInvoiceLines.filter((line) => line.invoiceId === invoice.id || line.invoiceNo === invoice.invoiceNo);
  }

  const user = await resolvePortalUserContext();
  const filters = [
    invoice.id ? eqFilter("invoiceId", invoice.id) : "",
    invoice.id ? eqFilter("documentId", invoice.id) : "",
    invoice.id ? eqFilter("parentId", invoice.id) : "",
    invoice.invoiceNo ? eqFilter("invoiceNo", invoice.invoiceNo) : "",
    invoice.invoiceNo ? eqFilter("documentNo", invoice.invoiceNo) : ""
  ].filter(Boolean);

  if (filters.length === 0) return [];

  try {
    const payload = await bcGetForCompany<{ value?: InvoiceLineDto[] }>(
      { companyId: user.bcCompanyId, companyName: user.bcCompanyName },
      env.bcInvoiceLinesEndpoint || bcEndpoints.invoiceLines,
      odataQuery({
        filter: orFilters(...filters),
        orderBy: "lineNo asc",
        top: 200
      })
    );

    return unwrap(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("404") || message.includes("BadRequest")) {
      return [];
    }
    throw error;
  }
}
