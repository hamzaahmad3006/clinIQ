import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, createAuditLog } from "@/lib/mockDb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const limit = parseInt(searchParams.get("limit") || "100");

  let logs = getAuditLogs().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (action) {
    logs = logs.filter((l) => l.action.includes(action));
  }

  return NextResponse.json({ logs: logs.slice(0, limit), total: getAuditLogs().length });
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
