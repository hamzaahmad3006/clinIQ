import { NextResponse } from "next/server";
import { generateBriefsForWard, createAuditLog } from "@/lib/mockDb";

export async function POST() {
  const beds = generateBriefsForWard();

  createAuditLog({
    actorId: "clin-henderson-001",
    actorName: "Dr. Henderson",
    actorRole: "specialist",
    action: "briefs.generated",
    resourceType: "ward_round",
    resourceId: "ward-4b",
    patientId: null,
    accessResult: "granted",
    sensitivityTier: null,
  });

  return NextResponse.json({ beds, generated: true });
}
