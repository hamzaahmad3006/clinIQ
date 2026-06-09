import { NextResponse } from "next/server";
import {
  getPatientDetail,
  getClinicalFlagsByPatient,
  createAuditLog,
  resolvePatientId,
  verifyTreatmentRelationship,
  filterPatientByTier,
  getActiveBreakGlass,
} from "@/lib/mockDb";
import { getConfig } from "@/lib/configStore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const internalId = await resolvePatientId(id);

  if (!internalId) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const config = getConfig();

  const trv = await verifyTreatmentRelationship(config.currentClinicianId, internalId);
  if (!trv.allowed) {
    await createAuditLog({
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

  const patient = await getPatientDetail(internalId);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const flags = await getClinicalFlagsByPatient(internalId);

  // Filter by sensitivity tier
  const { patient: filteredPatient, blockedTiers } = filterPatientByTier(patient, config.tier3Authorized ?? false);

  // Log tier blocking
  if (blockedTiers.length > 0) {
    await createAuditLog({
      actorId: config.currentClinicianId,
      actorName: config.currentClinicianName,
      actorRole: config.currentClinicianRole,
      action: "phi.tier_restricted",
      resourceType: "patient_brief",
      resourceId: id,
      patientId: internalId,
      accessResult: "granted",
      sensitivityTier: blockedTiers[0],
    });
  }

  await createAuditLog({
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

  const activeBreakGlass = await getActiveBreakGlass(config.currentClinicianId, internalId);

  return NextResponse.json({ patient: filteredPatient, flags, blockedTiers, activeBreakGlass });
}
