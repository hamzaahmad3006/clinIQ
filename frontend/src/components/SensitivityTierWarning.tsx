"use client";

import React, { useState } from "react";

interface SensitivityTierWarningProps {
  title: string;
  description: string;
  onAuthorizationGranted: () => void;
}

export function SensitivityTierWarning({
  title,
  description,
  onAuthorizationGranted,
}: SensitivityTierWarningProps) {
  const [loading, setLoading] = useState(false);

  const handleAuthorize = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier3Authorized: true }),
      });

      if (res.ok) {
        onAuthorizationGranted();
      } else {
        alert("Failed to authorize Tier 3 access. Please check permissions.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to authorize access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-tier3-bg border-l-4 border-tier3-warn p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-r-lg shadow-sm">
      <div className="flex items-start gap-3 text-tier3-warn">
        <span className="material-symbols-outlined mt-0.5" data-icon="visibility_off">
          visibility_off
        </span>
        <div>
          <h4 className="font-ui-heading text-body-base font-bold leading-tight">
            {title}
          </h4>
          <p className="text-body-sm opacity-85 mt-1 leading-snug">
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={handleAuthorize}
        disabled={loading}
        className="bg-tier3-warn text-white px-5 py-2 rounded text-label-xs font-bold border border-tier3-warn/20 cursor-pointer active:scale-95 transition-all hover:bg-opacity-90 disabled:opacity-50 shrink-0 self-start sm:self-center"
      >
        {loading ? "Authorizing..." : "Request Access"}
      </button>
    </div>
  );
}
