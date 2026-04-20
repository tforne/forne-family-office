import { NextResponse } from "next/server";
import { bcGet } from "@/lib/bc/client";
import { env } from "@/lib/config/env";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { odataQuery } from "@/lib/bc/odata";

export async function GET() {
  try {
    const readSample = async (path: string) => {
      try {
        return await bcGet(path, odataQuery({ top: 3 }));
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unknown Business Central error" };
      }
    };

    return NextResponse.json({
      tenantProfiles: await readSample(bcEndpoints.me),
      tenantPortalUser: env.bcProfileUsersEndpoint
        ? await readSample(env.bcProfileUsersEndpoint)
        : { error: "BC_PROFILE_USERS_ENDPOINT is not configured" },
      tenantContracts: await readSample(bcEndpoints.contracts),
      tenantInvoices: await readSample(bcEndpoints.invoices),
      tenantIncidents: await readSample(bcEndpoints.incidents),
      tenantDocuments: await readSample(bcEndpoints.documents)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown Business Central error" },
      { status: 500 }
    );
  }
}
