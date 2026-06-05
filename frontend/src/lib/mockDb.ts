/* ───── Types ───── */

export interface Patient {
  id: string;
  name: string;
  initials: string;
  nhsNumber: string;
  dateOfBirth: string;
  age: number;
  gender: "Male" | "Female";
  avatarColor: string;
  avatarTextColor: string;
  consentStatus: "active" | "opted_out" | "restricted";
  organisationId: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  nhsNumber: string;
  encounterType: "emergency" | "outpatient" | "inpatient" | "referral" | "ward_round";
  department: string;
  status: "admitted" | "labs_pending" | "urgent" | "scheduled" | "discharged";
  statusLabel: string;
  statusColor: string;
  borderColor: string;
  briefStatus: "ready" | "syncing" | "error" | "pending";
  briefPercentage: number;
  flagCount: number;
  avatarColor: string;
  avatarTextColor: string;
}

export interface WardBed {
  bed: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: "Male" | "Female";
  briefStatus: "ready" | "syncing" | "error" | "pending";
  overnightChanges: string[];
  overnightDetail: string;
  flagCount: number;
  flagSeverity: "critical" | "high" | "medium" | "low" | "none";
}

export interface OvernightEvent {
  patientName: string;
  bed: string;
  time: string;
  severity: "critical" | "high" | "low";
  title: string;
  description: string;
}

export interface ClinicalFlag {
  id: string;
  patientId: string;
  patientName: string;
  flagType: "allergy_conflict" | "med_discrepancy" | "duplicate_test" | "missing_result" | "contraindication";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  source: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  patientId: string | null;
  accessResult: "granted" | "denied" | "break_glass";
  sensitivityTier: number | null;
  timestamp: string;
}

export interface PatientDetail {
  id: string;
  name: string;
  fullName: string;
  nhsNumber: string;
  dateOfBirth: string;
  age: number;
  gender: "Male" | "Female";
  department: string;
  clinician: string;
  allergies: { name: string; severity: "critical" | "high" | "medium"; reaction: string }[];
  conditions: { name: string; status: "Active" | "Monitoring" | "Resolved"; onset: string; icd10: string }[];
  medications: { name: string; dose: string; route: string; frequency: string; status: "Active" | "PRN" }[];
  investigations: { name: string; result: string; date: string; status: "Completed" | "Pending" | "Ordered" }[];
  warnings: { type: "critical" | "restricted"; title: string; description: string }[];
}

export interface EmergencyData {
  patientId: string;
  patientName: string;
  loadingSources: { current: number; total: number };
  allergies: { name: string; severity: "critical" | "high"; reaction: string }[];
  criticalFlags: { title: string; detail: string; code: string }[];
  medications: { name: string; dose: string; frequency: string; category: string }[];
  conditions: { name: string; status: string }[];
  labs: { name: string; value: string; unit: string; trend: "up" | "down" | "stable" }[];
  blockedTiers: string;
}

/* ───── Seed Data ───── */

const patients: Patient[] = [
  {
    id: "j-patel",
    name: "J. Patel",
    initials: "JP",
    nhsNumber: "482-192-1121",
    dateOfBirth: "1958-03-12",
    age: 68,
    gender: "Male",
    avatarColor: "#D6E8FA",
    avatarTextColor: "#2E7DD1",
    consentStatus: "active",
    organisationId: "nhs-trust-001",
  },
  {
    id: "m-alfarsi",
    name: "M. Al-Farsi",
    initials: "MA",
    nhsNumber: "591-231-0081",
    dateOfBirth: "1975-08-22",
    age: 51,
    gender: "Male",
    avatarColor: "#FEF3C7",
    avatarTextColor: "#B45309",
    consentStatus: "active",
    organisationId: "nhs-trust-001",
  },
  {
    id: "s-khan",
    name: "S. Khan",
    initials: "SK",
    nhsNumber: "109-332-9456",
    dateOfBirth: "1981-04-15",
    age: 45,
    gender: "Female",
    avatarColor: "#FEE2E2",
    avatarTextColor: "#D92B2B",
    consentStatus: "active",
    organisationId: "nhs-trust-001",
  },
  {
    id: "t-okonkwo",
    name: "T. Okonkwo",
    initials: "TO",
    nhsNumber: "739-441-8823",
    dateOfBirth: "1944-11-03",
    age: 82,
    gender: "Male",
    avatarColor: "#DBEAFE",
    avatarTextColor: "#1E40AF",
    consentStatus: "active",
    organisationId: "nhs-trust-001",
  },
  {
    id: "r-singh",
    name: "R. Singh",
    initials: "RS",
    nhsNumber: "284-109-5567",
    dateOfBirth: "1965-06-30",
    age: 61,
    gender: "Male",
    avatarColor: "#F3E8FF",
    avatarTextColor: "#7C3AED",
    consentStatus: "active",
    organisationId: "nhs-trust-001",
  },
  {
    id: "m-davies",
    name: "M. Davies",
    initials: "MD",
    nhsNumber: "601-778-2340",
    dateOfBirth: "1997-02-14",
    age: 29,
    gender: "Female",
    avatarColor: "#D1FAE5",
    avatarTextColor: "#059669",
    consentStatus: "active",
    organisationId: "nhs-trust-001",
  },
];

const encounters: Encounter[] = [
  {
    id: "enc-001",
    patientId: "j-patel",
    patientName: "J. Patel",
    patientInitials: "JP",
    nhsNumber: "482-192-1121",
    encounterType: "inpatient",
    department: "Cardiology",
    status: "admitted",
    statusLabel: "ADMITTED",
    statusColor: "bg-low-bg text-low-severity border border-outline-variant",
    borderColor: "border-green-500",
    briefStatus: "ready",
    briefPercentage: 100,
    flagCount: 1,
    avatarColor: "#D6E8FA",
    avatarTextColor: "#2E7DD1",
  },
  {
    id: "enc-002",
    patientId: "m-alfarsi",
    patientName: "M. Al-Farsi",
    patientInitials: "MA",
    nhsNumber: "591-231-0081",
    encounterType: "inpatient",
    department: "General Medicine",
    status: "labs_pending",
    statusLabel: "LABS PENDING",
    statusColor: "bg-high-bg text-high-severity border border-high-severity",
    borderColor: "border-yellow-500",
    briefStatus: "syncing",
    briefPercentage: 60,
    flagCount: 0,
    avatarColor: "#FEF3C7",
    avatarTextColor: "#B45309",
  },
  {
    id: "enc-003",
    patientId: "s-khan",
    patientName: "S. Khan",
    patientInitials: "SK",
    nhsNumber: "109-332-9456",
    encounterType: "emergency",
    department: "Emergency Medicine",
    status: "urgent",
    statusLabel: "URGENT",
    statusColor: "bg-critical-bg text-critical border border-critical",
    borderColor: "border-critical",
    briefStatus: "ready",
    briefPercentage: 100,
    flagCount: 2,
    avatarColor: "#FEE2E2",
    avatarTextColor: "#D92B2B",
  },
];

const wardBeds: WardBed[] = [
  {
    bed: "4B1",
    patientId: "t-okonkwo",
    patientName: "T. Okonkwo",
    age: 82,
    gender: "Male",
    briefStatus: "ready",
    overnightChanges: ["2 new obs"],
    overnightDetail: "NEWS 4 → 6",
    flagCount: 1,
    flagSeverity: "critical",
  },
  {
    bed: "4B2",
    patientId: "s-khan",
    patientName: "S. Khan",
    age: 45,
    gender: "Female",
    briefStatus: "ready",
    overnightChanges: ["New labs ↑"],
    overnightDetail: "",
    flagCount: 3,
    flagSeverity: "high",
  },
  {
    bed: "4B3",
    patientId: "r-singh",
    patientName: "R. Singh",
    age: 61,
    gender: "Male",
    briefStatus: "ready",
    overnightChanges: ["Creatinine 201 ↑"],
    overnightDetail: "AKI Stage 1 Detected",
    flagCount: 2,
    flagSeverity: "critical",
  },
  {
    bed: "4B4",
    patientId: "m-davies",
    patientName: "M. Davies",
    age: 29,
    gender: "Female",
    briefStatus: "ready",
    overnightChanges: [],
    overnightDetail: "No significant change",
    flagCount: 0,
    flagSeverity: "none",
  },
];

const overnightEvents: OvernightEvent[] = [
  {
    patientName: "R. Singh",
    bed: "4B3",
    time: "04:12",
    severity: "critical",
    title: "CRITICAL LAB ALERT",
    description:
      "Creatinine increased from 115 to 201 µmol/L (AKI Stage 1). Potassium 5.4. No change in urine output noted in nursing notes.",
  },
  {
    patientName: "T. Okonkwo",
    bed: "4B1",
    time: "03:45",
    severity: "high",
    title: "OBSERVATION TREND",
    description:
      "NEWS score escalated from 4 to 6. Tachycardia (112) and slight drop in O2 sats (93% on air). RMO reviewed and increased supplemental O2.",
  },
  {
    patientName: "M. Davies",
    bed: "4B4",
    time: "01:20",
    severity: "low",
    title: "CLINICAL NOTE",
    description:
      "Patient slept well. PRN analgesic administered for minor abdominal pain at 00:30. Effectively settled.",
  },
];

/* ───── Treatment Relationships ───── */

export interface TreatmentRelationship {
  patientId: string;
  clinicianId: string;
  clinicianName: string;
  relationshipType: "ward_doctor" | "referral" | "emergency" | "break_glass";
  validFrom: string;
  validUntil: string | null;
  status: "active" | "expired";
}

const treatmentRelationships: TreatmentRelationship[] = [
  { patientId: "j-patel", clinicianId: "clin-henderson-001", clinicianName: "Dr. Henderson", relationshipType: "ward_doctor", validFrom: "2026-06-01T00:00:00Z", validUntil: null, status: "active" },
  { patientId: "t-okonkwo", clinicianId: "clin-henderson-001", clinicianName: "Dr. Henderson", relationshipType: "ward_doctor", validFrom: "2026-06-01T00:00:00Z", validUntil: null, status: "active" },
  { patientId: "r-singh", clinicianId: "clin-henderson-001", clinicianName: "Dr. Henderson", relationshipType: "ward_doctor", validFrom: "2026-06-01T00:00:00Z", validUntil: null, status: "active" },
  { patientId: "m-davies", clinicianId: "clin-henderson-001", clinicianName: "Dr. Henderson", relationshipType: "ward_doctor", validFrom: "2026-06-01T00:00:00Z", validUntil: null, status: "active" },
  { patientId: "m-alfarsi", clinicianId: "clin-andrew-001", clinicianName: "Dr. Andrew", relationshipType: "ward_doctor", validFrom: "2026-06-01T00:00:00Z", validUntil: null, status: "active" },
  { patientId: "s-khan", clinicianId: "clin-andrew-001", clinicianName: "Dr. Andrew", relationshipType: "emergency", validFrom: "2026-06-01T00:00:00Z", validUntil: null, status: "active" },
  { patientId: "s-khan", clinicianId: "clin-henderson-001", clinicianName: "Dr. Henderson", relationshipType: "referral", validFrom: "2026-06-03T00:00:00Z", validUntil: "2026-06-10T00:00:00Z", status: "active" },
];

export function verifyTreatmentRelationship(clinicianId: string, patientId: string): { allowed: boolean; reason?: string } {
  const rel = treatmentRelationships.find(
    (r) => r.patientId === patientId && r.clinicianId === clinicianId && r.status === "active"
  );
  if (!rel) return { allowed: false, reason: "no_treatment_relationship" };
  if (rel.validUntil && new Date(rel.validUntil) < new Date()) return { allowed: false, reason: "relationship_expired" };
  return { allowed: true };
}

export function getClinicianPatients(clinicianId: string): string[] {
  return treatmentRelationships
    .filter((r) => r.clinicianId === clinicianId && r.status === "active")
    .map((r) => r.patientId);
}

const clinicalFlags: ClinicalFlag[] = [
  {
    id: "flag-001",
    patientId: "j-patel",
    patientName: "J. Patel",
    flagType: "allergy_conflict",
    severity: "critical",
    description:
      "Prescribed Penicillin (V-Cil-K) despite recorded allergy to Penicillins. Brief generation flagged clinical risk.",
    source: "EPIC / Medication-Admin-Log v1.4",
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: "2026-06-03T07:45:00Z",
  },
  {
    id: "flag-002",
    patientId: "s-khan",
    patientName: "S. Khan",
    flagType: "med_discrepancy",
    severity: "high",
    description:
      "Metformin dose mismatch between GP record (1000mg BD) and discharge summary (500mg BD). Source reconciliation required.",
    source: "GP Connect / SystmOne v4.2",
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: "2026-06-03T06:30:00Z",
  },
  {
    id: "flag-003",
    patientId: "s-khan",
    patientName: "S. Khan",
    flagType: "contraindication",
    severity: "critical",
    description:
      "Active CKD Stage 3 with eGFR 48. Metformin requires dose review at eGFR < 45. Approaching threshold.",
    source: "PathologyLIS / Renal Panel",
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: "2026-06-03T04:15:00Z",
  },
];

const patientDetails: Record<string, PatientDetail> = {
  "j-patel": {
    id: "j-patel",
    name: "J. Patel",
    fullName: "Jayesh Patel",
    nhsNumber: "482 192 1121",
    dateOfBirth: "12 March 1958",
    age: 68,
    gender: "Male",
    department: "Cardiology",
    clinician: "Dr. Henderson",
    allergies: [
      { name: "Penicillin", severity: "critical", reaction: "Anaphylaxis" },
      { name: "Latex", severity: "high", reaction: "Contact dermatitis" },
    ],
    conditions: [
      { name: "Atrial Fibrillation", status: "Active", onset: "2019", icd10: "I48.91" },
      { name: "Mitral Valve Regurgitation", status: "Monitoring", onset: "2021", icd10: "I34.0" },
      { name: "Hypercholesterolemia", status: "Active", onset: "2015", icd10: "E78.0" },
    ],
    medications: [
      { name: "Apixaban", dose: "5mg", route: "Oral", frequency: "BD", status: "Active" },
      { name: "Bisoprolol", dose: "2.5mg", route: "Oral", frequency: "OD", status: "Active" },
      { name: "Atorvastatin", dose: "40mg", route: "Oral", frequency: "ON", status: "Active" },
    ],
    investigations: [
      { name: "ECG — 12 Lead", result: "AF with controlled rate (72bpm)", date: "2026-06-02", status: "Completed" },
      { name: "Echocardiogram", result: "Moderate MR, LVEF 55%", date: "2026-06-01", status: "Completed" },
      { name: "Troponin I", result: "< 14 ng/L (Normal)", date: "2026-06-03", status: "Completed" },
    ],
    warnings: [
      { type: "critical", title: "Critical Allergy Conflict", description: "Penicillin allergy — Anaphylaxis risk. Active prescription flagged." },
      { type: "restricted", title: "Restricted: Mental Health Tier 3", description: "Mental health records restricted under separate consent. Not included in this brief." },
    ],
  },
  "s-khan": {
    id: "s-khan",
    name: "S. Khan",
    fullName: "Samira Khan",
    nhsNumber: "109 332 9456",
    dateOfBirth: "15 April 1981",
    age: 45,
    gender: "Female",
    department: "Emergency Medicine",
    clinician: "Dr. Andrew",
    allergies: [
      { name: "Aspirin", severity: "high", reaction: "Asthma exacerbation" },
    ],
    conditions: [
      { name: "Type 2 Diabetes Mellitus", status: "Active", onset: "2018", icd10: "E11.9" },
      { name: "CKD Stage 3", status: "Active", onset: "2022", icd10: "N18.3" },
      { name: "Hypercholesterolemia", status: "Active", onset: "2019", icd10: "E78.0" },
    ],
    medications: [
      { name: "Metformin", dose: "1000mg", route: "Oral", frequency: "BD", status: "Active" },
      { name: "Atorvastatin", dose: "20mg", route: "Oral", frequency: "ON", status: "Active" },
      { name: "Ramipril", dose: "5mg", route: "Oral", frequency: "OD", status: "Active" },
    ],
    investigations: [
      { name: "Serum Creatinine", result: "142 µmol/L", date: "2026-06-03", status: "Completed" },
      { name: "eGFR", result: "48 mL/min", date: "2026-06-03", status: "Completed" },
      { name: "HbA1c", result: "62 mmol/mol (7.8%)", date: "2026-05-28", status: "Completed" },
    ],
    warnings: [
      { type: "critical", title: "Medication Discrepancy", description: "Metformin dose mismatch between GP record and discharge summary. Reconciliation required." },
    ],
  },
  "t-okonkwo": {
    id: "t-okonkwo",
    name: "T. Okonkwo",
    fullName: "Tunde Okonkwo",
    nhsNumber: "739 441 8823",
    dateOfBirth: "03 November 1944",
    age: 82,
    gender: "Male",
    department: "General Medicine",
    clinician: "Dr. Henderson",
    allergies: [],
    conditions: [
      { name: "COPD", status: "Active", onset: "2012", icd10: "J44.1" },
      { name: "Hypertension", status: "Active", onset: "2008", icd10: "I10" },
      { name: "Osteoarthritis", status: "Active", onset: "2016", icd10: "M17.1" },
    ],
    medications: [
      { name: "Salbutamol Inhaler", dose: "100mcg", route: "Inhalation", frequency: "PRN", status: "PRN" },
      { name: "Tiotropium", dose: "18mcg", route: "Inhalation", frequency: "OD", status: "Active" },
      { name: "Amlodipine", dose: "5mg", route: "Oral", frequency: "OD", status: "Active" },
      { name: "Paracetamol", dose: "1g", route: "Oral", frequency: "QDS PRN", status: "PRN" },
    ],
    investigations: [
      { name: "Chest X-Ray", result: "Hyperinflated lungs, no consolidation", date: "2026-06-02", status: "Completed" },
      { name: "ABG", result: "pH 7.38, pCO2 5.8, pO2 9.1", date: "2026-06-03", status: "Completed" },
      { name: "FBC", result: "WCC 11.2, Hb 128, Plt 245", date: "2026-06-03", status: "Completed" },
    ],
    warnings: [],
  },
  "r-singh": {
    id: "r-singh",
    name: "R. Singh",
    fullName: "Rajinder Singh",
    nhsNumber: "284 109 5567",
    dateOfBirth: "30 June 1965",
    age: 61,
    gender: "Male",
    department: "General Medicine",
    clinician: "Dr. Henderson",
    allergies: [
      { name: "Codeine", severity: "medium", reaction: "Nausea/vomiting" },
    ],
    conditions: [
      { name: "AKI Stage 1", status: "Active", onset: "2026", icd10: "N17.9" },
      { name: "Type 2 Diabetes Mellitus", status: "Active", onset: "2014", icd10: "E11.9" },
      { name: "Benign Prostatic Hyperplasia", status: "Active", onset: "2020", icd10: "N40.0" },
    ],
    medications: [
      { name: "IV Normal Saline", dose: "1L", route: "IV", frequency: "8-hourly", status: "Active" },
      { name: "Gliclazide", dose: "80mg", route: "Oral", frequency: "BD", status: "Active" },
      { name: "Tamsulosin", dose: "400mcg", route: "Oral", frequency: "OD", status: "Active" },
    ],
    investigations: [
      { name: "Serum Creatinine", result: "201 µmol/L (↑ from 115)", date: "2026-06-03", status: "Completed" },
      { name: "Potassium", result: "5.4 mmol/L (High)", date: "2026-06-03", status: "Completed" },
      { name: "Urine Output", result: "Monitoring — 35ml/hr", date: "2026-06-03", status: "Pending" },
    ],
    warnings: [
      { type: "critical", title: "AKI Stage 1 Detected", description: "Creatinine rise from 115 to 201. Nephrotoxic drugs review required. Hold ACE inhibitors and NSAIDs." },
    ],
  },
  "m-alfarsi": {
    id: "m-alfarsi",
    name: "M. Al-Farsi",
    fullName: "Mohammed Al-Farsi",
    nhsNumber: "591 231 0081",
    dateOfBirth: "22 August 1975",
    age: 51,
    gender: "Male",
    department: "General Medicine",
    clinician: "Dr. Andrew",
    allergies: [],
    conditions: [
      { name: "Community Acquired Pneumonia", status: "Active", onset: "2026", icd10: "J18.9" },
      { name: "Asthma", status: "Active", onset: "2005", icd10: "J45.2" },
    ],
    medications: [
      { name: "Amoxicillin", dose: "500mg", route: "Oral", frequency: "TDS", status: "Active" },
      { name: "Clarithromycin", dose: "500mg", route: "Oral", frequency: "BD", status: "Active" },
      { name: "Salbutamol Nebuliser", dose: "5mg", route: "Nebulisation", frequency: "QDS", status: "Active" },
    ],
    investigations: [
      { name: "Chest X-Ray", result: "Right lower lobe consolidation", date: "2026-06-02", status: "Completed" },
      { name: "CRP", result: "89 mg/L (High)", date: "2026-06-03", status: "Completed" },
      { name: "Blood Cultures", result: "Pending", date: "2026-06-02", status: "Pending" },
    ],
    warnings: [],
  },
  "m-davies": {
    id: "m-davies",
    name: "M. Davies",
    fullName: "Megan Davies",
    nhsNumber: "601 778 2340",
    dateOfBirth: "14 February 1997",
    age: 29,
    gender: "Female",
    department: "General Surgery",
    clinician: "Dr. Henderson",
    allergies: [],
    conditions: [
      { name: "Appendicitis (Post-Op)", status: "Resolved", onset: "2026", icd10: "K35.8" },
    ],
    medications: [
      { name: "Paracetamol", dose: "1g", route: "Oral", frequency: "QDS PRN", status: "PRN" },
      { name: "Ibuprofen", dose: "400mg", route: "Oral", frequency: "TDS", status: "Active" },
    ],
    investigations: [
      { name: "FBC", result: "WCC 8.2, Hb 135, Plt 310", date: "2026-06-02", status: "Completed" },
      { name: "CRP", result: "12 mg/L (Improving)", date: "2026-06-03", status: "Completed" },
    ],
    warnings: [],
  },
};

const emergencyData: EmergencyData = {
  patientId: "s-khan",
  patientName: "S. Khan",
  loadingSources: { current: 4, total: 5 },
  allergies: [
    { name: "Penicillin", severity: "critical", reaction: "Anaphylaxis" },
    { name: "Aspirin", severity: "high", reaction: "Asthma exacerbation" },
  ],
  criticalFlags: [
    { title: "DNACPR", detail: "Do Not Attempt CPR — Signed 2024-01-15", code: "ReSPECT" },
    { title: "High Falls Risk", detail: "Waterlow Score 22 — Very High Risk", code: "NICE CG161" },
  ],
  medications: [
    { name: "Warfarin", dose: "5mg", frequency: "OD", category: "Anticoagulant" },
    { name: "Metformin", dose: "1000mg", frequency: "BD", category: "Antidiabetic" },
    { name: "Bisoprolol", dose: "2.5mg", frequency: "OD", category: "Beta-Blocker" },
    { name: "Atorvastatin", dose: "40mg", frequency: "ON", category: "Statin" },
  ],
  conditions: [
    { name: "T2DM", status: "Active" },
    { name: "CKD Stage 3", status: "Active" },
    { name: "Hypercholesterolemia", status: "Active" },
  ],
  labs: [
    { name: "Serum Creatinine", value: "142", unit: "µmol/L", trend: "up" },
    { name: "eGFR", value: "48", unit: "mL/min", trend: "down" },
    { name: "HbA1c", value: "62", unit: "mmol/mol", trend: "stable" },
  ],
  blockedTiers: "T3–T5 sensitive records blocked. Override requires Break-Glass authorisation.",
};

/* ───── Mutable State ───── */

let auditLogs: AuditLog[] = [
  {
    id: 1,
    actorId: "clin-andrew-001",
    actorName: "Dr. Andrew",
    actorRole: "emergency_physician",
    action: "auth.login.success",
    resourceType: "session",
    resourceId: "sess-001",
    patientId: null,
    accessResult: "granted",
    sensitivityTier: null,
    timestamp: "2026-06-03T07:30:00Z",
  },
];

let nextAuditId = 2;

/* ───── Query Functions ───── */

export function getPatients(): Patient[] {
  return patients;
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getPatientDetail(id: string): PatientDetail | undefined {
  const raw = patientDetails[id];
  if (!raw) return undefined;
  return { ...raw };
}

const tier3PatientIds: Record<string, string[]> = {
  "j-patel": ["Mental health records"],
  "s-khan": ["Substance use treatment records"],
};

export function filterPatientByTier(
  patient: PatientDetail,
  tier3Authorized: boolean
): { patient: PatientDetail; blockedTiers: number[] } {
  const blockedTiers: number[] = [];

  if (!tier3Authorized && tier3PatientIds[patient.id]) {
    blockedTiers.push(3);
    const blockedLabel = tier3PatientIds[patient.id][0];

    return {
      patient: {
        ...patient,
        conditions: patient.conditions.filter((c) => !c.name.includes("Mental") && !c.name.includes("Substance")),
        medications: patient.medications.filter((m) => !m.name.includes("Antidepressant") && !m.name.includes("Methadone")),
        investigations: patient.investigations.filter((i) => !i.name.includes("Psychiatric")),
        warnings: [
          ...patient.warnings.filter((w) => w.type !== "restricted"),
          {
            type: "restricted",
            title: `Tier 3 Records Blocked: ${blockedLabel}`,
            description: `${blockedLabel} are restricted under separate consent and are not included in this brief.`,
          },
        ],
      },
      blockedTiers,
    };
  }

  return { patient: { ...patient }, blockedTiers };
}

export function getEncounters(): Encounter[] {
  return encounters;
}

export function getWardBeds(): WardBed[] {
  return wardBeds;
}

export function getOvernightEvents(): OvernightEvent[] {
  return overnightEvents;
}

export function getClinicalFlags(): ClinicalFlag[] {
  return clinicalFlags;
}

export function getClinicalFlagsByPatient(patientId: string): ClinicalFlag[] {
  return clinicalFlags.filter((f) => f.patientId === patientId);
}

export function getAuditLogs(): AuditLog[] {
  return auditLogs;
}

export function getEmergencyData(): EmergencyData {
  return emergencyData;
}

/* ───── Opaque ID Mapping ───── */

const opaqueIdMap: Record<string, string> = {
  "enc_a7f3b9c2": "j-patel",
  "enc_b8d4e0f3": "m-alfarsi",
  "enc_c9e5f1a4": "s-khan",
  "enc_d0f6a2b5": "t-okonkwo",
  "enc_e1a7b3c6": "r-singh",
  "enc_f2b8c4d7": "m-davies",
};

const reverseOpaqueMap: Record<string, string> = {};
for (const [opaque, internal] of Object.entries(opaqueIdMap)) {
  reverseOpaqueMap[internal] = opaque;
}

export function resolvePatientId(input: string): string | undefined {
  if (opaqueIdMap[input]) return opaqueIdMap[input];
  if (patients.find((p) => p.id === input)) return input;
  return undefined;
}

export function getOpaqueId(internalId: string): string | undefined {
  return reverseOpaqueMap[internalId];
}

/* ───── Mutation Functions ───── */

export function createAuditLog(entry: Omit<AuditLog, "id" | "timestamp">): AuditLog {
  const log: AuditLog = {
    ...entry,
    id: nextAuditId++,
    timestamp: new Date().toISOString(),
  };
  auditLogs.push(log);
  return log;
}

export function generateBriefsForWard(): WardBed[] {
  // Simulate AI generating briefs — flip all syncing beds to ready
  for (const bed of wardBeds) {
    if (bed.briefStatus === "syncing") {
      bed.briefStatus = "ready";
    }
  }
  // Also update encounter brief statuses
  for (const enc of encounters) {
    if (enc.briefStatus === "syncing") {
      enc.briefStatus = "ready";
      enc.briefPercentage = 100;
    }
  }
  return wardBeds;
}

export function acknowledgeClinicalFlag(flagId: string, clinicianName: string): ClinicalFlag | undefined {
  const flag = clinicalFlags.find((f) => f.id === flagId);
  if (flag) {
    flag.acknowledgedBy = clinicianName;
    flag.acknowledgedAt = new Date().toISOString();
  }
  return flag;
}
