import { NextResponse } from "next/server";
import { toolTemplates } from "@/features/tools/templates";

export async function GET() {
  return NextResponse.json(toolTemplates);
}
