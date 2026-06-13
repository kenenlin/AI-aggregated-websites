import { NextResponse } from "next/server";
import { providerOptions } from "@/features/providers";

export async function GET() {
  return NextResponse.json(providerOptions);
}
