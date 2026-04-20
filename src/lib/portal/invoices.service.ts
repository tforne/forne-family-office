import { env } from "@/lib/config/env";
import { mockInvoices } from "@/lib/mock/data";
import { resolvePortalUserContext } from "./user-context";
import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { eqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

export async function getInvoices(): Promise<InvoiceDto[]> {
  if (env.useMockApi) return mockInvoices;
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
