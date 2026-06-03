"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PatientBriefPage() {
  const router = useRouter();
  const [sessionSeconds, setSessionSeconds] = useState(720); // 12 minutes
  const [isBlurred, setIsBlurred] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

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
      setIsBlurred(true);
      setIsOverlayVisible(true);
      setTimeout(() => {
        setOverlayOpacity(1);
      }, 10);
    };

    const handleFocus = () => {
      setOverlayOpacity(0);
      setIsBlurred(false);
      setTimeout(() => {
        setIsOverlayVisible(false);
      }, 300);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const sessionMinutesLeft = Math.floor(sessionSeconds / 60);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-base">
      {/* TopNavBar */}
      <header className="bg-primary text-on-primary fixed top-0 z-50 flex justify-between items-center w-full px-margin-desktop h-16">
        <div className="flex items-center gap-6">
          <span
            onClick={() => router.push("/dashboard")}
            className="text-headline-lg font-headline-lg font-black text-on-primary tracking-tight md:hidden cursor-pointer"
          >
            CLinIQ
          </span>
          <div className="relative flex items-center h-10 w-96 bg-primary-container rounded-lg px-3 gap-2">
            <span className="material-symbols-outlined text-on-primary-container" data-icon="search">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-body-sm text-on-primary w-full focus:outline-none"
              placeholder="Search patients, vitals, or IDs..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-4">
            <span
              className="material-symbols-outlined text-on-primary-container hover:bg-primary-container p-2 rounded cursor-pointer transition-colors"
              data-icon="notifications"
            >
              notifications
            </span>
            <span
              className="material-symbols-outlined text-on-primary-container hover:bg-primary-container p-2 rounded cursor-pointer transition-colors"
              data-icon="security"
            >
              security
            </span>
            <span
              className="material-symbols-outlined text-on-primary-container hover:bg-primary-container p-2 rounded cursor-pointer transition-colors"
              data-icon="history"
            >
              history
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-label-xs font-label-xs transition-colors duration-300 ${
              sessionMinutesLeft < 5
                ? "bg-session-warn text-white animate-pulse"
                : "bg-secondary-container text-on-secondary-container"
            }`}
          >
            ● Session: {sessionMinutesLeft}m
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-on-primary-container/30">
            <div className="text-right">
              <p className="text-label-xs font-bold leading-tight">Dr. Henderson</p>
              <p className="text-[10px] opacity-70 leading-tight uppercase">
                Cardiology
              </p>
            </div>
            <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container border border-outline-variant/30">
              <img
                alt="Provider profile avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2Z-9jiUWeGYrFzciGx1C4RVi1Fd3Cwg0hBh0fO2M_PFtijcav8rlZgKn3JhFCgrZHkuID6Q9KCTYFtBNciAWCUELrIvHBTDkU5H2JrW6sDw_MZzLZlilxJjMI2v9lk6Bt1Dxd8fQ4PEGiQoa4MTot5QcoSPCLPwS4lNCemX18kYZcO4Vg3wS5HZUM1TKm79GjnNAHJnC4m4c4Im1hFNDY0tX7MCgJnHXANzvRHenMvzFwQFDNJN95T03t_ltq5jab6eidC5htdyo"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-16 w-full">
        {/* SideNavBar */}
        <aside className="bg-navy-800 text-on-primary fixed left-0 top-0 h-full w-sidebar-expanded flex flex-col py-6 z-40 shadow-lg hidden md:flex">
          <div className="px-6 mb-8 mt-12">
            <p className="font-headline-lg text-on-primary opacity-40 text-[12px] tracking-widest uppercase">
              System Menu
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all text-body-sm"
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
              className="flex items-center gap-3 px-6 py-3 bg-navy-700 text-on-primary border-l-4 border-secondary-container text-body-sm font-bold"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <span className="material-symbols-outlined" data-icon="person_search">
                person_search
              </span>
              Patient Search
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all text-body-sm"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("/rounds");
              }}
            >
              <span className="material-symbols-outlined" data-icon="assignment">
                assignment
              </span>
              My Rounds
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all text-body-sm"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <span className="material-symbols-outlined" data-icon="auto_awesome">
                auto_awesome
              </span>
              AI Briefs
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all text-body-sm"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <span className="material-symbols-outlined" data-icon="gavel">
                gavel
              </span>
              Security Logs
            </a>
          </nav>

          <div className="px-4 mt-auto mb-6">
            <button className="w-full bg-break-glass text-white py-3 rounded font-ui-heading text-body-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-colors border-2 border-orange-200 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]" data-icon="lock_open">
                lock_open
              </span>
              Break-Glass Access
            </button>
          </div>

          <div className="border-t border-navy-700 pt-4">
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all text-body-sm"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="settings">
                settings
              </span>
              Settings
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all text-body-sm"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="help">
                help
              </span>
              Support
            </a>
          </div>
        </aside>

        {/* Main Canvas */}
        <main
          className={`flex-grow md:pl-sidebar-expanded p-margin-desktop bg-background pb-24 w-full flex flex-col transition-all duration-300 ${
            isBlurred ? "phi-masked" : ""
          }`}
        >
          {/* Patient Header Information */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="group cursor-pointer select-none">
              <h1 className="font-headline-xl text-headline-xl text-primary mb-1">
                J. Patel ·{" "}
                <span className="phi-masked blur-md group-hover:blur-none select-none transition-all duration-300 pointer-events-none bg-transparent px-1 rounded-sm">
                  NHS 482 192 1121
                </span>{" "}
                · Born 1958
              </h1>
              <div className="flex items-center gap-4 text-label-xs font-label-xs">
                <span className="flex items-center gap-1 text-secondary font-bold">
                  <span className="material-symbols-outlined text-[16px]" data-icon="check_circle">
                    check_circle
                  </span>
                  TRV: Scheduled appointment
                </span>
                <span className="text-outline">Last Encounter: 14 Oct 2023</span>
                <span className="text-outline">Assigned: Cardiology (Ward 4B)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-surface-container-high px-4 py-2 rounded-lg text-body-sm flex items-center gap-2 font-bold hover:bg-surface-container-highest transition-colors cursor-pointer border border-outline-variant/10 active:scale-95 transition-transform duration-100">
                <span className="material-symbols-outlined" data-icon="print">
                  print
                </span>{" "}
                Print Brief
              </button>
              <button className="bg-secondary text-on-secondary px-6 py-2 rounded-lg text-body-sm flex items-center gap-2 font-bold hover:opacity-90 transition-all cursor-pointer active:scale-95 transition-transform duration-100">
                <span className="material-symbols-outlined" data-icon="ios_share">
                  ios_share
                </span>{" "}
                Share to MDT
              </button>
            </div>
          </div>

          {/* Banners */}
          <div className="space-y-3 mb-8 w-full">
            {/* Critical Banner */}
            <div className="bg-critical-bg border-l-4 border-critical p-4 flex items-center justify-between rounded-r-lg shadow-sm">
              <div className="flex items-center gap-3 text-critical">
                <span
                  className="material-symbols-outlined"
                  data-icon="error"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
                <span className="font-ui-heading text-body-base">
                  CRITICAL ALERT: Allergy conflict: Penicillin in active Rx.
                </span>
              </div>
              <button className="text-critical font-bold text-label-xs underline uppercase tracking-wider cursor-pointer active:scale-95 transition-transform">
                Review Conflict
              </button>
            </div>

            {/* Sensitivity Tier Warning */}
            <div className="bg-tier3-bg border-l-4 border-tier3-warn p-4 flex items-center justify-between rounded-r-lg shadow-sm">
              <div className="flex items-center gap-3 text-tier3-warn">
                <span className="material-symbols-outlined" data-icon="visibility_off">
                  visibility_off
                </span>
                <span className="font-ui-heading text-body-base">
                  SENSITIVITY TIER 3: Mental health records exist but are
                  restricted.
                </span>
              </div>
              <button className="bg-tier3-warn/10 text-tier3-warn px-4 py-1 rounded text-label-xs font-bold border border-tier3-warn/20 cursor-pointer active:scale-95 transition-transform hover:bg-tier3-warn/20 transition-colors">
                Request Access
              </button>
            </div>
          </div>

          {/* Bento Content Layout */}
          <div className="bento-grid w-full">
            {/* Role-Scoped: Allergies (Cardiology Context) */}
            <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 flex flex-col hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-lg text-headline-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-critical" data-icon="warning">
                    warning
                  </span>
                  Allergies
                </h3>
                <span className="text-label-xs bg-critical-bg text-critical px-2 py-0.5 rounded-full font-bold">
                  1 Active
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-critical-bg/30 rounded-lg border-l-4 border-critical">
                  <p className="font-bold text-body-base text-primary">
                    PENICILLIN
                  </p>
                  <p className="text-body-sm text-critical mb-2">
                    Severity: Anaphylaxis
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/80 text-[10px] px-2 py-0.5 rounded border border-outline-variant font-data-mono">
                      GP: Dr. Samra
                    </span>
                    <span className="bg-white/80 text-[10px] px-2 py-0.5 rounded border border-outline-variant font-data-mono">
                      SCR-2021
                    </span>
                    <span className="bg-white/80 text-[10px] px-2 py-0.5 rounded border border-outline-variant font-data-mono text-secondary">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-low-bg rounded-lg border-l-4 border-low-severity opacity-60">
                  <p className="font-bold text-body-base text-primary">Latex</p>
                  <p className="text-body-sm">Contact Dermatitis</p>
                </div>
              </div>
            </div>

            {/* Conditions (Cardiac) */}
            <div className="col-span-12 md:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-lg text-headline-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" data-icon="monitor_heart">
                    monitor_heart
                  </span>
                  Cardiac Conditions
                </h3>
                <button className="text-secondary font-bold text-label-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-transform hover:underline">
                  <span className="material-symbols-outlined text-[16px]" data-icon="add">
                    add
                  </span>{" "}
                  Add Entry
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-outline-variant">
                    <tr>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider">
                        Status
                      </th>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider">
                        Since
                      </th>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-4 font-bold text-body-base">
                        Atrial Fibrillation
                      </td>
                      <td className="py-4">
                        <span className="bg-high-bg text-high-severity text-[11px] px-2 py-0.5 rounded-full font-bold">
                          Uncontrolled
                        </span>
                      </td>
                      <td className="py-4 text-body-sm font-data-mono">
                        2018-05
                      </td>
                      <td className="py-4 text-right">
                        <button
                          className="text-secondary material-symbols-outlined cursor-pointer hover:scale-110 transition-transform"
                          data-icon="chevron_right"
                        >
                          chevron_right
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-4 font-bold text-body-base">
                        Mitral Valve Regurgitation
                      </td>
                      <td className="py-4">
                        <span className="bg-medium-bg text-medium-severity text-[11px] px-2 py-0.5 rounded-full font-bold">
                          Chronic
                        </span>
                      </td>
                      <td className="py-4 text-body-sm font-data-mono">
                        2020-11
                      </td>
                      <td className="py-4 text-right">
                        <button
                          className="text-secondary material-symbols-outlined cursor-pointer hover:scale-110 transition-transform"
                          data-icon="chevron_right"
                        >
                          chevron_right
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-4 font-bold text-body-base">
                        Hypercholesterolemia
                      </td>
                      <td className="py-4">
                        <span className="bg-surface-container text-outline text-[11px] px-2 py-0.5 rounded-full font-bold">
                          Stable
                        </span>
                      </td>
                      <td className="py-4 text-body-sm font-data-mono">
                        2010-02
                      </td>
                      <td className="py-4 text-right">
                        <button
                          className="text-secondary material-symbols-outlined cursor-pointer hover:scale-110 transition-transform"
                          data-icon="chevron_right"
                        >
                          chevron_right
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Medications (Cardiac) */}
            <div className="col-span-12 md:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-lg text-headline-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" data-icon="pill">
                    pill
                  </span>
                  Medications (Cardiac)
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors duration-150">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined" data-icon="medication">
                        medication
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-body-base">Apixaban 5mg</p>
                      <p className="text-body-sm opacity-70">Twice daily · Oral</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-label-xs font-bold text-secondary">
                      ACTIVE
                    </p>
                    <p className="text-[10px] opacity-60">Refill in 4d</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors duration-150">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined" data-icon="medication">
                        medication
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-body-base">
                        Bisoprolol 2.5mg
                      </p>
                      <p className="text-body-sm opacity-70">
                        Once daily · Oral
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-label-xs font-bold text-secondary">
                      ACTIVE
                    </p>
                    <p className="text-[10px] opacity-60">Refill in 12d</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Investigations */}
            <div className="col-span-12 md:col-span-5 bg-navy-800 text-on-primary p-6 rounded-xl shadow-inner hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" data-icon="biotech">
                  biotech
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-lg text-headline-lg mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed-dim" data-icon="lab_research">
                    lab_research
                  </span>
                  Latest Investigations
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm font-bold">ECG (12-Lead)</span>
                      <span className="bg-high-severity text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        ABNORMAL
                      </span>
                    </div>
                    <p className="text-xs opacity-60">
                      Result: Irregular R-R intervals, absent p-waves.
                    </p>
                    <p className="text-[10px] font-data-mono opacity-40">
                      14 Oct 2023 09:15
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm font-bold">
                        Echocardiogram
                      </span>
                      <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        PENDING
                      </span>
                    </div>
                    <p className="text-xs opacity-60">
                      Scheduled for Ward Round tomorrow.
                    </p>
                    <p className="text-[10px] font-data-mono opacity-40">
                      Order: #LAB-9022-A
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm font-bold">Troponin T</span>
                      <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        NORMAL
                      </span>
                    </div>
                    <p className="text-xs opacity-60">Value: &lt; 14 ng/L</p>
                    <p className="text-[10px] font-data-mono opacity-40">
                      12 Oct 2023 18:40
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Summary Card (Bento expansion) */}
          <div className="mt-8 bg-surface-container-high p-8 rounded-2xl flex flex-col items-center text-center gap-6 border-2 border-dashed border-outline w-full shadow-sm">
            <div className="max-w-2xl">
              <h4 className="font-headline-xl text-headline-xl mb-3">
                Clinical Review Required
              </h4>
              <p className="text-body-base text-on-surface-variant">
                You are viewing the consolidated cardiology brief for patient{" "}
                <strong>J. Patel</strong>. By marking as reviewed, you
                acknowledge the active allergy alerts and restricted record
                notices.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="bg-primary text-on-primary px-10 py-4 rounded-xl font-ui-heading text-body-base flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-pointer active:scale-95">
                <span className="material-symbols-outlined" data-icon="fact_check">
                  fact_check
                </span>
                Mark Brief as Reviewed
              </button>
              <button className="bg-white text-primary border border-outline px-10 py-4 rounded-xl font-ui-heading text-body-base flex items-center gap-3 shadow hover:bg-surface-container-low transition-colors cursor-pointer active:scale-95">
                <span className="material-symbols-outlined" data-icon="edit_note">
                  edit_note
                </span>
                Add Progress Note
              </button>
            </div>
          </div>
        </main>

        {/* BottomNavBar */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 h-14 bg-surface-container-highest dark:bg-surface-dim border-t border-outline-variant z-40">
          <div className="flex flex-col items-center justify-center text-primary font-bold">
            <span
              className="material-symbols-outlined text-[20px]"
              data-icon="error"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
            <span className="text-label-xs font-label-xs">Critical</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant cursor-pointer transition-colors duration-150 rounded px-4">
            <span className="material-symbols-outlined text-[20px]" data-icon="warning">
              warning
            </span>
            <span className="text-label-xs font-label-xs">High</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant cursor-pointer transition-colors duration-150 rounded px-4">
            <span className="material-symbols-outlined text-[20px]" data-icon="diamond">
              diamond
            </span>
            <span className="text-label-xs font-label-xs">Medium</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant cursor-pointer transition-colors duration-150 rounded px-4">
            <span
              className="material-symbols-outlined text-[20px]"
              data-icon="fiber_manual_record"
            >
              fiber_manual_record
            </span>
            <span className="text-label-xs font-label-xs">Low</span>
          </div>
        </nav>
      </div>

      {/* PHI Masking Layer Visualizer (Fades in/out on window blur) */}
      {isOverlayVisible && (
        <div
          className="fixed inset-0 bg-phi-mask-overlay backdrop-blur-md z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
          id="phi-overlay"
        >
          <div className="text-center text-white bg-navy-800 p-8 rounded-2xl border-2 border-white/20 shadow-2xl">
            <span
              className="material-symbols-outlined text-[64px] mb-4"
              data-icon="enhanced_encryption"
            >
              enhanced_encryption
            </span>
            <h2 className="text-headline-xl font-headline-xl mb-2">
              Patient Records Masked
            </h2>
            <p className="text-body-base opacity-70">
              Focus window to resume clinical review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
