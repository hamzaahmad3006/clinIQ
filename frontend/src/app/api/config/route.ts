import { NextRequest, NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/configStore";

export async function GET() {
  return NextResponse.json({ config: getConfig() });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const config = updateConfig(body);
  return NextResponse.json({ config });
}
