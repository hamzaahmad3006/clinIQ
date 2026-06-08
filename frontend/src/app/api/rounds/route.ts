import { NextResponse } from "next/server";
import { getWardBeds, getOvernightEvents, getClinicalFlags } from "@/lib/mockDb";

export async function GET() {
  const beds = await getWardBeds();
  const events = await getOvernightEvents();
  const flags = await getClinicalFlags();

  return NextResponse.json({
    beds,
    events,
    flags,
    stats: {
      totalBeds: 14,
      occupiedBeds: beds.length,
      criticalFlags: flags.filter((f) => f.severity === "critical" && !f.acknowledgedBy).length,
      highFlags: flags.filter((f) => f.severity === "high" && !f.acknowledgedBy).length,
    },
  });
}
