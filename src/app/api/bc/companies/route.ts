import { NextResponse } from "next/server";
import { getBusinessCentralCompanies, getBusinessCentralCompaniesUrl } from "@/lib/bc/client";

export async function GET() {
  try {
    const companies = await getBusinessCentralCompanies();

    return NextResponse.json(
      companies.map((company) => ({
        id: company.id,
        name: company.name,
        displayName: company.displayName
      }))
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown Business Central error",
        url: getBusinessCentralCompaniesUrl()
      },
      { status: 500 }
    );
  }
}
