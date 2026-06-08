import { supabase } from "./supabase";

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

export interface TreatmentRelationship {
  patientId: string;
  clinicianId: string;
  clinicianName: string;
  relationshipType: "ward_doctor" | "referral" | "emergency" | "break_glass";
  validFrom: string;
  validUntil: string | null;
  status: "active" | "expired";
}

export interface BreakGlassEvent {
  id: string;
  clinicianId: string;
  clinicianName: string;
  patientId: string;
  patientName: string;
  justification: string;
  createdAt: string;
  expiresAt: string;
  privacyOfficerNotified: boolean;
  reviewStatus: "pending" | "justified" | "unjustified";
}

/* ───── Helpers ───── */

function mapPatient(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    nhsNumber: row.nhs_number,
    dateOfBirth: row.date_of_birth,
    age: row.age,
    gender: row.gender,
    avatarColor: row.avatar_color,
    avatarTextColor: row.avatar_text_color,
    consentStatus: row.consent_status,
    organisationId: row.organisation_id,
  };
}

function mapEncounter(row: any): Encounter {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientInitials: row.patient_initials,
    nhsNumber: row.nhs_number,
    encounterType: row.encounter_type,
    department: row.department,
    status: row.status,
    statusLabel: row.status_label,
    statusColor: row.status_color,
    borderColor: row.border_color,
    briefStatus: row.brief_status,
    briefPercentage: row.brief_percentage,
    flagCount: row.flag_count,
    avatarColor: row.avatar_color,
    avatarTextColor: row.avatar_text_color,
  };
}

function mapWardBed(row: any): WardBed {
  return {
    bed: row.bed,
    patientId: row.patient_id,
    patientName: row.patient_name,
    age: row.age,
    gender: row.gender,
    briefStatus: row.brief_status,
    overnightChanges: parseJSON(row.overnight_changes),
    overnightDetail: row.overnight_detail,
    flagCount: row.flag_count,
    flagSeverity: row.flag_severity,
  };
}

function mapOvernightEvent(row: any): OvernightEvent {
  return {
    patientName: row.patient_name,
    bed: row.bed,
    time: row.time,
    severity: row.severity,
    title: row.title,
    description: row.description,
  };
}

function mapClinicalFlag(row: any): ClinicalFlag {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    flagType: row.flag_type,
    severity: row.severity,
    description: row.description,
    source: row.source,
    acknowledgedBy: row.acknowledged_by,
    acknowledgedAt: row.acknowledged_at ? row.acknowledged_at : null,
    createdAt: row.created_at,
  };
}

function mapAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    patientId: row.patient_id ?? null,
    accessResult: row.access_result,
    sensitivityTier: row.sensitivity_tier ?? null,
    timestamp: row.timestamp,
  };
}

function parseJSON(value: any): any {
  if (typeof value === "string") return JSON.parse(value);
  return value ?? [];
}

function mapPatientDetail(row: any): PatientDetail {
  return {
    id: row.id,
    name: row.full_name,
    fullName: row.full_name,
    nhsNumber: row.nhs_number,
    dateOfBirth: row.date_of_birth,
    age: row.age,
    gender: row.gender,
    department: row.department,
    clinician: row.clinician,
    allergies: parseJSON(row.allergies),
    conditions: parseJSON(row.conditions),
    medications: parseJSON(row.medications),
    investigations: parseJSON(row.investigations),
    warnings: parseJSON(row.warnings),
  };
}

/* ───── Opaque ID Mapping ───── */

const opaqueIdMap: Record<string, string> = {
  "enc_a7f3b9c2": "j-wilson",
  "enc_b8d4e0f3": "m-thompson",
  "enc_c9e5f1a4": "r-johnson",
  "enc_d0f6a2b5": "d-brown",
  "enc_e1a7b3c6": "w-davis",
  "enc_f2b8c4d7": "s-miller",
};

const reverseOpaqueMap: Record<string, string> = {};
for (const [opaque, internal] of Object.entries(opaqueIdMap)) {
  reverseOpaqueMap[internal] = opaque;
}

export async function resolvePatientId(input: string): Promise<string | undefined> {
  if (opaqueIdMap[input]) return opaqueIdMap[input];
  const { data } = await supabase.from("patients").select("id").eq("id", input).single();
  return data?.id ?? undefined;
}

export function getOpaqueId(internalId: string): string | undefined {
  return reverseOpaqueMap[internalId];
}

/* ───── Query Functions ───── */

export async function getPatients(): Promise<Patient[]> {
  const { data } = await supabase.from("patients").select("*");
  return (data ?? []).map(mapPatient);
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const { data } = await supabase.from("patients").select("*").eq("id", id).single();
  return data ? mapPatient(data) : undefined;
}

export async function getPatientDetail(id: string): Promise<PatientDetail | undefined> {
  const { data } = await supabase.from("patient_details").select("*").eq("id", id).single();
  return data ? mapPatientDetail(data) : undefined;
}

const tier3PatientIds: Record<string, string[]> = {
  "j-wilson": ["Mental health records"],
  "r-johnson": ["Substance use treatment records"],
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
        conditions: patient.conditions.filter(
          (c) => !c.name.includes("Mental") && !c.name.includes("Substance")
        ),
        medications: patient.medications.filter(
          (m) => !m.name.includes("Antidepressant") && !m.name.includes("Methadone")
        ),
        investigations: patient.investigations.filter(
          (i) => !i.name.includes("Psychiatric")
        ),
        warnings: [
          ...patient.warnings.filter((w) => w.type !== "restricted"),
          {
            type: "restricted" as const,
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

export async function getEncounters(): Promise<Encounter[]> {
  const { data } = await supabase.from("encounters").select("*");
  return (data ?? []).map(mapEncounter);
}

export async function getWardBeds(): Promise<WardBed[]> {
  const { data } = await supabase.from("ward_beds").select("*");
  return (data ?? []).map(mapWardBed);
}

export async function getOvernightEvents(): Promise<OvernightEvent[]> {
  const { data } = await supabase.from("overnight_events").select("*").order("id", { ascending: false });
  return (data ?? []).map(mapOvernightEvent);
}

export async function getClinicalFlags(): Promise<ClinicalFlag[]> {
  const { data } = await supabase.from("clinical_flags").select("*");
  return (data ?? []).map(mapClinicalFlag);
}

export async function getClinicalFlagsByPatient(patientId: string): Promise<ClinicalFlag[]> {
  const { data } = await supabase.from("clinical_flags").select("*").eq("patient_id", patientId);
  return (data ?? []).map(mapClinicalFlag);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data } = await supabase.from("audit_logs").select("*").order("id", { ascending: false });
  return (data ?? []).map(mapAuditLog);
}

export function getEmergencyData(): EmergencyData {
  return {
    patientId: "r-johnson",
    patientName: "R. Johnson",
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
}

/* ───── Treatment Relationship ───── */

export async function verifyTreatmentRelationship(
  clinicianId: string,
  patientId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const { data, error } = await supabase
    .from("treatment_relationships")
    .select("*")
    .eq("patient_id", patientId)
    .eq("clinician_id", clinicianId)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return { allowed: false, reason: "no_treatment_relationship" };
  }
  if (data.valid_until && new Date(data.valid_until) < new Date()) {
    return { allowed: false, reason: "relationship_expired" };
  }
  return { allowed: true };
}

export async function getClinicianPatients(clinicianId: string): Promise<string[]> {
  const { data } = await supabase
    .from("treatment_relationships")
    .select("patient_id")
    .eq("clinician_id", clinicianId)
    .eq("status", "active");

  return (data ?? []).map((r: any) => r.patient_id);
}

/* ───── Mutation Functions ───── */

export async function createAuditLog(
  entry: Omit<AuditLog, "id" | "timestamp">
): Promise<AuditLog> {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      actor_id: entry.actorId,
      actor_name: entry.actorName,
      actor_role: entry.actorRole,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      patient_id: entry.patientId ?? null,
      access_result: entry.accessResult,
      sensitivity_tier: entry.sensitivityTier ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to create audit log:", error);
    throw new Error("Failed to create audit log");
  }
  return mapAuditLog(data);
}

export async function generateBriefsForWard(): Promise<WardBed[]> {
  const { data: beds } = await supabase
    .from("ward_beds")
    .select("*")
    .eq("brief_status", "syncing");

  if (beds && beds.length > 0) {
    const syncingIds = beds.map((b: any) => b.bed);
    await supabase
      .from("ward_beds")
      .update({ brief_status: "ready" })
      .in("bed", syncingIds);
  }

  await supabase
    .from("encounters")
    .update({ brief_status: "ready", brief_percentage: 100 })
    .eq("brief_status", "syncing");

  const { data: allBeds } = await supabase.from("ward_beds").select("*");
  return (allBeds ?? []).map(mapWardBed);
}

export async function acknowledgeClinicalFlag(
  flagId: string,
  clinicianName: string
): Promise<ClinicalFlag | undefined> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("clinical_flags")
    .update({ acknowledged_by: clinicianName, acknowledged_at: now })
    .eq("id", flagId)
    .select()
    .single();

  if (error || !data) return undefined;
  return mapClinicalFlag(data);
}

/* ───── Break-Glass ───── */

export async function createBreakGlassEvent(
  clinicianId: string,
  clinicianName: string,
  patientId: string,
  patientName: string,
  justification: string
): Promise<BreakGlassEvent | { error: string }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("break_glass_events")
    .select("*", { count: "exact", head: true })
    .eq("clinician_id", clinicianId)
    .gte("created_at", thirtyDaysAgo);

  if (count && count >= 3) {
    return { error: "Break-Glass limit reached (max 3 per 30 days)" };
  }

  const eventId = `bg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const event: BreakGlassEvent = {
    id: eventId,
    clinicianId,
    clinicianName,
    patientId,
    patientName,
    justification,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    privacyOfficerNotified: true,
    reviewStatus: "pending",
  };

  const { error: bgError } = await supabase.from("break_glass_events").insert({
    id: eventId,
    clinician_id: clinicianId,
    clinician_name: clinicianName,
    patient_id: patientId,
    patient_name: patientName,
    justification,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    privacy_officer_notified: true,
    review_status: "pending",
  });

  if (bgError) {
    console.error("Failed to create break-glass event:", bgError);
    return { error: "Failed to create break-glass event" };
  }

  const { error: trError } = await supabase.from("treatment_relationships").insert({
    patient_id: patientId,
    clinician_id: clinicianId,
    clinician_name: clinicianName,
    relationship_type: "break_glass",
    valid_from: now.toISOString(),
    valid_until: expiresAt.toISOString(),
    status: "active",
  });

  if (trError) {
    console.error("Failed to create temp treatment relationship:", trError);
  }

  await createAuditLog({
    actorId: clinicianId,
    actorName: clinicianName,
    actorRole: "specialist",
    action: "break_glass.initiated",
    resourceType: "patient_brief",
    resourceId: patientId,
    patientId,
    accessResult: "break_glass",
    sensitivityTier: 2,
  });

  return event;
}

export async function getActiveBreakGlass(
  clinicianId: string,
  patientId: string
): Promise<BreakGlassEvent | undefined> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("break_glass_events")
    .select("*")
    .eq("clinician_id", clinicianId)
    .eq("patient_id", patientId)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return undefined;
  return {
    id: data.id,
    clinicianId: data.clinician_id,
    clinicianName: data.clinician_name,
    patientId: data.patient_id,
    patientName: data.patient_name,
    justification: data.justification,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    privacyOfficerNotified: data.privacy_officer_notified,
    reviewStatus: data.review_status,
  };
}

export async function getAllBreakGlassEvents(): Promise<BreakGlassEvent[]> {
  const { data } = await supabase
    .from("break_glass_events")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row: any) => ({
    id: row.id,
    clinicianId: row.clinician_id,
    clinicianName: row.clinician_name,
    patientId: row.patient_id,
    patientName: row.patient_name,
    justification: row.justification,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    privacyOfficerNotified: row.privacy_officer_notified,
    reviewStatus: row.review_status,
  }));
}
