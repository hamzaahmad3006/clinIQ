import { NextResponse } from "next/server";
import { generateBriefsForWard, createAuditLog } from "@/lib/mockDb";
import { generateWardRoundSummary } from "@/lib/llm";
import { getConfig } from "@/lib/configStore";

export async function POST() {
  const config = getConfig();
  const beds = generateBriefsForWard();

  createAuditLog({
    actorId: config.currentClinicianId,
    actorName: config.currentClinicianName,
    actorRole: config.currentClinicianRole,
    action: "briefs.generated",
    resourceType: "ward_round",
    resourceId: "ward-4b",
    patientId: null,
    accessResult: "granted",
    sensitivityTier: null,
  });

  // Attempt LLM-powered ward summary
  const llmResult = await generateWardRoundSummary(
    "Ward 4B — General Medicine",
    beds.map((b: { bed: string; patientName: string; age: number; overnightChanges: string[]; flagSeverity: string }) => ({
      bed: b.bed,
      patientName: b.patientName,
      age: b.age,
      overnightChanges: b.overnightChanges,
      flagSeverity: b.flagSeverity,
    })),
    { apiKey: config.groqApiKey || process.env.GROQ_API_KEY }
  );

  return NextResponse.json({ beds, summary: llmResult.summary, model: llmResult.model, generated: true });
}
