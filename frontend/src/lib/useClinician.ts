"use client";

import { useState, useEffect } from "react";

interface ClinicianInfo {
  id: string;
  name: string;
  role: string;
}

export function useClinician() {
  const [clinician, setClinician] = useState<ClinicianInfo>({
    id: "clin-henderson-001",
    name: "Dr. Henderson",
    role: "specialist",
  });

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        const c = data.config;
        setClinician({
          id: c.currentClinicianId || "clin-henderson-001",
          name: c.currentClinicianName || "Dr. Henderson",
          role: c.currentClinicianRole || "specialist",
        });
      })
      .catch(() => {
        // fallback defaults
      });
  }, []);

  return clinician;
}
