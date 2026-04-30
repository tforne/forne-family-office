import { env } from "@/lib/config/env";
import { mockInvoiceLines, mockInvoices } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { isCurrentPortalAdmin } from "./admin-auth";
import { bcGet, bcGetForCompany, bcStandardGetForCompany, bcStandardGetResponseForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, orFilters, unwrap } from "@/lib/bc/odata";
import type { InvoiceLineDto } from "@/lib/dto/invoice-line.dto";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

function invoiceSortTimestamp(invoice: InvoiceDto) {
  const rawDate = invoice.postingDate || invoice.documentDate || invoice.dueDate || "";
  const timestamp = rawDate ? Date.parse(rawDate) : Number.NaN;

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function sortInvoicesByDateDesc(invoices: InvoiceDto[]) {
  return [...invoices].sort((left, right) => invoiceSortTimestamp(right) - invoiceSortTimestamp(left));
}

export async function getInvoices(): Promise<InvoiceDto[]> {
  if (env.useMockApi) return sortInvoicesByDateDesc(mockInvoices);
  const isAdmin = await isCurrentPortalAdmin();

  if (isAdmin) {
    const payload = await bcGet<{ value?: InvoiceDto[] }>(
      bcEndpoints.invoices,
      odataQuery({
        orderBy: "postingDate desc",
        top: 250
      })
    );

    return sortInvoicesByDateDesc(unwrap(payload));
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
  return sortInvoicesByDateDesc(unwrap(payload));
}

export async function getInvoiceById(id: string): Promise<InvoiceDto | undefined> {
  const invoices = await getInvoices();
  return invoices.find((invoice) => invoice.id === id || invoice.invoiceNo === id);
}

export async function getInvoiceLines(invoice: InvoiceDto): Promise<InvoiceLineDto[]> {
  if (env.useMockApi) {
    return mockInvoiceLines.filter((line) => line.invoiceNo === invoice.invoiceNo);
  }

  const user = await resolvePortalUserContext();
  const filters = [invoice.invoiceNo ? eqFilter("invoiceNo", invoice.invoiceNo) : ""].filter(Boolean);

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

type StandardSalesInvoiceDto = {
  id: string;
  number?: string | null;
};

type PdfDocumentDto = {
  id: string;
  parentId?: string | null;
  parentType?: string | null;
};

export async function getInvoicePdf(invoice: InvoiceDto) {
  if (env.useMockApi) {
    throw new Error("PDF no disponible en modo mock.");
  }

  const user = await resolvePortalUserContext();
  const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };
  const salesInvoicePayload = await bcStandardGetForCompany<{ value?: StandardSalesInvoiceDto[] }>(
    company,
    "salesInvoices",
    odataQuery({
      filter: eqFilter("number", invoice.invoiceNo),
      top: 1
    })
  );
  const salesInvoice = unwrap(salesInvoicePayload)[0];

  if (!salesInvoice?.id) {
    throw new Error(`No se encontró la salesInvoice estándar para la factura ${invoice.invoiceNo}. Revisa que tenantInvoices.invoiceNo coincida con salesInvoices.number en Business Central.`);
  }

  let pdfDocument: PdfDocumentDto;
  try {
    pdfDocument = await bcStandardGetForCompany<PdfDocumentDto>(
      company,
      `salesInvoices(${salesInvoice.id})/pdfDocument`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    throw new Error(`La salesInvoice ${salesInvoice.id} existe, pero Business Central no ha devuelto pdfDocument. ${message}`);
  }

  if (!pdfDocument?.id) {
    throw new Error(`Business Central devolvió la salesInvoice ${salesInvoice.id}, pero no informó un pdfDocument para la factura ${invoice.invoiceNo}.`);
  }

  const response = await bcStandardGetResponseForCompany(
    company,
    `salesInvoices(${salesInvoice.id})/pdfDocument(${pdfDocument.id})/content`,
    undefined,
    "application/pdf"
  );

  const bytes = await response.arrayBuffer();

  return {
    bytes,
    fileName: `${invoice.invoiceNo || salesInvoice.number || "factura"}.pdf`
  };
}
