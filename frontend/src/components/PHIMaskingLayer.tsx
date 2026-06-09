"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PHIMaskingLayer() {
  const pathname = usePathname();
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setIsOverlayVisible(false);
      document.body.classList.remove("phi-mask-active");
      return;
    }

    const handleBlur = () => {
      document.body.classList.add("phi-mask-active");
      setIsOverlayVisible(true);
    };

    const handleFocus = () => {
      document.body.classList.remove("phi-mask-active");
      setIsOverlayVisible(false);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // Initial check (in case app loaded in background)
    if (!document.hasFocus()) {
      handleBlur();
    }

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.body.classList.remove("phi-mask-active");
    };
  }, [pathname]);

  if (!isOverlayVisible || pathname === "/login") return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.85)] backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white p-8 text-center"
      id="phi-overlay"
      style={{ pointerEvents: "all" }}
    >
      <div className="max-w-md bg-navy-800 p-8 rounded-2xl border-2 border-white/20 shadow-2xl flex flex-col items-center">
        <span className="material-symbols-outlined text-[64px] mb-4 text-secondary-container" data-icon="lock">
          lock
        </span>
        <h2 className="text-display-2xl font-headline-xl mb-4">
          PHI Protected View
        </h2>
        <p className="text-body-base opacity-80 mb-8">
          Clinical data is hidden while window focus is lost to prevent
          unauthorized patient identification in accordance with clinical
          security protocols.
        </p>
        <button
          className="px-8 py-3 bg-secondary text-white rounded-lg font-bold hover:scale-105 transition-transform cursor-pointer active:scale-95"
          onClick={() => {
            window.focus();
            setIsOverlayVisible(false);
            document.body.classList.remove("phi-mask-active");
          }}
        >
          Resume Session
        </button>
      </div>
    </div>
  );
}
