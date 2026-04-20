import { NextResponse } from "next/server";
import { getDocuments } from "@/lib/portal/documents.service";

export async function GET() {
  return NextResponse.json(await getDocuments());
}
