import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, createAuditLog } from "@/lib/mockDb";

export async function GET() {
  const logs = getAuditLogs();
  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const log = createAuditLog({
    actorId: body.actorId,
    actorName: body.actorName,
    actorRole: body.actorRole,
    action: body.action,
    resourceType: body.resourceType,
    resourceId: body.resourceId,
    patientId: body.patientId ?? null,
    accessResult: body.accessResult ?? "granted",
    sensitivityTier: body.sensitivityTier ?? null,
  });
  return NextResponse.json({ log }, { status: 201 });
}
