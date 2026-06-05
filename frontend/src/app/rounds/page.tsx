"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";

interface RoundsData {
  beds: {
    bed: string; patientId: string; patientName: string; age: number;
    gender: string; briefStatus: string; overnightChanges: string[];
    overnightDetail: string; flagCount: number; flagSeverity: string;
  }[];
  events: {
    patientName: string; bed: string; time: string; severity: string;
    title: string; description: string;
  }[];
  flags: { id: string; severity: string; acknowledgedBy: string | null }[];
  stats: { totalBeds: number; occupiedBeds: number; criticalFlags: number; highFlags: number };
}

const opaqueIdMap: Record<string, string> = {
  "j-patel": "enc_a7f3b9c2",
  "m-alfarsi": "enc_b8d4e0f3",
  "s-khan": "enc_c9e5f1a4",
  "t-okonkwo": "enc_d0f6a2b5",
  "r-singh": "enc_e1a7b3c6",
  "m-davies": "enc_f2b8c4d7",
};

export default function WardRoundPage() {
  const router = useRouter();
  const { minutesLeft, isWarning } = useSession();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [generateState, setGenerateState] = useState<"idle" | "processing" | "ready">("idle");
  const [data, setData] = useState<RoundsData | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rounds")
      .then((res) => res.json())
      .then(setData);
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

  // Trigger briefs generation via API
  const handleGenerateBriefs = async () => {
    if (generateState !== "idle") return;
    setGenerateState("processing");
    const res = await fetch("/api/rounds/generate", { method: "POST" });
    const result = await res.json();
    setData((prev) => (prev ? { ...prev, beds: result.beds } : prev));
    setAiSummary(result.summary);
    setAiModel(result.model);
    setGenerateState("ready");
    setTimeout(() => setGenerateState("idle"), 3000);
  };

  const openPatientBrief = (patientId: string) => {
    router.push(`/patient/${patientId}`);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex w-full">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-expanded bg-navy-800 text-on-primary flex flex-col py-6 z-40 hidden md:flex">
        <div className="px-6 mb-10 pt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-navy-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary-fixed">
                clinical_notes
              </span>
            </div>
            <div>
              <div className="text-on-primary text-body-sm font-bold">
                Dr. Henderson
              </div>
              <div className="text-label-xs font-label-xs opacity-70">
                On-Call Physician
              </div>
            </div>
          </div>
          <button className="w-full py-3 px-4 bg-break-glass-bg border-2 border-break-glass text-break-glass text-label-xs font-bold rounded-lg hover:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]" data-icon="gavel">
              gavel
            </span>
            BREAK-GLASS ACCESS
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <a
            className="flex items-center gap-4 px-6 py-4 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push("/dashboard");
            }}
          >
            <span className="material-symbols-outlined" data-icon="dashboard">
              dashboard
            </span>
            Dashboard
          </a>
          <a
            className="flex items-center gap-4 px-6 py-4 bg-navy-700 text-on-primary border-l-4 border-secondary-container text-body-sm font-bold"
            href="#"
          >
            <span className="material-symbols-outlined" data-icon="assignment">
              assignment
            </span>
            My Rounds
          </a>
          <a
            className="flex items-center gap-4 px-6 py-4 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm"
            href="#"
          >
            <span className="material-symbols-outlined" data-icon="person_search">
              person_search
            </span>
            Patient Search
          </a>
          <a
            className="flex items-center gap-4 px-6 py-4 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm"
            href="#"
          >
            <span className="material-symbols-outlined" data-icon="auto_awesome">
              auto_awesome
            </span>
            AI Briefs
          </a>
        </nav>

        <div className="mt-auto px-6 space-y-4">
          <div className="p-3 bg-navy-700/50 rounded-xl">
            <div className="text-label-xs font-bold text-secondary-fixed-dim mb-2 uppercase tracking-wider">
              Ward 4B Coverage
            </div>
            <div className="flex items-center justify-between text-label-xs">
                  <span className="opacity-70">Patients</span>
                  <span>{data?.stats.occupiedBeds ?? "—"} / {data?.stats.totalBeds ?? "—"}</span>
                </div>
                <div className="w-full bg-navy-900 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-secondary-fixed h-full" style={{ width: `${data ? (data.stats.occupiedBeds / data.stats.totalBeds) * 100 : 85}%` }}></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-4 border-t border-navy-700">
            <a
              className="flex items-center gap-3 text-label-xs opacity-70 hover:opacity-100 transition-all"
              href="/settings"
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="settings">
                settings
              </span>
              Settings
            </a>
            <a
              className="flex items-center gap-3 text-label-xs opacity-70 hover:opacity-100 transition-all"
              href="#"
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="help">
                help
              </span>
              Support
            </a>
          </div>
        </div>
      </aside>

      <div className="flex-grow md:pl-sidebar-expanded flex flex-col min-h-screen w-full">
        {/* TopNavBar */}
        <header className="bg-primary text-on-primary fixed top-0 z-50 flex justify-between items-center w-full px-8 h-16">
          <div className="flex items-center gap-6">
            <h1 className="text-headline-lg font-headline-lg font-black text-on-primary tracking-tight md:hidden">
              CLinIQ
            </h1>
            <div className="hidden md:flex items-center gap-4 ml-8">
              <span className="text-label-xs font-label-xs text-on-primary border-b-2 border-secondary h-16 flex items-center px-4 transition-all font-bold">
                Ward View
              </span>
              <span
                onClick={() => router.push("/dashboard")}
                className="text-label-xs font-label-xs text-on-primary-container h-16 flex items-center px-4 hover:bg-primary-container transition-colors duration-200 cursor-pointer"
              >
                Patient Search
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-navy-800 px-3 py-1 rounded-full border border-outline/20">
              <span
                className={`material-symbols-outlined text-[16px] transition-colors duration-300 ${
                  isWarning ? "text-critical" : "text-high-severity"
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                fiber_manual_record
              </span>
              <span className="text-label-xs font-label-xs text-on-primary">
                ● Session: {minutesLeft}m
              </span>
            </div>

            <div className="flex gap-4">
              <span
                className="material-symbols-outlined hover:bg-primary-container p-2 rounded cursor-pointer transition-colors"
                data-icon="notifications"
              >
                notifications
              </span>
              <span
                className="material-symbols-outlined hover:bg-primary-container p-2 rounded cursor-pointer transition-colors"
                data-icon="security"
              >
                security
              </span>
            </div>

            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
              <img
                alt="Provider profile avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsnEGoF41MGEZM_1_5oAq6mwjttlzeH2A9bhGuz7wZpxmknSHzWRb8YiaftDeFn5K6bjXDYs6b1sHx8NWkQqPjH1zXrwGw_DKo8Uz8O3aONqWAh4js4KjXtQfUc122pojgCQct0zMvZwQ4wkIRDR9QSPTr_1KTPGLchCZSLM4NZ-koMFvFEWfJHAROmAuiOSRIEyrwepB-pN9XbOw_XwHz4cLwXMvhWelMLrBQEo0bM9pgw06VxrSM4rJ5otx9UZ9I8Sts5eHnWPI"
              />
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="pt-16 pb-20 md:pb-8 min-h-screen w-full">
          {/* Ward Round Header */}
          <div className="px-8 py-6 bg-white border-b border-outline-variant flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-label-xs text-on-surface-variant mb-2">
                <span>Medical Ward List</span>
                <span className="material-symbols-outlined text-[12px]">
                  chevron_right
                </span>
                <span className="text-primary font-bold">Ward 4B</span>
              </nav>
              <div className="flex items-center gap-4">
                <h2 className="text-display-2xl font-headline-xl text-primary">
                  Ward 4B — General Medicine
                </h2>
                <span className="px-3 py-1 bg-surface-container-highest text-on-surface font-data-mono text-label-xs rounded-lg border border-outline-variant">
                  Round: 08:00
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4 hidden lg:block">
                <div className="text-label-xs text-on-surface-variant">
                  Last Synchronized
                </div>
                <div className="text-body-sm font-data-mono font-bold">
                  {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>

              {generateState === "idle" && (
                <button
                  onClick={handleGenerateBriefs}
                  className="bg-primary text-on-primary px-6 py-3 rounded-lg text-body-sm font-bold hover:scale-95 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined" data-icon="bolt">
                    bolt
                  </span>
                  Generate All Briefs
                </button>
              )}

              {generateState === "processing" && (
                <button className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-lg text-body-sm font-bold flex items-center gap-2 shadow-sm cursor-wait">
                  <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'wght' 700" }}>
                    sync
                  </span>
                  Processing...
                </button>
              )}

              {generateState === "ready" && (
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg text-body-sm font-bold flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined">
                    check
                  </span>
                  Briefs Ready
                </button>
              )}
            </div>
          </div>

          <div className="p-8 grid grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
            {/* Ward Table (Bento Primary) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                  <span className="text-label-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Assigned Ward Capacity: 14 Beds
                  </span>
                  <div className="flex items-center gap-2 text-label-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-critical"></span>{" "}
                      Critical
                    </span>
                    <span className="flex items-center gap-1 ml-4">
                      <span className="w-2 h-2 rounded-full bg-high-severity"></span>{" "}
                      High
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left text-label-xs font-bold text-on-surface-variant bg-surface-container-low border-b border-outline-variant uppercase">
                        <th className="px-4 py-3">Bed</th>
                        <th className="px-4 py-3">Patient</th>
                        <th className="px-4 py-3">Brief Status</th>
                        <th className="px-4 py-3">Overnight Changes</th>
                        <th className="px-4 py-3">Flags</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm">
                      {data?.beds.map((bed) => (
                        <tr
                          key={bed.bed}
                          className={`border-b border-outline-variant hover:bg-surface-container-lowest transition-colors ${
                            bed.flagSeverity === "critical" ? "border-l-4 border-l-critical" :
                            bed.flagSeverity === "high" ? "border-l-4 border-l-high-severity" : ""
                          }`}
                        >
                          <td className="px-4 py-4 font-data-mono text-primary font-bold">
                            {bed.bed}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold">{bed.patientName}</div>
                            <div className="text-label-xs text-on-surface-variant">
                              {bed.age}y / {bed.gender}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {bed.briefStatus === "ready" ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-medium-bg text-medium-severity rounded font-bold text-label-xs">
                                <span className="material-symbols-outlined text-[14px]">
                                  check_circle
                                </span>
                                Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded font-bold text-label-xs">
                                <span className="material-symbols-outlined text-[14px] animate-spin">
                                  refresh
                                </span>
                                Syncing
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {bed.overnightChanges.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {bed.overnightChanges.map((ch, i) => (
                                  <span key={i} className="text-on-error font-bold bg-error px-1.5 py-0.5 rounded text-[10px] w-fit">
                                    {ch}
                                  </span>
                                ))}
                                {bed.overnightDetail && (
                                  <span className="text-on-surface-variant text-[11px]">
                                    {bed.overnightDetail}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-on-surface-variant italic text-[11px]">
                                {bed.overnightDetail || "No significant change"}
                              </span>
                            )}
                          </td>
                          <td className={`px-4 py-4 font-bold ${
                            bed.flagSeverity === "critical" ? "text-critical" :
                            bed.flagSeverity === "high" ? "text-high-severity" :
                            bed.flagSeverity === "none" ? "text-low-severity" :
                            "text-medium-severity"
                          }`}>
                            {bed.flagCount > 0 ? `●${bed.flagCount}` : "·"}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => openPatientBrief(bed.patientId)}
                              className="p-2 hover:bg-surface-container-high rounded-full transition-all cursor-pointer"
                            >
                              <span
                                className="material-symbols-outlined"
                                data-icon="arrow_forward"
                              >
                                arrow_forward
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Overnight Changes Feed (Side Panel) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-navy-900 text-white rounded-xl border border-white/10 shadow-xl flex flex-col h-full max-h-[700px]">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-headline-lg font-headline-lg">
                      Overnight Changes
                    </h3>
                    <span className="text-label-xs px-2 py-0.5 bg-error text-on-error rounded font-bold">
                      {data?.events.length ?? "—"} NEW EVENTS
                    </span>
                  </div>
                  <p className="text-label-xs opacity-70">
                    Automated summary from 22:00 to 07:30.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                  {data?.events.map((evt, i) => (
                    <div
                      key={i}
                      className={`relative pl-6 border-l-2 ${
                        evt.severity === "critical" ? "border-critical" :
                        evt.severity === "high" ? "border-high-severity" :
                        "border-outline/30"
                      }`}
                    >
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-navy-900 ${
                        evt.severity === "critical" ? "bg-critical" :
                        evt.severity === "high" ? "bg-high-severity" :
                        "bg-outline"
                      }`}></div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-body-sm font-bold">
                          {evt.patientName} ({evt.bed})
                        </span>
                        <span className="text-label-xs font-data-mono opacity-50">
                          {evt.time}
                        </span>
                      </div>
                      <div className="p-3 bg-navy-800 rounded-lg border border-white/5">
                        <div className={`text-label-xs font-bold mb-1 ${
                          evt.severity === "critical" ? "text-critical" :
                          evt.severity === "high" ? "text-high-severity" :
                          "text-on-primary-container"
                        }`}>
                          {evt.title}
                        </div>
                        <p className="text-body-sm opacity-90 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-navy-800/50 text-center">
                  <button className="text-label-xs font-bold text-secondary-fixed-dim hover:underline flex items-center justify-center gap-2 w-full cursor-pointer">
                    VIEW FULL SHIFT HANDOVER
                    <span className="material-symbols-outlined text-[16px]">
                      open_in_new
                    </span>
                  </button>
                </div>
              </div>

              {aiSummary && (
                <div className="col-span-12 bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline-lg text-headline-lg flex items-center gap-2 text-indigo-800">
                      <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
                      AI Ward Summary
                    </h3>
                    {aiModel && (
                      <span className="text-label-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-data-mono">
                        {aiModel}
                      </span>
                    )}
                  </div>
                  <div className="text-body-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {aiSummary}
                  </div>
                  <button
                    onClick={() => setAiSummary(null)}
                    className="mt-4 text-label-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* BottomNavBar (Mobile Status Indicators) */}
        <footer className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-highest border-t border-outline-variant flex justify-around items-center py-2 h-14 z-40">
          <div className="flex flex-col items-center justify-center text-critical font-bold">
            <span
              className="material-symbols-outlined"
              data-icon="error"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
            <span className="text-label-xs font-label-xs">Critical</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined" data-icon="warning">
              warning
            </span>
            <span className="text-label-xs font-label-xs">High</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined" data-icon="diamond">
              diamond
            </span>
            <span className="text-label-xs font-label-xs">Medium</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined" data-icon="fiber_manual_record">
              fiber_manual_record
            </span>
            <span className="text-label-xs font-label-xs">Low</span>
          </div>
        </footer>
      </div>

      {/* Security Overlay Shield */}
      {isOverlayOpen && (
        <div
          className="fixed inset-0 z-[100] bg-phi-mask-overlay flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-md"
          id="phi-overlay"
        >
          <span className="material-symbols-outlined text-[64px] mb-4 text-error">
            lock
          </span>
          <h2 className="text-display-3xl font-headline-xl mb-4">
            PHI Protected View
          </h2>
          <p className="max-w-md text-body-base opacity-80 mb-8">
            Clinical data is hidden while window focus is lost to prevent
            unauthorized patient identification in accordance with clinical
            security protocols.
          </p>
          <button
            className="px-8 py-4 bg-blue-500 rounded-lg font-bold hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setIsOverlayOpen(false)}
          >
            Resume Session
          </button>
        </div>
      )}
    </div>
  );
}
