import { NextResponse } from "next/server";
import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { odataQuery } from "@/lib/bc/odata";

export async function GET() {
  try {
    const payload = await bcGet(bcEndpoints.me, odataQuery({ top: 5 }));
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown Business Central error" },
      { status: 500 }
    );
  }
}
