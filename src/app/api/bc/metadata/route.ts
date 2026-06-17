import { NextResponse } from "next/server";
import { getBusinessCentralMetadata } from "@/lib/bc/client";
import { discoverPortalMediaEndpointsFromMetadata } from "@/lib/portal/media-assets.service";

export async function GET() {
  try {
    const metadata = await getBusinessCentralMetadata();
    const { entitySets, catalog, files } = discoverPortalMediaEndpointsFromMetadata(metadata);
    const interesting = entitySets.filter((name) =>
      /profile|user|tenant|portal|customer|media|asset|file|image|document|content/i.test(name)
    );

    return NextResponse.json({
      entitySets,
      interesting,
      mediaCandidates: {
        catalog,
        files
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown Business Central error" },
      { status: 500 }
    );
  }
}
