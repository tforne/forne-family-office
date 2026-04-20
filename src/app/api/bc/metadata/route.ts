import { NextResponse } from "next/server";
import { getBusinessCentralMetadata } from "@/lib/bc/client";

export async function GET() {
  try {
    const metadata = await getBusinessCentralMetadata();
    const entitySets = Array.from(metadata.matchAll(/<EntitySet\s+Name="([^"]+)"/g))
      .map((match) => match[1])
      .filter(Boolean);
    const interesting = entitySets.filter((name) =>
      /profile|user|tenant|portal|customer/i.test(name)
    );

    return NextResponse.json({
      entitySets,
      interesting
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown Business Central error" },
      { status: 500 }
    );
  }
}
