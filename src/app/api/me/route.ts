import { NextResponse } from "next/server";
import { getMe } from "@/lib/portal/me.service";

export async function GET() {
  try {
    return NextResponse.json(await getMe());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown portal error" },
      { status: 500 }
    );
  }
}
