import { env } from "@/lib/config/env";
import { mockInvoiceLines, mockInvoices } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { isCurrentPortalAdmin } from "./admin-auth";
import { getBusinessCentralAccessToken } from "@/lib/bc/auth";
import { bcGet, bcGetForCompany, bcStandardGetForCompany, bcStandardGetResponseForCompany } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, orFilters, unwrap } from "@/lib/bc/odata";
import type { InvoiceLineDto } from "@/lib/dto/invoice-line.dto";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

function invoiceSortTimestamp(invoice: InvoiceDto) {
  const rawDate = invoice.postingDate || "";
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
  "pdfDocumentContent@odata.mediaReadLink"?: string | null;
};

type InvoicePdfSource = {
  invoiceNo: string;
  fileName: string;
  company: { companyName?: string };
  salesInvoice: StandardSalesInvoiceDto;
  pdfDocument: PdfDocumentDto;
};

async function resolveInvoicePdfSource(invoice: InvoiceDto): Promise<InvoicePdfSource> {
  const user = await resolvePortalUserContext();
  const company = { companyName: user.bcCompanyName };
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

  return {
    invoiceNo: invoice.invoiceNo,
    fileName: `${invoice.invoiceNo || salesInvoice.number || "factura"}.pdf`,
    company,
    salesInvoice,
    pdfDocument
  };
}

export async function getLatestInvoicesWithOfficialPdf(limit = 3, scanLimit = 10) {
  const invoices = await getInvoices();
  const candidates = invoices.slice(0, Math.max(limit, scanLimit));
  const downloadable: Array<{ id: string; invoiceNo: string }> = [];

  for (const invoice of candidates) {
    try {
      await resolveInvoicePdfSource(invoice);
      downloadable.push({ id: invoice.id || invoice.invoiceNo, invoiceNo: invoice.invoiceNo });
      if (downloadable.length >= limit) break;
    } catch {
      // Skip invoices without official PDF available in Business Central.
    }
  }

  return downloadable;
}

export async function getInvoicePdf(invoice: InvoiceDto) {
  if (env.useMockApi) {
    throw new Error("PDF no disponible en modo mock.");
  }

  const { company, salesInvoice, pdfDocument, fileName } = await resolveInvoicePdfSource(invoice);

  const mediaReadLink = pdfDocument["pdfDocumentContent@odata.mediaReadLink"];
  let response: Response;

  if (mediaReadLink) {
    const token = await getBusinessCentralAccessToken();
    response = await fetch(mediaReadLink, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Business Central error ${response.status} (${mediaReadLink}): ${text}`);
    }
  } else {
    response = await bcStandardGetResponseForCompany(
      company,
      `salesInvoices(${salesInvoice.id})/pdfDocument/pdfDocumentContent`,
      undefined,
      "application/pdf"
    );
  }

  const bytes = await response.arrayBuffer();

  return {
    bytes,
    fileName
  };
}
