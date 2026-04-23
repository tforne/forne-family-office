import { env } from "@/lib/config/env";
import { mockInvoices } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { isCurrentPortalAdmin } from "./admin-auth";
import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
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
  const payload = await bcGet<{ value?: InvoiceDto[] }>(
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
