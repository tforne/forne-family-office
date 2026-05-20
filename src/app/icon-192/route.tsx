import { ImageResponse } from "next/og";
import PwaIconTemplate from "@/app/pwa-icon-template";

export const runtime = "edge";

export async function GET() {
  const size = 192;

  return new ImageResponse(<PwaIconTemplate size={size} />, {
    width: size,
    height: size
  });
}
