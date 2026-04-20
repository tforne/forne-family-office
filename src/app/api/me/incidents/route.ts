import { NextResponse } from "next/server";
import { getIncidents } from "@/lib/portal/incidents.service";

export async function GET() {
  return NextResponse.json(await getIncidents());
}
