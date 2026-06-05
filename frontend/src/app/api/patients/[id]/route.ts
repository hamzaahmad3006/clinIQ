import { NextResponse } from "next/server";
import { getPatientDetail, getClinicalFlagsByPatient, createAuditLog } from "@/lib/mockDb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patient = getPatientDetail(id);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const flags = getClinicalFlagsByPatient(id);

  // Write access audit log
  createAuditLog({
    actorId: "clin-henderson-001",
    actorName: "Dr. Henderson",
    actorRole: "specialist",
    action: "phi.brief.viewed",
    resourceType: "patient_brief",
    resourceId: id,
    patientId: id,
    accessResult: "granted",
    sensitivityTier: 2,
  });

  return NextResponse.json({ patient, flags });
}
