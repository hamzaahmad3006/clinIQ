"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmergencyBriefPage() {
  const router = useRouter();
  const [sessionSeconds, setSessionSeconds] = useState(720); // 12 minutes
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [activeQuadrant, setActiveQuadrant] = useState<number | null>(null);

  // Countdown timer for session activity check
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle window focus loss to trigger visual security overlay blur
  useEffect(() => {
    const handleBlur = () => {
      setIsOverlayOpen(true);
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Handle keyboard shortcuts (A to acknowledge, 1-4 to focus quadrants)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "a") {
        alert("All critical flags acknowledged.");
      }
      if (["1", "2", "3", "4"].includes(e.key)) {
        setActiveQuadrant(parseInt(e.key));
      }
    };

    const handleKeyUp = () => {
      // Auto-remove focus rings after timeout
      setTimeout(() => {
        setActiveQuadrant(null);
      }, 1000);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const sessionMinutesLeft = Math.floor(sessionSeconds / 60);

  const handleAcknowledgeAll = () => {
    alert("All critical flags acknowledged.");
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden w-full">
      {/* Top Navigation Bar */}
      <header className="bg-primary text-on-primary flex justify-between items-center w-full px-margin-desktop h-16 fixed top-0 z-50">
        <div className="flex items-center gap-6">
          <span
            onClick={() => router.push("/dashboard")}
            className="text-headline-lg font-headline-lg font-black text-on-primary tracking-tight md:hidden cursor-pointer"
          >
            CLinIQ
          </span>
          <div className="h-8 w-[1px] bg-on-primary/20 md:hidden"></div>
          <div className="flex items-center gap-3 bg-critical/20 px-3 py-1 rounded-sm border border-critical/30 animate-pulse">
            <span className="material-symbols-outlined text-critical" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span className="font-bold text-headline-xl tracking-tighter text-critical">
              EMERGENCY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center bg-primary-container px-4 py-2 rounded border border-outline-variant/20">
            <span className="material-symbols-outlined mr-2 text-on-primary-container">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-body-sm text-on-primary placeholder:text-on-primary-container/50 w-64 focus:outline-none"
              placeholder="Quick Search..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-4">
            <span
              className="material-symbols-outlined text-on-primary hover:bg-primary-container p-2 transition-all cursor-pointer rounded"
              data-icon="notifications"
            >
              notifications
            </span>
            <span
              className="material-symbols-outlined text-on-primary hover:bg-primary-container p-2 transition-all cursor-pointer rounded"
              data-icon="security"
            >
              security
            </span>
            <span
              className={`text-label-xs font-label-xs px-2 py-1 rounded transition-colors duration-300 ${
                sessionMinutesLeft < 5
                  ? "bg-session-warn text-white animate-pulse"
                  : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              ● Session: {sessionMinutesLeft}m
            </span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-on-primary/20">
              <img
                alt="Provider profile avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvDAn7IJV9mQtfd44RE6hwYuLQAH3Tcj0wAR9zl7R5zwBttI1XwKyfAHh7EpABmAGbrlALOOxAkZ69qIJTshfy0acu-RBTXcZnW1DP9ZtBtw1Mp6h-p4kffoGWUXKl_TNzgzL8gSKEAYC0fjD4dMCTfGs10HKE42unBqWQ8Q71pl7tEKci1KOnDsUCRJHeEZViKSl-XEvuTcYYeA2_YOABoczoauYEyVlXjdJlpz0ZkDGAVsw4RoUp_q4B79HIspevYORAnXb47N8"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-expanded bg-navy-800 text-on-primary flex flex-col py-6 pt-20 z-40 hidden md:flex">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-headline-lg text-on-primary">
              Dr. Henderson
            </span>
          </div>
          <div className="text-body-sm opacity-70">On-Call Physician</div>
        </div>

        <nav className="flex-1">
          <div className="px-4 space-y-1">
            <div
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-body-sm">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined">person_search</span>
              <span className="text-body-sm">Patient Search</span>
            </div>
            <div
              onClick={() => router.push("/rounds")}
              className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">assignment</span>
              <span className="text-body-sm">My Rounds</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span className="text-body-sm">AI Briefs</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined">gavel</span>
              <span className="text-body-sm">Security Logs</span>
            </div>
          </div>
        </nav>

        <div className="px-6 mt-auto space-y-4">
          <button className="w-full py-3 bg-break-glass text-on-primary font-bold text-label-xs rounded flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">
              lock_open
            </span>
            Break-Glass Access
          </button>
          <div className="space-y-1 border-t border-on-primary/10 pt-4">
            <div className="flex items-center gap-3 px-4 py-2 text-on-primary-fixed-variant opacity-70 hover:opacity-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">
                settings
              </span>
              <span className="text-label-xs">Settings</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 text-on-primary-fixed-variant opacity-70 hover:opacity-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">
                help
              </span>
              <span className="text-label-xs">Support</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-0 md:ml-sidebar-expanded pt-16 flex-grow flex flex-col relative bg-surface">
        {/* Loading Progress Bar (Progressive Disclosure) */}
        <div className="w-full h-1 bg-surface-container-highest relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-secondary transition-all duration-700 w-4/5"></div>
          <div className="absolute right-margin-desktop top-2 z-10 flex items-center gap-2">
            <span className="text-label-xs font-data-mono text-on-surface-variant bg-surface px-2 rounded-sm shadow-sm border border-outline-variant">
              LOADING SOURCES: 4/5
            </span>
          </div>
        </div>

        {/* Four-Quadrant High-Density Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 h-full p-gutter gap-gutter flex-grow overflow-hidden mb-14 md:mb-0">
          {/* Quadrant 1: Allergies & Intolerances */}
          <section
            className={`bg-critical-bg border-l-4 border-critical p-4 rounded-lg flex flex-col transition-all duration-300 ${
              activeQuadrant === 1 ? "ring-4 ring-critical" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-ui-heading text-ui-heading flex items-center gap-2 text-critical">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
                Allergies &amp; Reactions
              </h2>
              <span className="text-label-xs font-data-mono bg-white/50 px-2 border border-critical/20 rounded-sm">
                <span className="shortcut-key">1</span>Focus
              </span>
            </div>
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
              <div className="bg-white p-3 rounded shadow-sm border border-critical/10 flex justify-between items-start">
                <div>
                  <div className="text-headline-lg font-bold text-critical">
                    PENICILLIN
                  </div>
                  <div className="text-body-sm text-on-surface-variant">
                    Anaphylaxis, Urticaria (Last: 2019)
                  </div>
                </div>
                <span className="material-symbols-outlined text-critical">
                  error
                </span>
              </div>
              <div className="bg-white p-3 rounded shadow-sm border border-critical/10 flex justify-between items-start">
                <div>
                  <div className="text-headline-lg font-bold text-critical">
                    ASPIRIN
                  </div>
                  <div className="text-body-sm text-on-surface-variant">
                    Severe asthma exacerbation
                  </div>
                </div>
                <span className="material-symbols-outlined text-critical">
                  error
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-critical/10 text-label-xs italic opacity-60">
              Verified via National Health Spine • 2m ago
            </div>
          </section>

          {/* Quadrant 2: Critical Flags & Rapid Actions */}
          <section
            className={`bg-high-bg border-l-4 border-high-severity p-4 rounded-lg flex flex-col transition-all duration-300 ${
              activeQuadrant === 2 ? "ring-4 ring-high-severity" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-ui-heading text-ui-heading flex items-center gap-2 text-high-severity">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  priority_high
                </span>
                Critical Clinical Flags
              </h2>
              <span className="text-label-xs font-data-mono bg-white/50 px-2 border border-high-severity/20 rounded-sm">
                <span className="shortcut-key">2</span>Focus
              </span>
            </div>
            <div className="space-y-2 flex-grow overflow-y-auto pr-2">
              <div className="flex items-center gap-3 bg-white p-2 border-l-4 border-high-severity rounded shadow-sm">
                <span className="text-high-severity text-display-2xl font-bold">
                  ▲
                </span>
                <div className="flex-grow">
                  <div className="text-body-base font-bold">DNACPR IN PLACE</div>
                  <div className="text-body-sm text-on-surface-variant">
                    Effective: 12-Oct-2023 • Dr. S. Malloy
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 border-l-4 border-medium-severity rounded shadow-sm">
                <span className="text-medium-severity text-display-2xl font-bold">
                  ◆
                </span>
                <div className="flex-grow">
                  <div className="text-body-base font-bold">
                    FALLS RISK: HIGH
                  </div>
                  <div className="text-body-sm text-on-surface-variant">
                    Recent hip arthroplasty (Left)
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-6 flex gap-3">
              <button
                onClick={handleAcknowledgeAll}
                className="flex-grow bg-primary text-on-primary py-3 rounded font-bold text-body-sm hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="shortcut-key text-on-primary/50">A</span>{" "}
                ACKNOWLEDGE ALL
              </button>
              <button className="bg-surface-container-highest p-3 rounded hover:bg-surface-variant transition-all cursor-pointer border border-outline-variant/10">
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>
          </section>

          {/* Quadrant 3: Active Medications */}
          <section
            className={`bg-medium-bg border-l-4 border-medium-severity p-4 rounded-lg flex flex-col transition-all duration-300 ${
              activeQuadrant === 3 ? "ring-4 ring-medium-severity" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-ui-heading text-ui-heading flex items-center gap-2 text-medium-severity">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  prescriptions
                </span>
                Active Medications
              </h2>
              <span className="text-label-xs font-data-mono bg-white/50 px-2 border border-medium-severity/20 rounded-sm">
                <span className="shortcut-key">3</span>Focus
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-grow">
              <div className="bg-white p-3 border border-medium-severity/20 rounded shadow-sm">
                <div className="text-label-xs text-medium-severity font-bold uppercase tracking-wider">
                  Anticoagulant
                </div>
                <div className="text-headline-lg font-bold">WARFARIN</div>
                <div className="text-body-sm">3mg OD • Target INR 2.5</div>
              </div>
              <div className="bg-white p-3 border border-medium-severity/20 rounded shadow-sm">
                <div className="text-label-xs text-medium-severity font-bold uppercase tracking-wider">
                  Antidiabetic
                </div>
                <div className="text-headline-lg font-bold">METFORMIN</div>
                <div className="text-body-sm">500mg TDS • With Food</div>
              </div>
              <div className="bg-white p-3 border border-medium-severity/20 rounded shadow-sm">
                <div className="text-label-xs text-medium-severity font-bold uppercase tracking-wider">
                  Beta-Blocker
                </div>
                <div className="text-headline-lg font-bold">BISOPROLOL</div>
                <div className="text-body-sm">2.5mg OD • Pulse &gt; 55</div>
              </div>
              <div className="bg-white p-3 border border-medium-severity/20 rounded shadow-sm">
                <div className="text-label-xs text-medium-severity font-bold uppercase tracking-wider">
                  Statin
                </div>
                <div className="text-headline-lg font-bold">ATORVASTATIN</div>
                <div className="text-body-sm">40mg ON • Regular Use</div>
              </div>
            </div>
          </section>

          {/* Quadrant 4: Conditions & Lab Trends */}
          <section
            className={`bg-low-bg border-l-4 border-low-severity p-4 rounded-lg flex flex-col transition-all duration-300 ${
              activeQuadrant === 4 ? "ring-4 ring-low-severity" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-ui-heading text-ui-heading flex items-center gap-2 text-on-surface">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  clinical_notes
                </span>
                Conditions &amp; Labs
              </h2>
              <span className="text-label-xs font-data-mono bg-white/50 px-2 border border-outline-variant rounded-sm">
                <span className="shortcut-key">4</span>Focus
              </span>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
              <div className="flex flex-wrap gap-2">
                <span className="bg-surface-container-highest px-3 py-1 rounded-full text-body-sm font-bold">
                  T2DM
                </span>
                <span className="bg-surface-container-highest px-3 py-1 rounded-full text-body-sm font-bold">
                  CKD Stage 3
                </span>
                <span className="bg-surface-container-highest px-3 py-1 rounded-full text-body-sm font-bold">
                  Hypercholesterolemia
                </span>
              </div>
              <div className="bg-white border border-outline-variant p-4 rounded space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-label-xs text-on-surface-variant font-bold uppercase">
                      Serum Creatinine
                    </div>
                    <div className="text-display-2xl font-headline-xl text-critical flex items-center gap-2">
                      142{" "}
                      <span className="text-headline-lg font-bold">
                        μmol/L
                      </span>
                      <span className="material-symbols-outlined">
                        trending_up
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-label-xs text-on-surface-variant">
                      eGFR
                    </div>
                    <div className="text-headline-lg font-bold text-high-severity">
                      48
                    </div>
                  </div>
                </div>
                <div className="h-10 w-full bg-surface-container-low rounded-sm relative overflow-hidden flex items-end px-1 gap-1">
                  <div className="flex-grow bg-on-surface-variant/20 h-[60%] rounded-t-sm"></div>
                  <div className="flex-grow bg-on-surface-variant/20 h-[55%] rounded-t-sm"></div>
                  <div className="flex-grow bg-on-surface-variant/20 h-[65%] rounded-t-sm"></div>
                  <div className="flex-grow bg-on-surface-variant/20 h-[75%] rounded-t-sm"></div>
                  <div className="flex-grow bg-critical h-[100%] rounded-t-sm"></div>
                </div>
              </div>
            </div>

            {/* Compliance Notice / Locked Data */}
            <div className="mt-auto pt-4">
              <div className="bg-access-bg border border-access-denied/20 p-3 rounded-lg flex gap-3 items-center">
                <span className="material-symbols-outlined text-access-denied">
                  lock
                </span>
                <div className="flex-grow">
                  <div className="text-label-xs font-bold text-access-denied uppercase">
                    Security Policy Constraint
                  </div>
                  <div className="text-body-sm text-access-denied">
                    T3-T5 Records (Psychiatric, Sexual Health) are currently
                    blocked.
                  </div>
                </div>
                <button className="text-label-xs font-bold text-access-denied border-b border-access-denied/30 cursor-pointer hover:text-red-700 transition-colors">
                  REQUEST OVERRIDE
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* PHI Protection Overlay (Hidden by default, shown on blur) */}
        {isOverlayOpen && (
          <div
            className="absolute inset-0 bg-phi-mask-overlay z-[100] flex flex-col items-center justify-center backdrop-blur-md"
            id="phi-overlay"
          >
            <div className="text-white text-center">
              <span className="material-symbols-outlined text-[64px] mb-4">
                visibility_off
              </span>
              <div className="text-display-2xl font-headline-xl">
                PHI MASKED
              </div>
              <div className="text-body-base opacity-70">
                Focus lost. Re-authenticate or click to reveal.
              </div>
              <button
                className="mt-8 px-8 py-3 bg-secondary text-white rounded font-bold hover:brightness-110 transition-all cursor-pointer"
                onClick={() => setIsOverlayOpen(false)}
              >
                RESUME SESSION
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar (Mobile Status Indicators) */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 h-14 bg-surface-container-highest border-t border-outline-variant z-45">
        <div className="flex flex-col items-center justify-center text-primary font-bold">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <span className="text-label-xs">Critical</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined">warning</span>
          <span className="text-label-xs">High</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined">diamond</span>
          <span className="text-label-xs">Medium</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined">fiber_manual_record</span>
          <span className="text-label-xs">Low</span>
        </div>
      </footer>
    </div>
  );
}
