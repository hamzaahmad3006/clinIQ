"use client";

import React, { useState, useEffect } from "react";

interface BreakGlassActiveBannerProps {
  expiresAt: string;
}

export function BreakGlassActiveBanner({ expiresAt }: BreakGlassActiveBannerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="bg-amber-50 border-y-2 border-amber-300 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-amber-900 shadow-inner">
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-[28px] text-amber-700 animate-pulse"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          warning
        </span>
        <div>
          <p className="font-bold text-body-sm text-amber-900 leading-tight">
            EMERGENCY BREAK-GLASS OVERRIDE ACTIVE
          </p>
          <p className="text-label-xs text-amber-800 leading-tight">
            Access level: T1 + T2 records only. T3-T5 sensitive records remain blocked.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-amber-200/50 border border-amber-300 px-4 py-1.5 rounded-lg">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">
          Expires In:
        </span>
        <span className="font-data-mono font-bold text-body-sm text-amber-800">
          {timeLeft}
        </span>
      </div>
    </div>
  );
}
