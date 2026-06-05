"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const SESSION_DURATION = 900;
const WARNING_THRESHOLD = 120;

export function useSession() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION);
  const [showWarning, setShowWarning] = useState(false);

  const resetTimer = useCallback(() => {
    setSecondsLeft(SESSION_DURATION);
    setShowWarning(false);
  }, []);

  useEffect(() => {
    const handleActivity = () => resetTimer();
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [resetTimer]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          fetch("/api/audit-logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actorId: "system",
              actorName: "System",
              actorRole: "system",
              action: "auth.session_timeout",
              resourceType: "session",
              resourceId: `sess-${Date.now()}`,
              patientId: null,
              accessResult: "denied",
              sensitivityTier: null,
            }),
          }).finally(() => router.push("/login"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= WARNING_THRESHOLD && secondsLeft > 0) {
      setShowWarning(true);
    }
  }, [secondsLeft]);

  const minutesLeft = Math.floor(secondsLeft / 60);

  return {
    minutesLeft,
    secondsLeft,
    showWarning,
    resetTimer,
    isWarning: secondsLeft <= WARNING_THRESHOLD && secondsLeft > 0,
  };
}
