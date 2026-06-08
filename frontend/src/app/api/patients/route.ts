import { NextResponse } from "next/server";
import { getPatients, getEncounters, getClinicalFlags } from "@/lib/mockDb";

export async function GET() {
  const patients = await getPatients();
  const encounters = await getEncounters();
  const flags = await getClinicalFlags();

  return NextResponse.json({
    patients,
    encounters,
    flags,
    stats: {
      todayEncounters: encounters.length,
      briefsReady: encounters.filter((e) => e.briefStatus === "ready").length,
      briefsPercentage: Math.round(
        (encounters.filter((e) => e.briefStatus === "ready").length / encounters.length) * 100
      ),
      activeFlags: flags.filter((f) => !f.acknowledgedBy).length,
      criticalFlags: flags.filter((f) => f.severity === "critical" && !f.acknowledgedBy).length,
      highFlags: flags.filter((f) => f.severity === "high" && !f.acknowledgedBy).length,
    },
  });
}
