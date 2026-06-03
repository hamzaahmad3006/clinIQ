"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Interactive mask component that blurs its contents by default
// and temporarily reveals them on click and hold.
const PHIMask = ({ children }: { children: React.ReactNode }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onMouseDown={() => setRevealed(true)}
      onMouseUp={() => setRevealed(false)}
      onMouseLeave={() => setRevealed(false)}
      onTouchStart={() => setRevealed(true)}
      onTouchEnd={() => setRevealed(false)}
      className="text-data-mono text-on-surface-variant cursor-help transition-all duration-150 px-1 rounded-sm select-none"
      style={{
        filter: revealed ? "none" : "blur(4px)",
        backgroundColor: revealed ? "#FFFBEB" : "transparent",
      }}
    >
      {children}
    </span>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [sessionSeconds, setSessionSeconds] = useState(720); // 12 minutes

  // Countdown timer for session activity check
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds to minutes left
  const sessionMinutesLeft = Math.floor(sessionSeconds / 60);

  // Navigate to patient brief
  const openPatientBrief = (patientId: string) => {
    router.push(`/patient/${patientId}`);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex w-full">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-expanded bg-navy-800 text-on-primary flex flex-col py-6 z-50 shadow-lg hidden md:flex">
        <div className="px-6 mb-8 flex items-center gap-3">
          <span className="font-headline-lg text-headline-lg text-on-primary tracking-tight">
            CLinIQ
          </span>
        </div>

        <div className="px-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-navy-700 rounded-lg">
            <img
              alt="Dr. Ahmed"
              className="w-10 h-10 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_j0ZTAJy57YKRA3cXKCHl3TMTF7DV8ELmdUSxfMVwCO4IbNDNIMXsnmtyAVgqdOEcOhpM29kJ2vMjgGR4z98nPguMVPieQn4ARy3-J7PBISnpEMB2f8Y655xHzCsLM5xWqD-NCbOLAqThiPMAtVOvQ3ZTxi7fYukCR6PpsPM_khnui8lwVLZfXjEsX6uoeKW7NDSMaxoe-hBDgG5T1Obqny6A-d8AzWxiGdxdmh3-a7t5gZLb84y_grm1GPpweNvOeW8rLTSl5K8"
            />
            <div>
              <p className="text-body-sm font-body-sm font-bold">Dr. Ahmed</p>
              <p className="text-label-xs font-label-xs opacity-70">
                On-Call Physician
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {/* Active: Dashboard */}
          <a
            className="flex items-center gap-4 px-4 py-3 sidebar-item-active transition-all"
            href="#"
          >
            <span className="material-symbols-outlined" data-icon="dashboard">
              dashboard
            </span>
            <span className="text-label-xs font-label-xs">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all"
            href="#"
          >
            <span className="material-symbols-outlined" data-icon="person_search">
              person_search
            </span>
            <span className="text-label-xs font-label-xs">Patient Search</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push("/rounds");
            }}
          >
            <span className="material-symbols-outlined" data-icon="assignment">
              assignment
            </span>
            <span className="text-label-xs font-label-xs">My Rounds</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all"
            href="#"
          >
            <span className="material-symbols-outlined" data-icon="auto_awesome">
              auto_awesome
            </span>
            <span className="text-label-xs font-label-xs">AI Briefs</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3 text-on-primary-fixed-variant opacity-70 hover:bg-navy-700 hover:opacity-100 transition-all"
            href="#"
          >
            <span className="material-symbols-outlined" data-icon="gavel">
              gavel
            </span>
            <span className="text-label-xs font-label-xs">Security Logs</span>
          </a>
        </nav>

        <div className="mt-auto px-4 space-y-4">
          <button className="w-full py-3 bg-break-glass text-on-primary text-label-xs font-bold rounded flex items-center justify-center gap-2 border-2 border-break-glass hover:opacity-90 transition-all cursor-pointer">
            <span className="material-symbols-outlined" data-icon="warning">
              warning
            </span>
            Break-Glass Access
          </button>
          <div className="space-y-1">
            <a
              className="flex items-center gap-4 px-4 py-2 text-on-primary-fixed-variant opacity-70 hover:opacity-100"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="settings">
                settings
              </span>
              <span className="text-label-xs font-label-xs">Settings</span>
            </a>
            <a
              className="flex items-center gap-4 px-4 py-2 text-on-primary-fixed-variant opacity-70 hover:opacity-100"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="help">
                help
              </span>
              <span className="text-label-xs font-label-xs">Support</span>
            </a>
          </div>
        </div>
      </aside>

      <div className="flex-grow md:pl-sidebar-expanded flex flex-col min-h-screen w-full">
        {/* TopAppBar */}
        <header className="bg-primary text-on-primary sticky top-0 z-50 h-16 flex justify-between items-center px-8 w-full">
          <div className="flex items-center gap-8">
            <h1 className="text-headline-lg font-headline-lg font-black text-on-primary tracking-tight md:hidden">
              CLinIQ
            </h1>
            <div className="relative w-96">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-primary-container"
                data-icon="search"
              >
                search
              </span>
              <input
                className="w-full bg-primary-container border-none rounded-lg pl-10 pr-4 py-2 text-body-sm text-on-primary placeholder:text-on-primary-container focus:ring-1 focus:ring-secondary focus:outline-none"
                placeholder="Search patient or source..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Source Health Indicator */}
            <div className="flex items-center gap-2 text-label-xs font-label-xs bg-primary-container px-3 py-1.5 rounded-full text-on-primary-container">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              HL7/FHIR Connectivity: Stable
            </div>

            <div className="flex items-center gap-4">
              <span
                className="material-symbols-outlined cursor-pointer hover:bg-primary-container p-2 rounded transition-colors"
                data-icon="notifications"
              >
                notifications
              </span>
              <span
                className="material-symbols-outlined cursor-pointer hover:bg-primary-container p-2 rounded transition-colors"
                data-icon="security"
              >
                security
              </span>
              <span
                className="material-symbols-outlined cursor-pointer hover:bg-primary-container p-2 rounded transition-colors"
                data-icon="history"
              >
                history
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/20"></div>

            <div
              className={`flex items-center gap-2 text-label-xs font-bold px-4 py-2 rounded-lg transition-colors duration-300 ${
                sessionMinutesLeft < 5
                  ? "bg-session-warn text-white animate-pulse"
                  : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              ● Session: {sessionMinutesLeft}m
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto flex-grow mb-16">
          {/* Dashboard Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-display-2xl font-display-2xl text-on-surface">
                Welcome back, Dr. Ahmed
              </h2>
              <p className="text-body-base text-on-surface-variant">
                Intensive Care Unit • Monday, Oct 23
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-label-xs font-bold hover:bg-surface-variant transition-all flex items-center gap-2 cursor-pointer border border-outline-variant/10">
                <span className="material-symbols-outlined" data-icon="file_download">
                  file_download
                </span>
                Export Shift Report
              </button>
              <button className="bg-blue-500 text-on-primary px-4 py-2 rounded-lg text-label-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined" data-icon="add">
                  add
                </span>
                New Encounter
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:border-secondary hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <p className="text-label-xs font-label-xs text-on-surface-variant uppercase tracking-wider">
                  Today's Encounters
                </p>
                <span className="material-symbols-outlined text-secondary" data-icon="calendar_today">
                  calendar_today
                </span>
              </div>
              <p className="text-display-3xl font-display-3xl text-primary">12</p>
              <p className="text-label-xs text-green-600 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">
                  trending_up
                </span>
                +2 from yesterday
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:border-secondary hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <p className="text-label-xs font-label-xs text-on-surface-variant uppercase tracking-wider">
                  Briefs Ready
                </p>
                <span className="material-symbols-outlined text-secondary" data-icon="auto_stories">
                  auto_stories
                </span>
              </div>
              <p className="text-display-3xl font-display-3xl text-primary">9</p>
              <p className="text-label-xs text-on-surface-variant mt-2">
                75% automated completion
              </p>
            </div>

            <div className="bg-critical-bg p-6 rounded-xl border-l-4 border-critical shadow-sm hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <p className="text-label-xs font-label-xs text-critical uppercase tracking-wider font-bold">
                  Active Flags
                </p>
                <span
                  className="material-symbols-outlined text-critical"
                  data-icon="emergency"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  emergency
                </span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-display-3xl font-display-3xl text-critical">3</p>
                <div className="mb-2 space-x-1">
                  <span className="bg-critical text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    1 CRIT
                  </span>
                  <span className="bg-high-severity text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    2 HIGH
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-navy-800 p-6 rounded-xl text-white hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <p className="text-label-xs font-label-xs text-on-primary-container uppercase tracking-wider">
                  Source Status
                </p>
                <span className="material-symbols-outlined text-secondary-container" data-icon="database">
                  database
                </span>
              </div>
              <p className="text-ui-heading font-ui-heading">All Systems Up</p>
              <p className="text-label-xs opacity-70 mt-2">
                Syncing via NHS-Spine... <br />
                Last update: 2m ago
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Encounter List (Left 2/3) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-headline-xl font-headline-xl">
                  Active Encounters
                </h3>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded hover:bg-surface-variant cursor-pointer">
                    <span className="material-symbols-outlined text-on-surface-variant" data-icon="filter_list">
                      filter_list
                    </span>
                  </button>
                  <button className="p-1.5 rounded hover:bg-surface-variant cursor-pointer">
                    <span className="material-symbols-outlined text-on-surface-variant" data-icon="sort">
                      sort
                    </span>
                  </button>
                </div>
              </div>

              {/* List Header */}
              <div className="grid grid-cols-6 px-4 py-2 text-label-xs font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                <div className="col-span-2">Patient Name</div>
                <div>NHS Number</div>
                <div>Status</div>
                <div>Brief</div>
                <div className="text-right">Actions</div>
              </div>

              {/* Row 1: J. Patel */}
              <div className="group grid grid-cols-6 items-center px-4 py-4 bg-surface-container-lowest border-l-4 border-green-500 rounded-r-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                    JP
                  </div>
                  <span className="text-body-base font-bold">J. Patel</span>
                </div>
                <div>
                  <PHIMask>482-102-3912</PHIMask>
                </div>
                <div>
                  <span className="bg-low-bg text-low-severity text-[10px] px-2 py-1 rounded-full font-bold border border-outline-variant">
                    ADMITTED
                  </span>
                </div>
                <div>
                  <span className="text-blue-500 flex items-center gap-1 text-label-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]" data-icon="check_circle">
                      check_circle
                    </span>
                    Ready
                  </span>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => openPatientBrief("j-patel")}
                    className="text-blue-500 hover:underline text-label-xs font-bold cursor-pointer"
                  >
                    OPEN BRIEF
                  </button>
                </div>
              </div>

              {/* Row 2: M. Al-Farsi */}
              <div className="group grid grid-cols-6 items-center px-4 py-4 bg-surface-container-lowest border-l-4 border-yellow-500 rounded-r-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
                    MA
                  </div>
                  <span className="text-body-base font-bold">M. Al-Farsi</span>
                </div>
                <div>
                  <PHIMask>591-231-0081</PHIMask>
                </div>
                <div>
                  <span className="bg-high-bg text-high-severity text-[10px] px-2 py-1 rounded-full font-bold border border-high-severity">
                    LABS PENDING
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-2/3 animate-pulse"></div>
                  </div>
                  <span className="text-label-xs opacity-60">60%</span>
                </div>
                <div className="text-right">
                  <button className="text-on-surface-variant opacity-50 cursor-not-allowed text-label-xs font-bold">
                    WAITING...
                  </button>
                </div>
              </div>

              {/* Row 3: S. Khan */}
              <div className="group grid grid-cols-6 items-center px-4 py-4 bg-surface-container-lowest border-l-4 border-critical rounded-r-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-critical font-bold">
                    SK
                  </div>
                  <span className="text-body-base font-bold">S. Khan</span>
                </div>
                <div>
                  <PHIMask>109-332-9456</PHIMask>
                </div>
                <div>
                  <span className="bg-critical-bg text-critical text-[10px] px-2 py-1 rounded-full font-bold border border-critical">
                    URGENT
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-critical">
                    <span className="material-symbols-outlined text-[16px]" data-icon="error">
                      error
                    </span>
                    <span className="text-label-xs font-bold">2 Flags</span>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => openPatientBrief("s-khan")}
                    className="bg-critical text-white px-3 py-1 rounded text-label-xs font-bold hover:bg-opacity-90 cursor-pointer"
                  >
                    REVIEW
                  </button>
                </div>
              </div>
            </div>

            {/* Critical Flags Panel (Right 1/3) */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border-2 border-critical overflow-hidden">
                <div className="bg-critical text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined" data-icon="campaign">
                      campaign
                    </span>
                    <h3 className="text-ui-heading font-ui-heading">
                      Critical Alert
                    </h3>
                  </div>
                  <span className="text-label-xs bg-white/20 px-2 py-0.5 rounded">
                    NEW
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-critical-bg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-critical" data-icon="medical_services">
                        medical_services
                      </span>
                    </div>
                    <div>
                      <p className="text-label-xs text-on-surface-variant font-bold uppercase tracking-wide">
                        Allergy Conflict
                      </p>
                      <p className="text-body-base font-bold mt-1">J. Patel</p>
                      <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                        Prescribed Penicillin (V-Cil-K) despite recorded allergy
                        to Penicillins. Brief generation flagged clinical risk.
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded text-label-xs font-data-mono text-on-surface-variant">
                    Source: EPIC / Medication-Admin-Log v1.4
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 bg-white border border-outline text-on-surface py-2 rounded-lg text-label-xs font-bold hover:bg-surface-container transition-all cursor-pointer">
                      Acknowledge
                    </button>
                    <button
                      onClick={() => openPatientBrief("j-patel")}
                      className="flex-1 bg-critical text-white py-2 rounded-lg text-label-xs font-bold hover:bg-opacity-90 transition-all cursor-pointer"
                    >
                      View Brief
                    </button>
                  </div>
                </div>
              </div>

              {/* Context Card */}
              <div className="bg-surface-container-high p-6 rounded-xl">
                <h4 className="text-ui-heading font-ui-heading mb-4">
                  Shift Intelligence
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500 mt-0.5" data-icon="info">
                      info
                    </span>
                    <p className="text-body-sm">
                      Ward Round starts in 15 mins. Briefs for 4 patients in
                      Ward B are pending your sign-off.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-session-warn mt-0.5" data-icon="update">
                      update
                    </span>
                    <p className="text-body-sm">
                      Security Policy: NHS numbers will be masked in 120s due to
                      inactivity on primary viewport.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Status Bar */}
        <footer className="fixed bottom-0 left-0 md:left-sidebar-expanded right-0 h-14 bg-surface-container-highest border-t border-outline-variant flex justify-around items-center z-40">
          <div className="flex flex-col items-center justify-center text-critical font-bold">
            <span
              className="material-symbols-outlined"
              data-icon="error"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
            <span className="text-label-xs">Critical</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant opacity-70">
            <span className="material-symbols-outlined" data-icon="warning">
              warning
            </span>
            <span className="text-label-xs">High</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant opacity-70">
            <span className="material-symbols-outlined" data-icon="diamond">
              diamond
            </span>
            <span className="text-label-xs">Medium</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant opacity-70">
            <span className="material-symbols-outlined" data-icon="fiber_manual_record">
              fiber_manual_record
            </span>
            <span className="text-label-xs">Low</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
