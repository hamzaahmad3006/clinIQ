"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/useAuth";

interface AuditEntry {
  id: number;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  accessResult: string;
  sensitivityTier: number | null;
  timestamp: string;
}

export default function SecurityLogsPage() {
  const router = useRouter();
  useAuthGuard();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs));
  }, []);

  const filtered = filter ? logs.filter((l) => l.action.includes(filter)) : logs;

  const severityColor = (result: string) => {
    switch (result) {
      case "denied": return "text-critical";
      case "break_glass": return "text-break-glass";
      default: return "text-low-severity";
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-surface-variant rounded-lg transition-colors cursor-pointer">
              <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
            </button>
            <h1 className="text-display-2xl font-display-2xl">Security Logs</h1>
          </div>
          <span className="text-label-xs bg-surface-container-high px-3 py-1 rounded-full font-bold">
            {logs.length} events total
          </span>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by action type..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm text-on-surface focus:ring-2 focus:ring-secondary focus:outline-none"
          />
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr className="text-label-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Clinician</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-body-sm">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-4 py-3 font-data-mono text-label-xs">
                      {new Date(log.timestamp).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.actorName}</td>
                    <td className="px-4 py-3">
                      <code className="bg-surface-container-high px-2 py-0.5 rounded text-label-xs font-data-mono">
                        {log.action}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-label-xs text-on-surface-variant">{log.resourceType}</td>
                    <td className={`px-4 py-3 font-bold text-label-xs ${severityColor(log.accessResult)}`}>
                      {log.accessResult.toUpperCase()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
