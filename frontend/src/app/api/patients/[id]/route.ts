import { NextResponse } from "next/server";
import { getPatientDetail, getClinicalFlagsByPatient, createAuditLog, resolvePatientId } from "@/lib/mockDb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const internalId = resolvePatientId(id);

  if (!internalId) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const patient = getPatientDetail(internalId);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const flags = getClinicalFlagsByPatient(internalId);

  // Write access audit log — use opaque resource ID
  createAuditLog({
    actorId: "clin-henderson-001",
    actorName: "Dr. Henderson",
    actorRole: "specialist",
    action: "phi.brief.viewed",
    resourceType: "patient_brief",
    resourceId: id,          // opaque ID in logs, not internal
    patientId: internalId,
    accessResult: "granted",
    sensitivityTier: 2,
  });

  return NextResponse.json({ patient, flags });
}
