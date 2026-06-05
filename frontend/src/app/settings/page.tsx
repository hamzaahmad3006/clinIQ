"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [dataSource, setDataSource] = useState("mock");
  const [fhirBaseUrl, setFhirBaseUrl] = useState("");
  const [gpConnectEndpoint, setGpConnectEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [currentClinicianId, setCurrentClinicianId] = useState("clin-henderson-001");
  const [currentClinicianName, setCurrentClinicianName] = useState("Dr. Henderson");
  const [currentClinicianRole, setCurrentClinicianRole] = useState("specialist");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        const c = data.config;
        setDataSource(c.dataSource);
        setFhirBaseUrl(c.fhirBaseUrl);
        setGpConnectEndpoint(c.gpConnectEndpoint);
        setApiKey(c.apiKey);
        setCurrentClinicianId(c.currentClinicianId);
        setCurrentClinicianName(c.currentClinicianName);
        setCurrentClinicianRole(c.currentClinicianRole);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataSource, fhirBaseUrl, gpConnectEndpoint, apiKey, currentClinicianId, currentClinicianName, currentClinicianRole }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-surface-variant rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </button>
          <h1 className="text-display-2xl font-display-2xl">Settings</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-6">
            <h2 className="text-headline-lg font-headline-lg">Data Source Configuration</h2>

            <div>
              <label className="block text-label-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Data Source Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors flex-1">
                  <input
                    type="radio"
                    name="dataSource"
                    value="mock"
                    checked={dataSource === "mock"}
                    onChange={(e) => setDataSource(e.target.value)}
                    className="accent-secondary"
                  />
                  <div>
                    <span className="font-bold text-body-sm">Mock Data</span>
                    <p className="text-label-xs text-on-surface-variant">Built-in demo data</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors flex-1">
                  <input
                    type="radio"
                    name="dataSource"
                    value="live"
                    checked={dataSource === "live"}
                    onChange={(e) => setDataSource(e.target.value)}
                    className="accent-secondary"
                  />
                  <div>
                    <span className="font-bold text-body-sm">Live API</span>
                    <p className="text-label-xs text-on-surface-variant">Connect to real sources</p>
                  </div>
                </label>
              </div>
            </div>

              <div>
              <label className="block text-label-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Current Clinician
              </label>
              <select
                value={currentClinicianId}
                onChange={(e) => {
                  const val = e.target.value;
                  const [id, name, role] = val.split("|");
                  setCurrentClinicianId(id);
                  setCurrentClinicianName(name);
                  setCurrentClinicianRole(role);
                }}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface focus:ring-2 focus:ring-secondary focus:outline-none"
              >
                <option value="clin-henderson-001|Dr. Henderson|specialist">Dr. Henderson (Specialist)</option>
                <option value="clin-andrew-001|Dr. Andrew|ward_doctor">Dr. Andrew (Ward Doctor)</option>
              </select>
              <p className="text-label-xs text-on-surface-variant mt-1">
                Treatment Relationship Verification is enforced. Only patients with an active relationship are accessible.
              </p>
            </div>

          <div className="space-y-4">
              <div>
                <label className="block text-label-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  FHIR Base URL
                </label>
                <input
                  type="url"
                  value={fhirBaseUrl}
                  onChange={(e) => setFhirBaseUrl(e.target.value)}
                  placeholder="https://fhir.nhs-trust.example.com/R4"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-label-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  GP Connect Endpoint
                </label>
                <input
                  type="url"
                  value={gpConnectEndpoint}
                  onChange={(e) => setGpConnectEndpoint(e.target.value)}
                  placeholder="https://gpconnect.nhs-trust.example.com/patient/{nhsNumber}"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-label-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                />
                <p className="text-label-xs text-on-surface-variant mt-1">
                  Key is stored in memory for the session. Not persisted.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              {saved ? "✓ Saved" : "Save Configuration"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 rounded-lg font-bold border border-outline-variant hover:bg-surface-variant transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
