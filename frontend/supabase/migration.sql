-- ClinIQ Supabase Schema + Seed Data
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/snskgtwjfughzgfhuxsj/sql/new)

-- ───── 1. TABLES ─────

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  nhs_number TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  avatar_color TEXT NOT NULL,
  avatar_text_color TEXT NOT NULL,
  consent_status TEXT NOT NULL DEFAULT 'active' CHECK (consent_status IN ('active', 'opted_out', 'restricted')),
  organisation_id TEXT NOT NULL DEFAULT 'nhs-trust-001'
);

CREATE TABLE IF NOT EXISTS patient_details (
  id TEXT PRIMARY KEY REFERENCES patients(id),
  full_name TEXT NOT NULL,
  nhs_number TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  department TEXT NOT NULL,
  clinician TEXT NOT NULL,
  allergies JSONB NOT NULL DEFAULT '[]',
  conditions JSONB NOT NULL DEFAULT '[]',
  medications JSONB NOT NULL DEFAULT '[]',
  investigations JSONB NOT NULL DEFAULT '[]',
  warnings JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS encounters (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  patient_name TEXT NOT NULL,
  patient_initials TEXT NOT NULL,
  nhs_number TEXT NOT NULL,
  encounter_type TEXT NOT NULL CHECK (encounter_type IN ('emergency', 'outpatient', 'inpatient', 'referral', 'ward_round')),
  department TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('admitted', 'labs_pending', 'urgent', 'scheduled', 'discharged')),
  status_label TEXT NOT NULL,
  status_color TEXT NOT NULL,
  border_color TEXT NOT NULL,
  brief_status TEXT NOT NULL DEFAULT 'pending' CHECK (brief_status IN ('ready', 'syncing', 'error', 'pending')),
  brief_percentage INTEGER NOT NULL DEFAULT 0,
  flag_count INTEGER NOT NULL DEFAULT 0,
  avatar_color TEXT NOT NULL,
  avatar_text_color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ward_beds (
  bed TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  patient_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  brief_status TEXT NOT NULL DEFAULT 'pending' CHECK (brief_status IN ('ready', 'syncing', 'error', 'pending')),
  overnight_changes JSONB NOT NULL DEFAULT '[]',
  overnight_detail TEXT NOT NULL DEFAULT '',
  flag_count INTEGER NOT NULL DEFAULT 0,
  flag_severity TEXT NOT NULL DEFAULT 'none' CHECK (flag_severity IN ('critical', 'high', 'medium', 'low', 'none'))
);

CREATE TABLE IF NOT EXISTS overnight_events (
  id SERIAL PRIMARY KEY,
  patient_name TEXT NOT NULL,
  bed TEXT NOT NULL,
  time TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clinical_flags (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  patient_name TEXT NOT NULL,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('allergy_conflict', 'med_discrepancy', 'duplicate_test', 'missing_result', 'contraindication')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatment_relationships (
  id SERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  clinician_id TEXT NOT NULL,
  clinician_name TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('ward_doctor', 'referral', 'emergency', 'break_glass')),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  patient_id TEXT,
  access_result TEXT NOT NULL CHECK (access_result IN ('granted', 'denied', 'break_glass')),
  sensitivity_tier INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS break_glass_events (
  id TEXT PRIMARY KEY,
  clinician_id TEXT NOT NULL,
  clinician_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  justification TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  privacy_officer_notified BOOLEAN NOT NULL DEFAULT TRUE,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'justified', 'unjustified'))
);

CREATE TABLE IF NOT EXISTS app_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data_source TEXT NOT NULL DEFAULT 'live',
  fhir_base_url TEXT NOT NULL DEFAULT '',
  gp_connect_endpoint TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  groq_api_key TEXT NOT NULL DEFAULT '',
  current_clinician_id TEXT NOT NULL DEFAULT 'clin-henderson-001',
  current_clinician_name TEXT NOT NULL DEFAULT 'Dr. Henderson',
  current_clinician_role TEXT NOT NULL DEFAULT 'specialist' CHECK (current_clinician_role IN ('emergency_physician', 'gp', 'specialist', 'pharmacist', 'nurse', 'ward_doctor', 'admin', 'privacy_officer')),
  tier3_authorized BOOLEAN NOT NULL DEFAULT FALSE
);

-- ───── 2. SEED DATA ─────

-- Patients
INSERT INTO patients (id, name, initials, nhs_number, date_of_birth, age, gender, avatar_color, avatar_text_color, consent_status, organisation_id) VALUES
  ('j-patel', 'J. Patel', 'JP', '482-192-1121', '1958-03-12', 68, 'Male', '#D6E8FA', '#2E7DD1', 'active', 'nhs-trust-001'),
  ('m-alfarsi', 'M. Al-Farsi', 'MA', '591-231-0081', '1975-08-22', 51, 'Male', '#FEF3C7', '#B45309', 'active', 'nhs-trust-001'),
  ('s-khan', 'S. Khan', 'SK', '109-332-9456', '1981-04-15', 45, 'Female', '#FEE2E2', '#D92B2B', 'active', 'nhs-trust-001'),
  ('t-okonkwo', 'T. Okonkwo', 'TO', '739-441-8823', '1944-11-03', 82, 'Male', '#DBEAFE', '#1E40AF', 'active', 'nhs-trust-001'),
  ('r-singh', 'R. Singh', 'RS', '284-109-5567', '1965-06-30', 61, 'Male', '#F3E8FF', '#7C3AED', 'active', 'nhs-trust-001'),
  ('m-davies', 'M. Davies', 'MD', '601-778-2340', '1997-02-14', 29, 'Female', '#D1FAE5', '#059669', 'active', 'nhs-trust-001')
ON CONFLICT (id) DO NOTHING;

-- Patient Details
INSERT INTO patient_details (id, full_name, nhs_number, date_of_birth, age, gender, department, clinician, allergies, conditions, medications, investigations, warnings) VALUES
('j-patel', 'Jayesh Patel', '482 192 1121', '12 March 1958', 68, 'Male', 'Cardiology', 'Dr. Henderson',
  '[{"name": "Penicillin", "severity": "critical", "reaction": "Anaphylaxis"}, {"name": "Latex", "severity": "high", "reaction": "Contact dermatitis"}]',
  '[{"name": "Atrial Fibrillation", "status": "Active", "onset": "2019", "icd10": "I48.91"}, {"name": "Mitral Valve Regurgitation", "status": "Monitoring", "onset": "2021", "icd10": "I34.0"}, {"name": "Hypercholesterolemia", "status": "Active", "onset": "2015", "icd10": "E78.0"}]',
  '[{"name": "Apixaban", "dose": "5mg", "route": "Oral", "frequency": "BD", "status": "Active"}, {"name": "Bisoprolol", "dose": "2.5mg", "route": "Oral", "frequency": "OD", "status": "Active"}, {"name": "Atorvastatin", "dose": "40mg", "route": "Oral", "frequency": "ON", "status": "Active"}]',
  '[{"name": "ECG — 12 Lead", "result": "AF with controlled rate (72bpm)", "date": "2026-06-02", "status": "Completed"}, {"name": "Echocardiogram", "result": "Moderate MR, LVEF 55%", "date": "2026-06-01", "status": "Completed"}, {"name": "Troponin I", "result": "< 14 ng/L (Normal)", "date": "2026-06-03", "status": "Completed"}]',
  '[{"type": "critical", "title": "Critical Allergy Conflict", "description": "Penicillin allergy — Anaphylaxis risk. Active prescription flagged."}, {"type": "restricted", "title": "Restricted: Mental Health Tier 3", "description": "Mental health records restricted under separate consent. Not included in this brief."}]'),
('s-khan', 'Samira Khan', '109 332 9456', '15 April 1981', 45, 'Female', 'Emergency Medicine', 'Dr. Andrew',
  '[{"name": "Aspirin", "severity": "high", "reaction": "Asthma exacerbation"}]',
  '[{"name": "Type 2 Diabetes Mellitus", "status": "Active", "onset": "2018", "icd10": "E11.9"}, {"name": "CKD Stage 3", "status": "Active", "onset": "2022", "icd10": "N18.3"}, {"name": "Hypercholesterolemia", "status": "Active", "onset": "2019", "icd10": "E78.0"}]',
  '[{"name": "Metformin", "dose": "1000mg", "route": "Oral", "frequency": "BD", "status": "Active"}, {"name": "Atorvastatin", "dose": "20mg", "route": "Oral", "frequency": "ON", "status": "Active"}, {"name": "Ramipril", "dose": "5mg", "route": "Oral", "frequency": "OD", "status": "Active"}]',
  '[{"name": "Serum Creatinine", "result": "142 µmol/L", "date": "2026-06-03", "status": "Completed"}, {"name": "eGFR", "result": "48 mL/min", "date": "2026-06-03", "status": "Completed"}, {"name": "HbA1c", "result": "62 mmol/mol (7.8%)", "date": "2026-05-28", "status": "Completed"}]',
  '[{"type": "critical", "title": "Medication Discrepancy", "description": "Metformin dose mismatch between GP record and discharge summary. Reconciliation required."}]'),
('t-okonkwo', 'Tunde Okonkwo', '739 441 8823', '03 November 1944', 82, 'Male', 'General Medicine', 'Dr. Henderson',
  '[]',
  '[{"name": "COPD", "status": "Active", "onset": "2012", "icd10": "J44.1"}, {"name": "Hypertension", "status": "Active", "onset": "2008", "icd10": "I10"}, {"name": "Osteoarthritis", "status": "Active", "onset": "2016", "icd10": "M17.1"}]',
  '[{"name": "Salbutamol Inhaler", "dose": "100mcg", "route": "Inhalation", "frequency": "PRN", "status": "PRN"}, {"name": "Tiotropium", "dose": "18mcg", "route": "Inhalation", "frequency": "OD", "status": "Active"}, {"name": "Amlodipine", "dose": "5mg", "route": "Oral", "frequency": "OD", "status": "Active"}, {"name": "Paracetamol", "dose": "1g", "route": "Oral", "frequency": "QDS PRN", "status": "PRN"}]',
  '[{"name": "Chest X-Ray", "result": "Hyperinflated lungs, no consolidation", "date": "2026-06-02", "status": "Completed"}, {"name": "ABG", "result": "pH 7.38, pCO2 5.8, pO2 9.1", "date": "2026-06-03", "status": "Completed"}, {"name": "FBC", "result": "WCC 11.2, Hb 128, Plt 245", "date": "2026-06-03", "status": "Completed"}]',
  '[]'),
('r-singh', 'Rajinder Singh', '284 109 5567', '30 June 1965', 61, 'Male', 'General Medicine', 'Dr. Henderson',
  '[{"name": "Codeine", "severity": "medium", "reaction": "Nausea/vomiting"}]',
  '[{"name": "AKI Stage 1", "status": "Active", "onset": "2026", "icd10": "N17.9"}, {"name": "Type 2 Diabetes Mellitus", "status": "Active", "onset": "2014", "icd10": "E11.9"}, {"name": "Benign Prostatic Hyperplasia", "status": "Active", "onset": "2020", "icd10": "N40.0"}]',
  '[{"name": "IV Normal Saline", "dose": "1L", "route": "IV", "frequency": "8-hourly", "status": "Active"}, {"name": "Gliclazide", "dose": "80mg", "route": "Oral", "frequency": "BD", "status": "Active"}, {"name": "Tamsulosin", "dose": "400mcg", "route": "Oral", "frequency": "OD", "status": "Active"}]',
  '[{"name": "Serum Creatinine", "result": "201 µmol/L (↑ from 115)", "date": "2026-06-03", "status": "Completed"}, {"name": "Potassium", "result": "5.4 mmol/L (High)", "date": "2026-06-03", "status": "Completed"}, {"name": "Urine Output", "result": "Monitoring — 35ml/hr", "date": "2026-06-03", "status": "Pending"}]',
  '[{"type": "critical", "title": "AKI Stage 1 Detected", "description": "Creatinine rise from 115 to 201. Nephrotoxic drugs review required. Hold ACE inhibitors and NSAIDs."}]'),
('m-alfarsi', 'Mohammed Al-Farsi', '591 231 0081', '22 August 1975', 51, 'Male', 'General Medicine', 'Dr. Andrew',
  '[]',
  '[{"name": "Community Acquired Pneumonia", "status": "Active", "onset": "2026", "icd10": "J18.9"}, {"name": "Asthma", "status": "Active", "onset": "2005", "icd10": "J45.2"}]',
  '[{"name": "Amoxicillin", "dose": "500mg", "route": "Oral", "frequency": "TDS", "status": "Active"}, {"name": "Clarithromycin", "dose": "500mg", "route": "Oral", "frequency": "BD", "status": "Active"}, {"name": "Salbutamol Nebuliser", "dose": "5mg", "route": "Nebulisation", "frequency": "QDS", "status": "Active"}]',
  '[{"name": "Chest X-Ray", "result": "Right lower lobe consolidation", "date": "2026-06-02", "status": "Completed"}, {"name": "CRP", "result": "89 mg/L (High)", "date": "2026-06-03", "status": "Completed"}, {"name": "Blood Cultures", "result": "Pending", "date": "2026-06-02", "status": "Pending"}]',
  '[]'),
('m-davies', 'Megan Davies', '601 778 2340', '14 February 1997', 29, 'Female', 'General Surgery', 'Dr. Henderson',
  '[]',
  '[{"name": "Appendicitis (Post-Op)", "status": "Resolved", "onset": "2026", "icd10": "K35.8"}]',
  '[{"name": "Paracetamol", "dose": "1g", "route": "Oral", "frequency": "QDS PRN", "status": "PRN"}, {"name": "Ibuprofen", "dose": "400mg", "route": "Oral", "frequency": "TDS", "status": "Active"}]',
  '[{"name": "FBC", "result": "WCC 8.2, Hb 135, Plt 310", "date": "2026-06-02", "status": "Completed"}, {"name": "CRP", "result": "12 mg/L (Improving)", "date": "2026-06-03", "status": "Completed"}]',
  '[]')
ON CONFLICT (id) DO NOTHING;

-- Encounters
INSERT INTO encounters (id, patient_id, patient_name, patient_initials, nhs_number, encounter_type, department, status, status_label, status_color, border_color, brief_status, brief_percentage, flag_count, avatar_color, avatar_text_color) VALUES
  ('enc-001', 'j-patel', 'J. Patel', 'JP', '482-192-1121', 'inpatient', 'Cardiology', 'admitted', 'ADMITTED', 'bg-low-bg text-low-severity border border-outline-variant', 'border-green-500', 'ready', 100, 1, '#D6E8FA', '#2E7DD1'),
  ('enc-002', 'm-alfarsi', 'M. Al-Farsi', 'MA', '591-231-0081', 'inpatient', 'General Medicine', 'labs_pending', 'LABS PENDING', 'bg-high-bg text-high-severity border border-high-severity', 'border-yellow-500', 'syncing', 60, 0, '#FEF3C7', '#B45309'),
  ('enc-003', 's-khan', 'S. Khan', 'SK', '109-332-9456', 'emergency', 'Emergency Medicine', 'urgent', 'URGENT', 'bg-critical-bg text-critical border border-critical', 'border-critical', 'ready', 100, 2, '#FEE2E2', '#D92B2B')
ON CONFLICT (id) DO NOTHING;

-- Ward Beds
INSERT INTO ward_beds (bed, patient_id, patient_name, age, gender, brief_status, overnight_changes, overnight_detail, flag_count, flag_severity) VALUES
  ('4B1', 't-okonkwo', 'T. Okonkwo', 82, 'Male', 'ready', '["2 new obs"]', 'NEWS 4 → 6', 1, 'critical'),
  ('4B2', 's-khan', 'S. Khan', 45, 'Female', 'ready', '["New labs ↑"]', '', 3, 'high'),
  ('4B3', 'r-singh', 'R. Singh', 61, 'Male', 'ready', '["Creatinine 201 ↑"]', 'AKI Stage 1 Detected', 2, 'critical'),
  ('4B4', 'm-davies', 'M. Davies', 29, 'Female', 'ready', '[]', 'No significant change', 0, 'none')
ON CONFLICT (bed) DO NOTHING;

-- Overnight Events
INSERT INTO overnight_events (patient_name, bed, time, severity, title, description) VALUES
  ('R. Singh', '4B3', '04:12', 'critical', 'CRITICAL LAB ALERT', 'Creatinine increased from 115 to 201 µmol/L (AKI Stage 1). Potassium 5.4. No change in urine output noted in nursing notes.'),
  ('T. Okonkwo', '4B1', '03:45', 'high', 'OBSERVATION TREND', 'NEWS score escalated from 4 to 6. Tachycardia (112) and slight drop in O2 sats (93% on air). RMO reviewed and increased supplemental O2.'),
  ('M. Davies', '4B4', '01:20', 'low', 'CLINICAL NOTE', 'Patient slept well. PRN analgesic administered for minor abdominal pain at 00:30. Effectively settled.')
ON CONFLICT DO NOTHING;

-- Clinical Flags
INSERT INTO clinical_flags (id, patient_id, patient_name, flag_type, severity, description, source, created_at) VALUES
  ('flag-001', 'j-patel', 'J. Patel', 'allergy_conflict', 'critical', 'Prescribed Penicillin (V-Cil-K) despite recorded allergy to Penicillins. Brief generation flagged clinical risk.', 'EPIC / Medication-Admin-Log v1.4', '2026-06-03T07:45:00Z'),
  ('flag-002', 's-khan', 'S. Khan', 'med_discrepancy', 'high', 'Metformin dose mismatch between GP record (1000mg BD) and discharge summary (500mg BD). Source reconciliation required.', 'GP Connect / SystmOne v4.2', '2026-06-03T06:30:00Z'),
  ('flag-003', 's-khan', 'S. Khan', 'contraindication', 'critical', 'Active CKD Stage 3 with eGFR 48. Metformin requires dose review at eGFR < 45. Approaching threshold.', 'PathologyLIS / Renal Panel', '2026-06-03T04:15:00Z')
ON CONFLICT (id) DO NOTHING;

-- Treatment Relationships
INSERT INTO treatment_relationships (patient_id, clinician_id, clinician_name, relationship_type, valid_from, valid_until, status) VALUES
  ('j-patel', 'clin-henderson-001', 'Dr. Henderson', 'ward_doctor', '2026-06-01T00:00:00Z', NULL, 'active'),
  ('t-okonkwo', 'clin-henderson-001', 'Dr. Henderson', 'ward_doctor', '2026-06-01T00:00:00Z', NULL, 'active'),
  ('r-singh', 'clin-henderson-001', 'Dr. Henderson', 'ward_doctor', '2026-06-01T00:00:00Z', NULL, 'active'),
  ('m-davies', 'clin-henderson-001', 'Dr. Henderson', 'ward_doctor', '2026-06-01T00:00:00Z', NULL, 'active'),
  ('m-alfarsi', 'clin-andrew-001', 'Dr. Andrew', 'ward_doctor', '2026-06-01T00:00:00Z', NULL, 'active'),
  ('s-khan', 'clin-andrew-001', 'Dr. Andrew', 'emergency', '2026-06-01T00:00:00Z', NULL, 'active'),
  ('s-khan', 'clin-henderson-001', 'Dr. Henderson', 'referral', '2026-06-03T00:00:00Z', '2026-06-10T00:00:00Z', 'active')
ON CONFLICT DO NOTHING;

-- Audit Log (initial entry)
INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, resource_type, resource_id, patient_id, access_result, sensitivity_tier, timestamp) VALUES
  ('clin-andrew-001', 'Dr. Andrew', 'emergency_physician', 'auth.login.success', 'session', 'sess-001', NULL, 'granted', NULL, '2026-06-03T07:30:00Z')
ON CONFLICT DO NOTHING;

-- App Config
INSERT INTO app_config (id, data_source, fhir_base_url, gp_connect_endpoint, api_key, groq_api_key, current_clinician_id, current_clinician_name, current_clinician_role, tier3_authorized)
VALUES (1, 'live', '', '', '', '', 'clin-henderson-001', 'Dr. Henderson', 'specialist', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ───── 3. INDEXES ─────

CREATE INDEX IF NOT EXISTS idx_patient_details_department ON patient_details(department);
CREATE INDEX IF NOT EXISTS idx_clinical_flags_patient ON clinical_flags(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_flags_severity ON clinical_flags(severity);
CREATE INDEX IF NOT EXISTS idx_treatment_relationships_clinician ON treatment_relationships(clinician_id);
CREATE INDEX IF NOT EXISTS idx_treatment_relationships_patient ON treatment_relationships(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_break_glass_events_clinician ON break_glass_events(clinician_id);
CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(patient_id);
