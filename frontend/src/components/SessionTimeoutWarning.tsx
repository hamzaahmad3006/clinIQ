"use client";

import React from "react";
import { useSession } from "@/lib/useSession";
import { useClinician } from "@/lib/useClinician";
import { setAuth } from "@/lib/useAuth";
import { useRouter, usePathname } from "next/navigation";

export function SessionTimeoutWarning() {
  const pathname = usePathname();
  const router = useRouter();
  const clinician = useClinician();
  const { secondsLeft, showWarning, resetTimer } = useSession();

  const handleLogout = async () => {
    try {
      await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: clinician.id,
          actorName: clinician.name,
          actorRole: clinician.role,
          action: "auth.logout.manual",
          resourceType: "session",
          resourceId: `sess-${Date.now()}`,
          patientId: null,
          accessResult: "granted",
          sensitivityTier: null,
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setAuth(false);
    resetTimer();
    router.push("/login");
  };

  if (!showWarning || pathname === "/login") return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
      style={{ pointerEvents: "all" }}
    >
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-md w-full p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <span
            className="material-symbols-outlined text-[48px] text-session-warn animate-pulse"
            data-icon="hourglass_empty"
          >
            hourglass_empty
          </span>
          <h2 className="text-headline-xl font-headline-xl text-on-surface">
            Session Expiring
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Due to inactivity, your secure ClinIQ session will expire soon. To protect
            patient PHI, you will be logged out automatically.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded text-center">
          <p className="text-label-xs text-session-warn uppercase font-bold tracking-wider">
            Time Remaining
          </p>
          <p className="text-display-3xl font-bold text-session-warn mt-1">
            {Math.floor(secondsLeft / 60)}:
            {String(secondsLeft % 60).padStart(2, "0")}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 border border-outline-variant py-3 rounded-lg font-bold text-body-sm hover:bg-surface-variant transition-all cursor-pointer"
          >
            Logout Now
          </button>
          <button
            onClick={resetTimer}
            className="flex-1 bg-secondary text-white py-3 rounded-lg font-bold text-body-sm hover:opacity-90 transition-all cursor-pointer"
          >
            Resume Session
          </button>
        </div>
      </div>
    </div>
  );
}
