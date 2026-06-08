import { NextRequest, NextResponse } from "next/server";
import { createAuditLog } from "@/lib/mockDb";
import { generatePatientBrief } from "@/lib/llm";
import { getConfig } from "@/lib/configStore";

export async function POST(request: NextRequest) {
  const { patientId, patientData } = await request.json();
  const config = getConfig();

  if (!patientData) {
    return NextResponse.json({ error: "Patient data required" }, { status: 400 });
  }

  const result = await generatePatientBrief(patientData, {
    apiKey: config.groqApiKey || process.env.GROQ_API_KEY,
  });

  await createAuditLog({
    actorId: config.currentClinicianId,
    actorName: config.currentClinicianName,
    actorRole: config.currentClinicianRole,
    action: "brief.generated",
    resourceType: "patient_brief",
    resourceId: patientId || "unknown",
    patientId,
    accessResult: "granted",
    sensitivityTier: 2,
  });

  return NextResponse.json({ brief: result.brief, model: result.model });
}
