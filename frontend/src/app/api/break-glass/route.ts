import { NextRequest, NextResponse } from "next/server";
import { createBreakGlassEvent, getPatientById } from "@/lib/mockDb";
import { getConfig } from "@/lib/configStore";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, justification } = body;

  if (!justification || justification.length < 20) {
    return NextResponse.json({ error: "Justification must be at least 20 characters" }, { status: 400 });
  }

  const patient = await getPatientById(patientId);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const config = getConfig();

  const result = await createBreakGlassEvent(
    config.currentClinicianId,
    config.currentClinicianName,
    patientId,
    patient.name,
    justification
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 429 });
  }

  return NextResponse.json({ event: result, patientName: patient.name }, { status: 201 });
}
