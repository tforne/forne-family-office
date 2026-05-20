import { ImageResponse } from "next/og";
import PwaScreenshotTemplate from "@/app/pwa-screenshot-template";

export const runtime = "edge";

export async function GET() {
  const width = 1440;
  const height = 1024;

  return new ImageResponse(<PwaScreenshotTemplate width={width} height={height} />, {
    width,
    height
  });
}
