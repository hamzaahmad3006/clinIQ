import { NextResponse } from "next/server";
import {
  getPatientDetail,
  getClinicalFlagsByPatient,
  createAuditLog,
  resolvePatientId,
  verifyTreatmentRelationship,
} from "@/lib/mockDb";
import { getConfig } from "@/lib/configStore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const internalId = resolvePatientId(id);

  if (!internalId) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const config = getConfig();

  const trv = verifyTreatmentRelationship(config.currentClinicianId, internalId);
  if (!trv.allowed) {
    createAuditLog({
      actorId: config.currentClinicianId,
      actorName: config.currentClinicianName,
      actorRole: config.currentClinicianRole,
      action: "phi.access_denied.no_treatment_relationship",
      resourceType: "patient_brief",
      resourceId: id,
      patientId: internalId,
      accessResult: "denied",
      sensitivityTier: null,
    });
    return NextResponse.json(
      { error: "Access denied", reason: trv.reason, canBreakGlass: true },
      { status: 403 }
    );
  }

  const patient = getPatientDetail(internalId);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const flags = getClinicalFlagsByPatient(internalId);

  createAuditLog({
    actorId: config.currentClinicianId,
    actorName: config.currentClinicianName,
    actorRole: config.currentClinicianRole,
    action: "phi.brief.viewed",
    resourceType: "patient_brief",
    resourceId: id,
    patientId: internalId,
    accessResult: "granted",
    sensitivityTier: 2,
  });

  return NextResponse.json({ patient, flags });
}
