"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { PHIValue } from "@/components/PHIValue";
import { BreakGlassActiveBanner } from "@/components/BreakGlassActiveBanner";
import { SensitivityTierWarning } from "@/components/SensitivityTierWarning";

interface PatientDetailData {
  id: string;
  name: string;
  fullName: string;
  nhsNumber: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  department: string;
  clinician: string;
  allergies: { name: string; severity: string; reaction: string }[];
  conditions: { name: string; status: string; onset: string; icd10: string }[];
  medications: { name: string; dose: string; route: string; frequency: string; status: string }[];
  investigations: { name: string; result: string; date: string; status: string }[];
  warnings: { type: string; title: string; description: string }[];
}

interface FlagData {
  id: string;
  flagType: string;
  severity: string;
  description: string;
  source: string;
  acknowledgedBy: string | null;
}

export default function PatientBriefPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id as string;
  const { minutesLeft, isWarning } = useSession();

  const [patient, setPatient] = useState<PatientDetailData | null>(null);
  const [flags, setFlags] = useState<FlagData[]>([]);
  const [blockedTiers, setBlockedTiers] = useState<number[]>([]);
  const [activeBreakGlass, setActiveBreakGlass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessReason, setAccessReason] = useState("");
  const [canBreakGlass, setCanBreakGlass] = useState(false);
  const [showBreakGlassForm, setShowBreakGlassForm] = useState(false);
  const [bgJustification, setBgJustification] = useState("");
  const [bgError, setBgError] = useState("");
  const [bgProcessing, setBgProcessing] = useState(false);
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [aiBriefLoading, setAiBriefLoading] = useState(false);
  const [, setAiBriefModel] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [mdtStatus, setMdtStatus] = useState<"idle" | "sharing" | "done">("idle");

  useEffect(() => {
    if (!patientId) return;
    fetch(`/api/patients/${patientId}`)
      .then((res) => {
        if (res.status === 403) return res.json().then((data) => { throw data; });
        return res.json();
      })
      .then((data) => {
        setPatient(data.patient);
        setFlags(data.flags);
        setBlockedTiers(data.blockedTiers ?? []);
        setActiveBreakGlass(data.activeBreakGlass || null);
        setLoading(false);
      })
      .catch((err) => {
        if (err.reason === "no_treatment_relationship") {
          setAccessDenied(true);
          setAccessReason(err.reason);
          setCanBreakGlass(err.canBreakGlass);
          setLoading(false);
        } else {
          router.push("/dashboard");
        }
      });
  }, [patientId, router]);

  const handleGenerateAiBrief = async () => {
    if (!patient || aiBriefLoading) return;
    setAiBriefLoading(true);
    setAiBrief(null);
    try {
      const res = await fetch("/api/brief/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientData: {
            name: patient.fullName,
            age: patient.age,
            gender: patient.gender,
            department: patient.department,
            allergies: patient.allergies,
            conditions: patient.conditions,
            medications: patient.medications,
            investigations: patient.investigations,
          },
        }),
      });
      const data = await res.json();
      setAiBrief(data.brief);
      setAiBriefModel(data.model);
      setShowAiModal(true);
    } catch {
      setAiBrief("Failed to generate AI brief.");
    }
    setAiBriefLoading(false);
  };

  const handleMarkReviewed = async () => {
    await fetch("/api/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorId: "clin-henderson-001",
        actorName: "Dr. Henderson",
        actorRole: "specialist",
        action: "brief.marked_reviewed",
        resourceType: "patient_brief",
        resourceId: patientId,
        patientId,
        accessResult: "granted",
        sensitivityTier: 2,
      }),
    });
    alert("Brief marked as reviewed. Audit logged.");
  };

  const handlePrintBrief = () => {
    window.print();
  };

  const handleShareToMDT = async () => {
    setMdtStatus("sharing");
    try {
      await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "clin-henderson-001",
          actorName: "Dr. Henderson",
          actorRole: "specialist",
          action: "brief.shared_to_mdt",
          resourceType: "patient_brief",
          resourceId: patientId,
          patientId,
          accessResult: "granted",
          sensitivityTier: 2,
        }),
      });
      const shareData = {
        title: `ClinIQ - ${patient?.fullName || "Patient"} Brief`,
        text: `Patient Brief: ${patient?.fullName} (${patient?.nhsNumber})`,
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // user cancelled or clipboard failed
    }
    setMdtStatus("done");
    setTimeout(() => setMdtStatus("idle"), 3000);
  };

  const handleBreakGlass = async () => {
    if (bgJustification.length < 20) return;
    setBgProcessing(true);
    setBgError("");
    try {
      const res = await fetch("/api/break-glass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patientId, justification: bgJustification }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBgError(data.error);
        setBgProcessing(false);
        return;
      }
      // Reset and re-fetch
      setAccessDenied(false);
      setShowBreakGlassForm(false);
      setBgJustification("");
      setBgProcessing(false);
      // Re-fetch patient data
      const patientRes = await fetch(`/api/patients/${patientId}`);
      const patientData = await patientRes.json();
      if (patientData.patient) {
        setPatient(patientData.patient);
        setFlags(patientData.flags);
        setBlockedTiers(patientData.blockedTiers ?? []);
      }
    } catch {
      setBgError("Failed to initiate Break-Glass. Please try again.");
      setBgProcessing(false);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-xl border border-outline-variant p-8 space-y-6 shadow-lg">
          {showBreakGlassForm ? (
            <>
              <div className="text-center space-y-2">
                <span className="material-symbols-outlined text-[48px] text-break-glass" data-icon="warning">warning</span>
                <h2 className="text-headline-xl font-headline-xl text-on-surface">Break-Glass Access</h2>
                <p className="text-body-sm text-on-surface-variant">
                  Emergency override for patients without a treatment relationship.
                  Only Tier 1-2 data will be accessible. This action is audited and
                  reviewed by the Privacy Officer.
                </p>
              </div>
              <div className="bg-critical-bg border-l-4 border-critical p-3 text-left">
                <p className="text-label-xs font-bold text-critical">⚠ LEGAL NOTICE</p>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Unjustified Break-Glass access may result in disciplinary action
                  including termination and criminal referral.
                </p>
              </div>
              <textarea
                value={bgJustification}
                onChange={(e) => setBgJustification(e.target.value)}
                placeholder="Describe the clinical emergency (minimum 20 characters)..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface focus:ring-2 focus:ring-secondary focus:outline-none min-h-[100px]"
                maxLength={500}
              />
              <p className="text-label-xs text-on-surface-variant text-right">
                {bgJustification.length}/500
                {bgJustification.length < 20 && (
                  <span className="text-critical ml-2">Minimum 20 characters required</span>
                )}
              </p>
              {bgError && (
                <p className="text-body-sm text-critical bg-critical-bg p-2 rounded">{bgError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowBreakGlassForm(false); setBgError(""); }}
                  className="flex-1 border border-outline-variant py-3 rounded-lg font-bold hover:bg-surface-variant transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBreakGlass}
                  disabled={bgJustification.length < 20 || bgProcessing}
                  className="flex-1 bg-break-glass text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {bgProcessing ? "Processing..." : "Confirm Break-Glass"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <span className="material-symbols-outlined text-[64px] text-critical" data-icon="lock">lock</span>
                <h2 className="text-headline-xl font-headline-xl text-on-surface">Access Denied</h2>
                <p className="text-body-base text-on-surface-variant">
                  You do not have an active treatment relationship with this patient.
                  This access has been logged.
                </p>
              </div>
              {canBreakGlass && (
                <button
                  onClick={() => setShowBreakGlassForm(true)}
                  className="w-full bg-break-glass text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" data-icon="warning">warning</span>
                  Use Break-Glass Access
                </button>
              )}
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full border border-outline-variant py-3 rounded-lg font-bold hover:bg-surface-variant transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin" data-icon="sync">
            sync
          </span>
          <span className="text-body-base">Loading patient brief...</span>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const criticalFlags = flags.filter((f) => f.severity === "critical");
  const criticalWarnings = patient.warnings.filter((w) => w.type === "critical");
  const restrictedWarnings = patient.warnings.filter((w) => w.type === "restricted");

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-base">
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
              isWarning
                ? "bg-session-warn text-white animate-pulse"
                : "bg-secondary-container text-on-secondary-container"
            }`}
          >
            ● Session: {minutesLeft}m
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-on-primary-container/30">
            <div className="text-right">
              <p className="text-label-xs font-bold leading-tight">{patient.clinician}</p>
              <p className="text-[10px] opacity-70 leading-tight uppercase">
                {patient.department}
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
        <aside className="bg-navy-800 text-on-primary fixed left-0 top-0 h-full w-sidebar-expanded flex flex-col py-6 z-40 shadow-lg hidden md:flex">
          <div className="px-6 mb-8 mt-12">
            <p className="font-headline-lg text-on-primary opacity-40 text-[12px] tracking-widest uppercase">
              System Menu
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm"
              href="#"
              onClick={(e) => { e.preventDefault(); router.push("/dashboard"); }}
            >
              <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              Dashboard
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 bg-navy-700 text-on-primary border-l-4 border-secondary-container text-body-sm font-bold"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <span className="material-symbols-outlined" data-icon="person_search">person_search</span>
              Patient Search
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm"
              href="#"
              onClick={(e) => { e.preventDefault(); router.push("/rounds"); }}
            >
              <span className="material-symbols-outlined" data-icon="assignment">assignment</span>
              My Rounds
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm"
              href="#"
              onClick={(e) => { e.preventDefault(); handleGenerateAiBrief(); }}
            >
              <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
              AI Briefs
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm"
              href="/security-logs"
            >
              <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
              Security Logs
            </a>
          </nav>

          <div className="px-4 mt-auto mb-6">
            <button
              onClick={() => setShowBreakGlassForm(true)}
              className="w-full bg-break-glass text-white py-3 rounded font-ui-heading text-body-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-colors border-2 border-orange-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="lock_open">lock_open</span>
              Break-Glass Access
            </button>
          </div>

          <div className="border-t border-navy-700 pt-4">
            <a className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm" href="/settings">
              <span className="material-symbols-outlined" data-icon="settings">settings</span>
              Settings
            </a>
            <a className="flex items-center gap-3 px-6 py-3 text-on-primary-fixed-variant hover:bg-navy-700 hover:text-on-primary transition-all text-body-sm" href="#">
              <span className="material-symbols-outlined" data-icon="help">help</span>
              Support
            </a>
          </div>
        </aside>

        <main className="flex-grow md:pl-sidebar-expanded p-margin-desktop bg-background pb-24 w-full flex flex-col transition-all duration-300">
          {activeBreakGlass && (
            <div className="mb-6">
              <BreakGlassActiveBanner expiresAt={activeBreakGlass.expiresAt} />
            </div>
          )}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="group select-none">
              <h1 className="font-headline-xl text-headline-xl text-primary mb-1">
                <PHIValue type="name" patientId={patient.id} patientName={patient.fullName}>
                  {patient.name}
                </PHIValue> ·{" "}
                <PHIValue type="nhs" patientId={patient.id} patientName={patient.fullName}>
                  {patient.nhsNumber}
                </PHIValue> · Born{" "}
                <PHIValue type="dob" patientId={patient.id} patientName={patient.fullName}>
                  {patient.dateOfBirth}
                </PHIValue>
              </h1>
              <div className="flex items-center gap-4 text-label-xs font-label-xs">
                <span className="flex items-center gap-1 text-secondary font-bold">
                  <span className="material-symbols-outlined text-[16px]" data-icon="check_circle">check_circle</span>
                  TRV: {activeBreakGlass ? "Emergency Override" : "Scheduled appointment"}
                </span>
                <span className="text-outline">Assigned: {patient.department}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerateAiBrief}
                disabled={aiBriefLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-body-sm flex items-center gap-2 font-bold hover:opacity-90 transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-wait"
              >
                <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
                {aiBriefLoading ? "Generating..." : "AI Brief"}
              </button>
              <button
                onClick={handlePrintBrief}
                className="bg-surface-container-high px-4 py-2 rounded-lg text-body-sm flex items-center gap-2 font-bold hover:bg-surface-container-highest transition-colors cursor-pointer border border-outline-variant/10 active:scale-95 transition-transform duration-100"
              >
                <span className="material-symbols-outlined" data-icon="print">print</span> Print Brief
              </button>
              <button
                onClick={handleShareToMDT}
                disabled={mdtStatus === "sharing"}
                className="bg-secondary text-on-secondary px-6 py-2 rounded-lg text-body-sm flex items-center gap-2 font-bold hover:opacity-90 transition-all cursor-pointer active:scale-95 transition-transform duration-100 disabled:opacity-60 disabled:cursor-wait"
              >
                <span className="material-symbols-outlined" data-icon="ios_share">ios_share</span>
                {mdtStatus === "sharing" ? "Sharing..." : mdtStatus === "done" ? "Shared!" : "Share to MDT"}
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-8 w-full">
            {criticalWarnings.map((w, i) => (
              <div key={i} className="bg-critical-bg border-l-4 border-critical p-4 flex items-center justify-between rounded-r-lg shadow-sm">
                <div className="flex items-center gap-3 text-critical">
                  <span className="material-symbols-outlined" data-icon="error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <span className="font-ui-heading text-body-base">{w.title}: {w.description}</span>
                </div>
                <button className="text-critical font-bold text-label-xs underline uppercase tracking-wider cursor-pointer active:scale-95 transition-transform">Review Conflict</button>
              </div>
            ))}

            {restrictedWarnings.map((w, i) => (
              <SensitivityTierWarning
                key={i}
                title={w.title}
                description={w.description}
                onAuthorizationGranted={() => {
                  fetch(`/api/patients/${patientId}`)
                    .then((res) => res.json())
                    .then((data) => {
                      setPatient(data.patient);
                      setFlags(data.flags);
                      setBlockedTiers(data.blockedTiers ?? []);
                      setActiveBreakGlass(data.activeBreakGlass || null);
                    });
                }}
              />
            ))}

            {criticalFlags.map((f) => (
              <div key={f.id} className="bg-critical-bg border-l-4 border-critical p-4 flex items-center justify-between rounded-r-lg shadow-sm">
                <div className="flex items-center gap-3 text-critical">
                  <span className="material-symbols-outlined" data-icon="error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <span className="font-ui-heading text-body-base">FLAG: {f.description}</span>
                </div>
                <button className="text-critical font-bold text-label-xs underline uppercase tracking-wider cursor-pointer">Acknowledge</button>
              </div>
            ))}
          </div>

          {/* AI Brief Modal */}
          {showAiModal && aiBrief && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-outline-variant">
                <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600" data-icon="auto_awesome">auto_awesome</span>
                    <h2 className="text-headline-lg font-headline-lg text-indigo-800">AI Clinical Brief</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAiModal(false)}
                      className="p-2 hover:bg-surface-variant rounded-full cursor-pointer"
                    >
                      <span className="material-symbols-outlined" data-icon="close">close</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="text-body-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {aiBrief}
                  </div>
                </div>
                <div className="p-4 border-t border-outline-variant flex justify-end gap-3">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-6 py-2 border border-outline-variant rounded-lg font-bold hover:bg-surface-variant transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(aiBrief); }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]" data-icon="content_copy">content_copy</span>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bento-grid w-full">
            <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 flex flex-col hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-lg text-headline-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-critical" data-icon="warning">warning</span>
                  Allergies
                </h3>
                <span className="text-label-xs bg-critical-bg text-critical px-2 py-0.5 rounded-full font-bold">
                  {patient.allergies.filter((a) => a.severity === "critical" || a.severity === "high").length} Active
                </span>
              </div>
              <div className="flex-1 space-y-4">
                {patient.allergies.map((a, i) => (
                  <div key={i} className={`p-4 rounded-lg border-l-4 ${a.severity === "critical" ? "bg-critical-bg/30 border-critical" : a.severity === "high" ? "bg-high-bg border-high-severity" : "bg-low-bg border-low-severity opacity-60"}`}>
                    <p className="font-bold text-body-base text-primary">{a.name.toUpperCase()}</p>
                    <p className={`text-body-sm ${a.severity === "critical" ? "text-critical" : ""} mb-2`}>Severity: {a.reaction}</p>
                  </div>
                ))}
                {patient.allergies.length === 0 && (
                  <p className="text-body-sm text-on-surface-variant italic">No known allergies</p>
                )}
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-lg text-headline-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" data-icon="monitor_heart">monitor_heart</span>
                  Conditions
                </h3>
                <button className="text-secondary font-bold text-label-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-transform hover:underline">
                  <span className="material-symbols-outlined text-[16px]" data-icon="add">add</span> Add Entry
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-outline-variant">
                    <tr>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider">Condition</th>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider">Since</th>
                      <th className="pb-3 text-label-xs text-outline uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {patient.conditions.map((c, i) => (
                      <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="py-4 font-bold text-body-base">{c.name}</td>
                        <td className="py-4">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            c.status === "Active" ? "bg-high-bg text-high-severity" :
                            c.status === "Monitoring" ? "bg-medium-bg text-medium-severity" :
                            "bg-surface-container text-outline"
                          }`}>{c.status}</span>
                        </td>
                        <td className="py-4 text-body-sm font-data-mono">{c.onset}</td>
                        <td className="py-4 text-right">
                          <button className="text-secondary material-symbols-outlined cursor-pointer hover:scale-110 transition-transform" data-icon="chevron_right">chevron_right</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 md:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-lg text-headline-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" data-icon="pill">pill</span>
                  Medications
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {patient.medications.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors duration-150">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined" data-icon="medication">medication</span>
                      </div>
                      <div>
                        <p className="font-bold text-body-base">{m.name} {m.dose}</p>
                        <p className="text-body-sm opacity-70">{m.frequency} · {m.route}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-label-xs font-bold ${m.status === "Active" ? "text-secondary" : "text-on-surface-variant"}`}>{m.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 bg-navy-800 text-on-primary p-6 rounded-xl shadow-inner hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" data-icon="biotech">biotech</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-lg text-headline-lg mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed-dim" data-icon="lab_research">lab_research</span>
                  Investigations
                </h3>
                <div className="space-y-4">
                  {patient.investigations.map((inv, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-white/10 pb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-body-sm font-bold">{inv.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          inv.status === "Completed" ? "bg-green-600 text-white" :
                          inv.status === "Pending" ? "bg-high-severity text-white" :
                          "bg-secondary text-white"
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs opacity-60">Result: {inv.result}</p>
                      <p className="text-[10px] font-data-mono opacity-40">{inv.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-surface-container-high p-8 rounded-2xl flex flex-col items-center text-center gap-6 border-2 border-dashed border-outline w-full shadow-sm">
            <div className="max-w-2xl">
              <h4 className="font-headline-xl text-headline-xl mb-3">Clinical Review Required</h4>
              <p className="text-body-base text-on-surface-variant">
                You are viewing the consolidated brief for patient{" "}
                <strong>{patient.name}</strong>. By marking as reviewed, you
                acknowledge the active alerts and notices.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleMarkReviewed} className="bg-primary text-on-primary px-10 py-4 rounded-xl font-ui-heading text-body-base flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-pointer active:scale-95">
                <span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>
                Mark Brief as Reviewed
              </button>
              <button className="bg-white text-primary border border-outline px-10 py-4 rounded-xl font-ui-heading text-body-base flex items-center gap-3 shadow hover:bg-surface-container-low transition-colors cursor-pointer active:scale-95">
                <span className="material-symbols-outlined" data-icon="edit_note">edit_note</span>
                Add Progress Note
              </button>
            </div>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 h-14 bg-surface-container-highest dark:bg-surface-dim border-t border-outline-variant z-40">
          <div className="flex flex-col items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[20px]" data-icon="error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <span className="text-label-xs font-label-xs">Critical</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant cursor-pointer transition-colors duration-150 rounded px-4">
            <span className="material-symbols-outlined text-[20px]" data-icon="warning">warning</span>
            <span className="text-label-xs font-label-xs">High</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant cursor-pointer transition-colors duration-150 rounded px-4">
            <span className="material-symbols-outlined text-[20px]" data-icon="diamond">diamond</span>
            <span className="text-label-xs font-label-xs">Medium</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant cursor-pointer transition-colors duration-150 rounded px-4">
            <span className="material-symbols-outlined text-[20px]" data-icon="fiber_manual_record">fiber_manual_record</span>
            <span className="text-label-xs font-label-xs">Low</span>
          </div>
        </nav>
      </div>

      {/* PHI overlay handled globally */}
    </div>
  );
}
