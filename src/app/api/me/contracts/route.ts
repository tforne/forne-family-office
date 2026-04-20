import { NextResponse } from "next/server";
import { getContracts } from "@/lib/portal/contracts.service";

export async function GET() {
  return NextResponse.json(await getContracts());
}
