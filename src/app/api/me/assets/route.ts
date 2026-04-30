import { NextResponse } from "next/server";
import { getAssets } from "@/lib/portal/assets.service";

export async function GET() {
  try {
    return NextResponse.json(await getAssets());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown assets error";
    console.error("[api/me/assets]", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
