"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BreakGlassGlobalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PatientListItem {
  id: string;
  name: string;
  nhsNumber: string;
}

const opaqueIdMap: Record<string, string> = {
  "j-wilson": "enc_a7f3b9c2",
  "m-thompson": "enc_b8d4e0f3",
  "r-johnson": "enc_c9e5f1a4",
  "d-brown": "enc_d0f6a2b5",
  "w-davis": "enc_e1a7b3c6",
  "s-miller": "enc_f2b8c4d7",
};

export function BreakGlassGlobalModal({ isOpen, onClose }: BreakGlassGlobalModalProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/patients")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.patients) {
            setPatients(data.patients);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }
    if (justification.length < 20) {
      setError("Justification must be at least 20 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/break-glass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          justification,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to establish Break-Glass access.");
        setLoading(false);
        return;
      }

      onClose();
      setJustification("");
      setSelectedPatientId("");
      
      const opaque = opaqueIdMap[selectedPatientId] || selectedPatientId;
      router.push(`/patient/${opaque}`);
    } catch {
      setError("Failed to communicate with server. Try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-lg w-full p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-surface-variant rounded-full text-on-surface-variant cursor-pointer"
        >
          <span className="material-symbols-outlined" data-icon="close">close</span>
        </button>

        <div className="text-center space-y-2">
          <span
            className="material-symbols-outlined text-[48px] text-break-glass"
            data-icon="warning"
          >
            warning
          </span>
          <h2 className="text-headline-xl font-headline-xl text-on-surface">
            Global Break-Glass Request
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Emergency override access to view patient records. Restricts view to Tier 1-2 details and alerts the Privacy Officer.
          </p>
        </div>

        <div className="bg-critical-bg border-l-4 border-critical p-3">
          <p className="text-label-xs font-bold text-critical">⚠ CLINICAL SAFETY WARNING</p>
          <p className="text-body-sm text-on-surface-variant mt-1 leading-snug">
            You must have a valid clinical justification for accessing this patient's
            record. Every Break-Glass request is logged and subject to manual audit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Select Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface focus:ring-2 focus:ring-secondary focus:outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (NHS: {p.nhsNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-label-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Clinical Justification
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain the clinical emergency (minimum 20 characters)..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface focus:ring-2 focus:ring-secondary focus:outline-none min-h-[100px]"
              maxLength={500}
            />
            <p className="text-label-xs text-on-surface-variant text-right mt-1">
              {justification.length}/500
              {justification.length < 20 && (
                <span className="text-critical ml-2 font-bold">
                  (Minimum 20 characters required)
                </span>
              )}
            </p>
          </div>

          {error && (
            <p className="text-body-sm text-critical bg-critical-bg p-3 border border-critical/20 rounded font-bold">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-outline-variant py-3 rounded-lg font-bold hover:bg-surface-variant transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || justification.length < 20 || !selectedPatientId}
              className="flex-1 bg-break-glass text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Authorizing..." : "Initiate Break-Glass"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
