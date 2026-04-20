import { NextResponse } from "next/server";
import { getInvoices } from "@/lib/portal/invoices.service";

export async function GET() {
  return NextResponse.json(await getInvoices());
}
