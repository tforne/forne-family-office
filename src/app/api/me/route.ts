import { NextResponse } from "next/server";
import { mockMe } from "@/lib/mock/me";
export async function GET() { return NextResponse.json(mockMe); }
