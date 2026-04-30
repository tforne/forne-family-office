import { NextResponse } from "next/server";
import { getAssets } from "@/lib/portal/assets.service";

export async function GET() {
  return NextResponse.json(await getAssets());
}
