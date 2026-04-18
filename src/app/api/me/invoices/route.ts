import { NextResponse } from "next/server";
import { mockInvoices } from "@/lib/mock/invoices";
export async function GET() { return NextResponse.json(mockInvoices); }
