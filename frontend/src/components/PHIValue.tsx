"use client";

import React, { useState } from "react";

interface PHIValueProps {
  children: string;
  type: "nhs" | "dob" | "name" | "text";
  patientId?: string;
  patientName?: string;
}

export function PHIValue({ children, type, patientId, patientName }: PHIValueProps) {
  const [revealed, setRevealed] = useState(false);

  const raw = String(children);

  let masked = raw;
  if (type === "nhs") {
    const lastTwo = raw.replace(/\D/g, "").slice(-2);
    masked = `*** *** **${lastTwo || "XX"}`;
  } else if (type === "dob") {
    // Try to extract year, e.g., "12 March 1958" or "1958-03-12"
    const match = raw.match(/\d{4}/);
    const year = match ? match[0] : "YYYY";
    masked = `** ** ${year}`;
  }

  const logReveal = async () => {
    if (!patientId) return;
    try {
      await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "clin-henderson-001",
          actorName: "Dr. Henderson",
          actorRole: "specialist",
          action: `phi.${type}.revealed`,
          resourceType: "patient_brief",
          resourceId: patientId,
          patientId: patientId,
          accessResult: "granted",
          sensitivityTier: 2,
          metadata: {
            patientName: patientName || "Unknown",
          },
        }),
      });
    } catch (err) {
      console.error("Failed to log PHI reveal:", err);
    }
  };

  const handleRevealStart = () => {
    setRevealed(true);
    logReveal();
  };

  const handleRevealEnd = () => {
    setRevealed(false);
  };

  if (type === "nhs" || type === "dob") {
    return (
      <span
        onMouseDown={handleRevealStart}
        onMouseUp={handleRevealEnd}
        onMouseLeave={handleRevealEnd}
        onTouchStart={handleRevealStart}
        onTouchEnd={handleRevealEnd}
        className="text-data-mono cursor-help select-none transition-all duration-150 px-1 rounded-sm border border-transparent hover:border-amber-300 font-bold bg-amber-50/20 text-on-surface"
        style={{
          backgroundColor: revealed ? "#FEF3C7" : "rgba(254, 243, 199, 0.1)",
          color: revealed ? "#B45309" : "inherit",
        }}
        title="Click and hold to reveal"
      >
        {revealed ? raw : masked}
      </span>
    );
  }

  // Otherwise, just a standard text span that can be subject to the global blur
  return <span className="phi-text-content">{children}</span>;
}
