import { ImageResponse } from "next/og";
import PwaIconTemplate from "@/app/pwa-icon-template";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180
};

export default function AppleIcon() {
  return new ImageResponse(<PwaIconTemplate size={180} />, size);
}
