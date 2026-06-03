# ClinIQ
## Software Requirements Specification
### Complete & Consolidated — Version 2.0
**AI Clinical Information Aggregation System**

---

| Field | Detail |
|---|---|
| **Document Status** | Complete SRS — supersedes SRS v1.0 + HIPAA Addendum |
| **Version** | 2.0 (integrates all functional, security & compliance requirements) |
| **Classification** | Confidential |
| **Research Basis** | PMC3118108 — Missing Clinical Information in NHS Outpatient Clinics |
| **Compliance Baseline** | HIPAA (Privacy/Security/Breach), UK GDPR, NHS Caldicott, DSP Toolkit, MHRA SaMD, DCB0129/0160 |
| **Date** | May 2026 |

---

## About This Document

This is the complete and authoritative Software Requirements Specification for ClinIQ. It consolidates and supersedes two earlier documents:

- **SRS v1.0** — the original functional specification (introduction, use cases, functional and non-functional requirements, constraints, technology stack, database schema, data flow, and MVP scope).
- **HIPAA Compliance & PHI Security Specification v1.0** — the security and regulatory addendum that corrected 14 compliance gaps in v1.0.

Version 2.0 integrates both into a single coherent specification. Where the original v1.0 and the HIPAA addendum conflicted, the HIPAA-compliant requirement always takes precedence. This document is the single source of truth for engineering, product, clinical safety, legal, and compliance teams.

> **Reading Guide**
> - Sections 1–4 — Product context, use cases, functional and non-functional requirements
> - Sections 5–9 — Security architecture: access control, treatment relationships, minimum necessary, break-glass, encryption **(these are REQUIREMENTS, not optional)**
> - Sections 10–12 — Audit, breach response, business associate agreements
> - Sections 13–14 — Patient rights, de-identification
> - Sections 15–18 — System constraints, technology stack, database schema, data flow
> - Sections 19–21 — Workforce, MVP scope, compliance validation checklist
> - Appendices — Regulatory index, Caldicott mapping, glossary, sign-off

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Use Cases](#2-use-cases)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Security Architecture — Access Control & Treatment Relationship](#5-security-architecture--access-control--treatment-relationship)
6. [PHI Sensitivity Tiers & Minimum Necessary Standard](#6-phi-sensitivity-tiers--minimum-necessary-standard)
7. [Break-Glass (Emergency Override) Protocol](#7-break-glass-emergency-override-protocol)
8. [PHI Encryption Standards](#8-phi-encryption-standards)
9. [Audit & Accountability](#9-audit--accountability)
10. [Breach Detection & Response](#10-breach-detection--response)
11. [Business Associate Agreements (BAA)](#11-business-associate-agreements-baa)
12. [Patient Rights](#12-patient-rights)
13. [De-identification Standards](#13-de-identification-standards)
14. [UI / Frontend Security Requirements](#14-ui--frontend-security-requirements)
15. [System Constraints](#15-system-constraints)
16. [Technology Stack](#16-technology-stack)
17. [Database Architecture & Schema](#17-database-architecture--schema)
18. [System Data Flow](#18-system-data-flow)
19. [Workforce & Training Requirements](#19-workforce--training-requirements)
20. [MVP Scope](#20-mvp-scope)
21. [Compliance Validation Checklist](#21-compliance-validation-checklist)
- [Appendix A — Regulatory Reference Index](#appendix-a--regulatory-reference-index)
- [Appendix B — HIPAA / NHS Caldicott Mapping](#appendix-b--hipaa--nhs-caldicott-mapping)
- [Appendix C — Glossary & Acronyms](#appendix-c--glossary--acronyms)
- [Document Sign-Off](#document-sign-off)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional, non-functional, security, and regulatory-compliance requirements for ClinIQ — an AI-powered clinical information aggregation system. ClinIQ automatically compiles, normalises, and summarises a patient's clinical history from all authorised and available sources before each clinical encounter, presenting a structured 60-second brief to the treating clinician, scoped to that clinician's role and verified treatment relationship.

### 1.2 Scope

ClinIQ integrates with NHS and private healthcare information systems including:

- Electronic Health Records (EHR / EPR)
- GP systems (EMIS, SystmOne) via GP Connect
- Laboratory Information Systems (LIS)
- Pharmacy dispensing systems
- PACS (medical imaging)
- Discharge summary and referral letter repositories

The system produces per-patient, per-encounter briefs accessible via web dashboard, mobile application, and EHR embedded view (SMART on FHIR). All access is subject to authentication, role-based authorisation, and treatment relationship verification (Sections 5–6).

### 1.3 Problem Statement

A PMC-published NHS study (PMC3118108) documents that missing clinical information is a daily occurrence across outpatient clinics — so endemic that clinicians have normalised workarounds. The primary consequences are:

- Duplicate investigations — costing the NHS an estimated £250M+ annually.
- Treatment delays caused by unavailable prior results or letters.
- Medication errors from incomplete reconciliation on admission.
- Compromised patient safety — particularly for complex, multi-morbid patients.

ClinIQ directly addresses this gap by automating information assembly before every encounter. The PMC study explicitly states that further research is needed into technology solutions — this product represents that solution.

### 1.4 Intended Audience

| Audience | Relevant Sections |
|---|---|
| Product Managers | 1, 2, 20 (scope), 21 (checklist) |
| Backend Engineers | 3, 4, 5–9, 16, 17, 18 |
| Frontend Engineers | 3 (FR-06), 14 (UI security), 17 |
| Security Engineers | 4, 5, 8, 9, 10 |
| Clinical Safety Officers | 2, 3 (FR-05), 6, 7, 15 |
| Legal & Compliance | 5, 10, 11, 12, 13, 19, 21 |
| Privacy Officer | 5, 7, 9, 10, 12 |

### 1.5 Key Definitions

| Term | Definition |
|---|---|
| Brief | A structured AI-generated patient summary delivered before an encounter, scoped to the clinician's role. |
| Encounter | Any clinical interaction: appointment, admission, ward round, or referral review. |
| Aggregation Engine | The AI service that collects and normalises patient data from multiple sources. |
| Source System | Any connected external system supplying patient data (EHR, labs, pharmacy, etc.). |
| Reconciliation | The process of comparing and resolving discrepancies across source systems. |
| SaMD | Software as a Medical Device — the MHRA regulatory classification for ClinIQ. |
| PHI | Protected Health Information — any individually identifiable health data. |
| TRV | Treatment Relationship Verification — confirms a clinician's legitimate care relationship to a patient. |
| RBAC / ABAC | Role-Based / Attribute-Based Access Control. |
| RLS | Row Level Security — database-layer access enforcement in PostgreSQL. |
| Break-Glass | A controlled, audited emergency override for PHI access without a pre-existing relationship. |
| BAA | Business Associate Agreement — HIPAA-mandated contract for any party handling PHI. |

---

## 2. Use Cases

The following eight use cases cover the core clinical scenarios for ClinIQ. Each defines the actor, trigger, step-by-step main flow, and expected outcome. All use cases are subject to the access-control and treatment-relationship requirements defined in Sections 4–6.

---

### UC-01 — Emergency Presentation Brief
**Tag:** Emergency | **Priority:** Critical

| Field | Detail |
|---|---|
| **Actor** | Emergency Clinician |
| **Trigger** | An unknown patient arrives at A&E unconscious or unable to communicate their history. |
| **Main Flow** | 1. System detects new emergency admission via HIS/PAS integration. 2. Treatment relationship auto-created from admission event; if none, Break-Glass protocol triggers (Section 7). 3. AI aggregation triggered immediately — target: brief ready in under 3 minutes. 4. Records pulled from EHR, pharmacy, GP record, and prior discharge summaries (Tier 1 + Tier 2 only). 5. 60-second structured brief rendered: allergies, medications, chronic conditions, last labs. 6. Clinician reviews brief before initiating treatment protocol; system flags drug contraindications. |
| **Outcome** | Clinician has full history before first intervention. Zero reliance on patient recall. Contraindication risks surfaced automatically. Tier 3–5 records remain blocked even in emergency. |

---

### UC-02 — Pre-Appointment Clinical Briefing
**Tag:** Outpatient | **Priority:** High

| Field | Detail |
|---|---|
| **Actor** | GP / Outpatient Clinician |
| **Trigger** | An appointment is booked 24+ hours in advance in the scheduling system. |
| **Main Flow** | 1. Scheduler notifies the AI aggregation engine 30 minutes before appointment time. 2. Treatment relationship confirmed from the scheduled appointment record. 3. System pulls EHR notes, specialist letters, recent labs, and prescription history. 4. AI generates a role-scoped structured summary covering active conditions, treatments, and pending investigations. 5. Summary is presented in the consultation room interface before the patient enters. 6. Clinician can expand any section to view source documents; marks brief as reviewed (audit logged). |
| **Outcome** | Clinician starts every appointment fully informed. No more 'let me pull up your file' delays. Consultation time used for clinical decision-making. |

---

### UC-03 — Ward Round Patient Handover
**Tag:** Inpatient | **Priority:** High

| Field | Detail |
|---|---|
| **Actor** | Ward Doctor / Registrar |
| **Trigger** | A daily ward round begins or a shift handover occurs. |
| **Main Flow** | 1. Ward round session initiated by the senior clinician for their assigned ward only. 2. AI generates per-patient briefs for all beds on the ward in batch (TRV verified per patient). 3. Each brief includes admission reason, current medications, outstanding results, documented concerns. 4. Overnight events (obs changes, nursing notes, new labs) highlighted as deltas from previous round. 5. Briefs available on mobile devices for bedside viewing; handover completion recorded in audit log. |
| **Outcome** | Faster, safer ward rounds. Handover risk reduced by surfacing overnight changes. Junior doctors have full context without verbal handover gaps. |

---

### UC-04 — Referral Context Loading
**Tag:** Specialist | **Priority:** High

| Field | Detail |
|---|---|
| **Actor** | Specialist Consultant |
| **Trigger** | A referral letter is received from a GP or another department. |
| **Main Flow** | 1. Referral intake system triggers AI aggregation; treatment relationship created from referral. 2. System reads the referral letter via NLP/OCR and cross-references with the patient record. 3. AI identifies gaps between referral context and actual record (e.g. missing tests mentioned in referral). 4. Specialist receives a specialty-scoped context brief: referral reason, supporting evidence, relevant history. 5. Consultant marks brief as reviewed before seeing the patient; gaps flagged for administrative follow-up. |
| **Outcome** | Consultants receive patients fully contextualised. Referral information gaps surface before the appointment, not during it. |

---

### UC-05 — Medication Reconciliation on Admission
**Tag:** Pharmacy | **Priority:** High

| Field | Detail |
|---|---|
| **Actor** | Pharmacist |
| **Trigger** | A patient is admitted to hospital. |
| **Main Flow** | 1. Admission event triggers pharmacy integration check and pharmacist treatment relationship. 2. AI pulls prescription history from GP records, community pharmacy dispensing, and discharge summaries. 3. System compares the admission medication list against the aggregated history. 4. Discrepancies, duplications, and contraindications flagged with severity (Critical/High/Medium/Low). 5. Pharmacist receives a reconciliation report with source citations; T3/T4 medications excluded per Section 6. 6. Acknowledgement of each flag required before sign-off. |
| **Outcome** | Accurate medication list from the first minute of admission. Medication errors prevented at source. Reconciliation time reduced from hours to minutes. |

---

### UC-06 — Care Planning Context Brief
**Tag:** Nursing | **Priority:** Medium

| Field | Detail |
|---|---|
| **Actor** | Nurse / Care Coordinator |
| **Trigger** | A new care plan is initiated or a patient is transferred between wards. |
| **Main Flow** | 1. Care plan creation event triggers aggregation within the nurse's care remit. 2. System surfaces social circumstances, previous care plans, carer contacts, mobility and communication needs. 3. AI highlights any safeguarding flags or special requirements noted across prior encounters. 4. Nurse reviews brief and confirms or updates the care plan based on complete history. 5. Brief becomes part of the care plan audit trail. |
| **Outcome** | Holistic care planning from day one. Critical social and safeguarding information cannot fall through the cracks. |

---

### UC-07 — Data Source Integration Management
**Tag:** Admin | **Priority:** Medium

| Field | Detail |
|---|---|
| **Actor** | System Administrator |
| **Trigger** | A new data source is to be connected, or an existing source fails. |
| **Main Flow** | 1. Admin accesses the integration management console (zero PHI access in this role). 2. System displays health status of all connected sources (EHR, labs, pharmacy, PACS). 3. Admin adds, configures, pauses, or removes data source connections. 4. System alerts admin if a connected source stops responding or returns stale data. 5. All integration changes recorded in the audit log with timestamps and actor identity. |
| **Outcome** | Reliable data pipeline maintained. Clinicians always know which sources are active. Degradation surfaced immediately. |

---

### UC-08 — Patient Consent and Data Access Control
**Tag:** Governance | **Priority:** Critical

| Field | Detail |
|---|---|
| **Actor** | Patient / Clinician |
| **Trigger** | A patient requests a data access review or opts out of AI aggregation. |
| **Main Flow** | 1. Patient submits consent preference via the portal or in-person to reception. 2. System logs consent decision with timestamp and version of consent form. 3. If opt-out: system excludes that patient's data from aggregation immediately. 4. Clinician brief for an opted-out patient shows a reduced view with consent status notification. 5. Patient can reverse the decision at any time; aggregation re-enables within 24 hours. 6. Full consent history maintained for GDPR and HIPAA right-of-access requests. |
| **Outcome** | Full GDPR, HIPAA, and NHS data governance compliance. Patients retain meaningful control. Complete, auditable consent trail. |

---

## 3. Functional Requirements

### FR-01 Automated Data Aggregation

- The system SHALL automatically collect patient data from all connected source systems within 90 seconds of an encounter trigger event.
- The system SHALL support HL7 FHIR R4, HL7 v2, REST APIs, and direct database integrations.
- The system SHALL handle partial data availability gracefully — generating a brief from available sources and explicitly flagging any missing sources.
- The system SHALL retry failed source requests up to 3 times with exponential back-off before marking a source as unavailable.
- Aggregation SHALL only collect records the accessing clinician is authorised to view per Sections 4–6 (data minimisation at source).

### FR-02 AI Clinical Summarisation

- The system SHALL use a large language model to produce a structured brief covering: active diagnoses, current medications with doses, past medical history, recent investigations, active referrals, allergies, and pending actions.
- Each brief SHALL be renderable within 60 seconds of clinician request for scheduled encounters.
- The AI model SHALL be strictly constrained to factual summarisation — no diagnostic inference or treatment recommendations.
- All brief content SHALL be grounded to its source document to mitigate hallucination risk.
- The model version used for each brief SHALL be recorded in `clinical_briefs.model_version`.
- The summarisation prompt SHALL be scoped to the clinician's role and the encounter's specialty (Section 6).

### FR-03 Encounter Trigger Integration

- The system SHALL integrate with scheduling systems to trigger pre-appointment aggregation 30 minutes before the encounter.
- The system SHALL integrate with hospital admission systems (PAS/HIS) to trigger emergency aggregation within 60 seconds of admission.
- The system SHALL support manual trigger by any authorised clinician via the dashboard or mobile app.
- Trigger-to-brief latency SHALL be P95 < 90 seconds for scheduled encounters and P95 < 3 minutes for emergency triggers.
- Each trigger event SHALL create or verify a treatment relationship (Section 5) before aggregation proceeds.

### FR-04 Source Attribution and Audit Trail

- Every item in a generated brief SHALL be traceable to its source system, source document, and extraction timestamp.
- Clinicians SHALL be able to navigate to full source documents from any brief item via a single click.
- The system SHALL maintain a complete audit log of who accessed which brief, when, from which device, and whether it was marked as reviewed (Section 9).
- Audit log records SHALL be append-only and tamper-evident.

### FR-05 Conflict and Discrepancy Detection

- The system SHALL detect and flag contradictions between source systems (e.g. different medication doses in GP record vs discharge summary).
- Flags SHALL be categorised by clinical severity: Critical (allergies, contraindications), High (medication discrepancies), Medium (conflicting diagnoses), Low (administrative inconsistencies).
- Flagged items SHALL never be auto-resolved — they SHALL always require explicit clinician acknowledgement.
- Flag acknowledgement SHALL be recorded in `clinical_flags` with actor ID and timestamp.

### FR-06 Role-Based Brief Configuration

- Brief templates SHALL be configurable by clinical role: Emergency Physician, GP, Specialist Consultant, Pharmacist, Nurse, Ward Doctor.
- Each role template SHALL define which data domains appear, in what order, and at what level of detail, enforcing the Minimum Necessary Standard (Section 6).
- Senior clinicians SHALL be able to customise personal brief preferences within the bounds of their role template.
- Mandatory sections SHALL NOT be removable by individual clinicians.
- Template changes SHALL be versioned and audited.

### FR-07 Patient Consent and Data Governance

- The system SHALL enforce patient consent preferences in real time — opted-out patients SHALL be excluded from aggregation immediately upon consent update.
- The system SHALL display consent status on every brief view.
- All data processing SHALL comply with HIPAA, the NHS DSP Toolkit, UK GDPR, and Caldicott Principles.
- The system SHALL maintain a versioned, auditable consent history for every patient.
- The system SHALL support category-level data restrictions independent of full opt-out (Section 12).

### FR-08 Access Control Enforcement *(NEW in v2.0)*

- The system SHALL verify authentication, authorisation, and treatment relationship before returning any PHI (Section 4).
- Access control SHALL be enforced at the database layer via Row Level Security in addition to the application layer.
- The system SHALL deny access and write an audit event when any access-control layer fails.
- Tier 3–5 sensitive records SHALL be excluded from briefs unless explicit patient authorisation exists (Section 6).

### FR-09 Break-Glass Emergency Override *(NEW in v2.0)*

- The system SHALL provide a controlled emergency override for PHI access without a pre-existing treatment relationship (Section 7).
- Break-Glass SHALL require a mandatory justification of at least 20 characters before access is granted.
- Break-Glass access SHALL be limited to Tier 1 and Tier 2 data and SHALL expire after 72 hours.
- Every Break-Glass event SHALL alert the Privacy Officer immediately and SHALL be reviewed within 48 hours.

---

## 4. Non-Functional Requirements

### NFR-01 Performance

- Scheduled brief generation: P95 latency < 60 seconds end-to-end.
- Emergency brief generation: P95 latency < 3 minutes.
- Dashboard initial load time: < 2 seconds on a standard clinical workstation.
- System SHALL support 10,000 concurrent brief requests without measurable degradation.
- Database query response time: P99 < 500ms. Treatment relationship check: P95 < 300ms.

### NFR-02 Availability and Reliability

- Core briefing service: 99.9% uptime SLA (< 8.7 hours downtime per year).
- Integration layer SHALL degrade gracefully — if one source is offline, brief is generated from remaining sources with explicit notification.
- Disaster Recovery RTO: < 4 hours. Backup RPO: < 15 minutes via continuous replication.
- Source system failures SHALL trigger automated alerts within 60 seconds.

### NFR-03 Security

- All data in transit: TLS 1.3 minimum (Section 8). All data at rest: AES-256 (Section 8).
- Authentication: NHS Smartcard / NHS Login / SMART on FHIR / SAML 2.0 SSO.
- Authorisation: RBAC + ABAC enforced at database layer via Row Level Security (Sections 4–5).
- Sensitive PHI (NHS number, DOB, clinical content) encrypted at column level.
- Annual penetration testing plus additional testing on every major release.
- NHS DSP Toolkit compliance mandatory pre-deployment; ISO 27001 within 12 months of go-live.
- Automatic session logoff after 15 minutes of inactivity (HIPAA Security Rule 164.312(a)(2)(iii)).

### NFR-04 Interoperability

- The system SHALL be HL7 FHIR R4 compliant throughout.
- GP Connect API integration: mandatory for UK NHS deployment.
- NHS Spine integration: required for patient demographics (PDS) and Summary Care Record access.
- NHS number validation: required for all patient identity matching.
- The system SHALL support IHE profiles: XDS, PIX, PDQ for cross-organisational document sharing.

### NFR-05 Usability

- A clinician with no prior ClinIQ training SHALL be able to review a complete patient brief within 60 seconds of opening it.
- The system SHALL achieve a System Usability Scale (SUS) score > 80 in formal clinical user testing.
- The interface SHALL meet WCAG 2.1 Level AA accessibility standards.
- The mobile interface SHALL be fully functional on current iOS and Android versions.

### NFR-06 Scalability

- Architecture SHALL be horizontally scalable to support rollout from 1 site to 100+ sites without architectural change.
- The data pipeline SHALL handle 1 million patient records per trust.
- The AI inference layer SHALL scale independently of the data layer via separate Kubernetes deployments.
- Multi-tenancy SHALL provide complete data isolation between organisations enforced at the database and application layer.

### NFR-07 Auditability & Accountability

- Every PHI access, modification, denial, and break-glass event SHALL be logged immutably (Section 9).
- Audit logs SHALL be retained for a minimum of 6 years.
- Real-time anomaly detection SHALL alert the Privacy Officer on suspicious access patterns (Section 9.4).

---

## 5. Security Architecture — Access Control & Treatment Relationship

> **⚠ This section contains HARD REQUIREMENTS, not recommendations.**
> ClinIQ aggregates a patient's complete record and makes it easy to retrieve. This makes insider-access risk HIGHER, not lower. The majority of HIPAA enforcement actions involve clinicians accessing records of patients not under their care. The controls in Sections 5–9 are mandatory. No deployment may proceed without them.

### 5.1 Three-Layer Access Control Model

All three layers must pass before any PHI is returned. Failure at any layer produces an access-denied response and writes an audit event.

```
Layer 1:  Authentication     →  WHO you are (identity verification)
Layer 2:  Authorisation      →  WHAT you are allowed to do (RBAC + ABAC)
Layer 3:  Treatment Relation →  WHETHER you have a care relationship with THIS patient

All three pass  →  PHI returned
Any layer fails →  Access denied + audit event written
```

### 5.2 Role-Based Access Control (RBAC)

| Role | Can Access | Cannot Access |
|---|---|---|
| `emergency_physician` | T1, T2 for admitted / presenting patients | T3, T4, T5 without special authorisation |
| `gp` | T1, T2 for own registered patients | Other practices' records; T3–T5 without authorisation |
| `specialist` | T1, T2 relevant to specialty + referral context | Unrelated specialties; T3–T5 |
| `pharmacist` | T1, T2 medications + drug-relevant labs only | Clinical notes beyond drug-relevant scope |
| `nurse` | T1, T2 nursing-relevant (vitals, care plans, social) | Diagnosis detail beyond direct care remit |
| `ward_doctor` | T1, T2 for patients on assigned ward | Other wards' patients; T3–T5 |
| `admin` | System configuration only — **ZERO PHI access** | All patient PHI |
| `privacy_officer` | Audit logs, break-glass review, anomaly alerts | Routine clinical PHI (oversight role) |

> **Critical:** The `admin` role has zero access to patient PHI. System administrators are not clinical users. A separate `clinical_admin` role exists for nurse managers requiring limited PHI access within their care remit.

### 5.3 Attribute-Based Access Control (ABAC)

RBAC defines the ceiling of access. ABAC adds dynamic runtime constraints — **all must evaluate TRUE**:

```sql
RBAC role permits the requested data category
AND  treatment_relationship.status = 'active'
AND  encounter.status IN ('scheduled', 'active', 'recent')
AND  clinician.organisation_id = patient.organisation_id
       OR cross_organisation_access.approved = TRUE
AND  patient.consent_status != 'opted_out'
AND  session.is_active = TRUE
AND  session.last_activity > NOW() - INTERVAL '15 minutes'
```

### 5.4 Database-Level Enforcement (Row Level Security)

Access control is enforced at the PostgreSQL layer using RLS policies. Application-layer bugs cannot bypass data access controls because enforcement happens at the database itself.

```sql
CREATE POLICY phi_access_policy ON source_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM treatment_relationships tr
    WHERE tr.patient_id   = source_records.patient_id
      AND tr.clinician_id = current_setting('app.current_clinician_id')::UUID
      AND tr.status       = 'active'
      AND tr.valid_from  <= NOW()
      AND (tr.valid_until IS NULL OR tr.valid_until > NOW())
  )
  AND source_records.sensitivity_tier <= (
    SELECT max_tier FROM role_tier_permissions
    WHERE role = current_setting('app.current_role'))
  AND (source_records.sensitivity_tier < 3
       OR source_records.special_auth_obtained = TRUE)
  AND EXISTS (SELECT 1 FROM patients p
              WHERE p.id = source_records.patient_id
                AND p.consent_status = 'active')
);
```

### 5.5 Treatment Relationship Verification (TRV)

Under HIPAA 45 CFR 164.506(c), PHI may be used for Treatment, Payment, or Healthcare Operations. The system must verify the clinician has a legitimate, time-bounded treatment relationship — not assumed from role alone but established from a verifiable clinical event.

| Clinical Event | Relationship Duration | Source |
|---|---|---|
| Appointment scheduled | From 2h before to 48h after appointment | Scheduling system |
| Patient admitted to clinician's ward | Admission duration + 72h | PAS / HIS |
| Referral sent to clinician | Referral date to 30 days after first appointment | Referral system |
| GP registered as responsible clinician | Duration of registration (open-ended) | GP system |
| Emergency admission, no relationship | Admission duration — triggers Break-Glass | PAS / HIS |
| Direct care team assignment | As configured by senior clinician | ClinIQ admin |

#### 5.5.1 treatment_relationships Table

```sql
CREATE TABLE treatment_relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES patients(id),
  clinician_id      UUID NOT NULL REFERENCES clinicians(id),
  relationship_type VARCHAR(50) NOT NULL,
  -- Values: 'scheduled_appointment' | 'admitted_patient' | 'referral'
  --         | 'registered_gp' | 'direct_care_team' | 'break_glass'
  valid_from        TIMESTAMPTZ NOT NULL,
  valid_until       TIMESTAMPTZ,        -- NULL = open-ended (registered GP)
  source_event_id   UUID,
  source_event_type VARCHAR(50),
  status            VARCHAR(20) NOT NULL DEFAULT 'active',
  created_by        VARCHAR(50) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_by        UUID REFERENCES clinicians(id),
  revoked_at        TIMESTAMPTZ,
  organisation_id   UUID NOT NULL REFERENCES organisations(id)
);

CREATE INDEX idx_tr_patient_clinician_active
  ON treatment_relationships(patient_id, clinician_id, status)
  WHERE status = 'active';
```

#### 5.5.2 Access Denied Behaviour

When a clinician attempts to access a patient with no active treatment relationship:

1. Access-denied screen displayed — no PHI visible.
2. Audit event written: `action = 'phi.access_denied.no_treatment_relationship'`, severity HIGH.
3. If 5+ different patients denied within 1 hour, a privacy violation alert is raised to the Privacy Officer.

---

## 6. PHI Sensitivity Tiers & Minimum Necessary Standard

### 6.1 PHI Sensitivity Tiers

Not all PHI carries equal sensitivity. ClinIQ enforces tiered access. Higher tiers require progressively more stringent authorisation.

| Tier | Category | Examples | Special Legal Rules |
|---|---|---|---|
| **T1** Standard | Demographics, appointments, GP notes | Name, DOB, address, encounter history | Standard Privacy Rule controls |
| **T2** Clinical | Diagnoses, medications, labs, allergies | Active conditions, prescriptions, results | Minimum necessary + active treatment relationship |
| **T3** Sensitive | Mental health records | Psychiatry notes, psychotropic medications | Separate consent; never in standard brief without authorisation |
| **T4** Highly Sensitive | Substance use disorder records | Addiction treatment, methadone prescriptions | 42 CFR Part 2 — specific written authorisation required; cannot share even for treatment without it |
| **T5** Highly Sensitive | HIV/AIDS status | HIV diagnosis, antiretrovirals | State-specific restrictions (e.g. NY PHL 2785) |
| **T5** Highly Sensitive | Sexual & reproductive health | STI results, abortion records, contraception | State-specific; minor rights vary |
| **T5** Highly Sensitive | Genetic information | BRCA results, pharmacogenomics | GINA protections apply |

> **Rule:** Tier 3–5 records **NEVER** appear in a clinical brief by default — regardless of role or encounter type. They appear only when patient written authorisation exists AND the clinician has an active relationship AND the role is clinically relevant AND access is logged with clinical justification.

#### 6.1.1 Tier Columns on source_records

```sql
ALTER TABLE source_records
  ADD COLUMN sensitivity_tier       INTEGER NOT NULL DEFAULT 2
      CHECK (sensitivity_tier BETWEEN 1 AND 5);
ALTER TABLE source_records
  ADD COLUMN legal_basis            VARCHAR(100);
  -- Values: 'standard_treatment' | '42_cfr_part2' | 'hiv_specific_consent'
  --         | 'genetic_gina' | 'minor_reproductive_health'
ALTER TABLE source_records
  ADD COLUMN special_auth_obtained  BOOLEAN DEFAULT FALSE;
ALTER TABLE source_records
  ADD COLUMN special_auth_record_id UUID REFERENCES consent_authorisations(id);
```

### 6.2 Minimum Necessary Standard — Role-Scoped Brief Matrix

HIPAA 45 CFR 164.502(b): a covered entity must limit PHI disclosure to the minimum necessary. Each role receives only the brief sections relevant to their function.

| Brief Section | Emergency Physician | GP | Specialist | Pharmacist | Nurse |
|---|---|---|---|---|---|
| Allergies & Alerts | Full | Full | Full | Full | Full |
| Active Conditions | Full | Full | Specialty only | Drug-relevant | Nursing-relevant |
| Medications | Full | Full | Specialty-relevant | Full | Current only |
| Investigations | Full | Full | Specialty-relevant | Drug-relevant labs | Vitals/obs only |
| Referrals | Active | Full | Own specialty | NOT SHOWN | Active only |
| Social History | Brief | Full | Relevant | NOT SHOWN | Full |
| Mental Health (T3) | BLOCKED | If treating | If psychiatrist | BLOCKED | BLOCKED |
| Substance Use (T4) | BLOCKED | BLOCKED* | BLOCKED* | BLOCKED | BLOCKED |
| Full Note History | Summary | Full | Relevant letters | NOT SHOWN | NOT SHOWN |

*\* T4 substance-use records require specific 42 CFR Part 2 written authorisation even for treating clinicians.*

### 6.3 Five-Layer Minimum Necessary Enforcement

| Layer | Mechanism | Controls |
|---|---|---|
| 1 — Database | PostgreSQL RLS on `source_records` | Which records are queryable |
| 2 — API | Role + encounter scope filter before LLM call | Which records enter the aggregation payload |
| 3 — LLM Prompt | System prompt scoped to role + specialty | What the model summarises |
| 4 — UI | Sections rendered per role template | What the clinician sees |
| 5 — Audit | Each brief view logs sections rendered | Compliance evidence |

---

## 7. Break-Glass (Emergency Override) Protocol

In genuine clinical emergencies, a clinician may need PHI access without a pre-existing treatment relationship. HIPAA permits this under the Emergency Treatment exception (45 CFR 164.506(c)(1)). Break-Glass is a controlled, audited override — **not a bypass**.

### 7.1 Ten-Step Workflow

1. Clinician attempts to access a patient with no active treatment relationship.
2. Access-denied screen displayed (Section 5.5.2). No PHI visible.
3. Clinician selects 'This is a clinical emergency — Use Break-Glass access'.
4. Break-Glass confirmation dialog shown with full legal warning.
5. Clinician enters mandatory justification — minimum 20 characters.
6. Access granted for REDUCED SCOPE: Tier 1 + Tier 2 only. Tier 3–5 remain blocked.
7. `treatment_relationships` record created: type `break_glass`, `valid_until` = +72h.
8. Immediate alert to Privacy Officer: clinician, patient (opaque ID), justification, timestamp.
9. Within 48 hours, Privacy Officer marks the access **Justified** or **Unjustified**.
10. Unjustified: formal investigation, department head notified. Justified: retained 6 years.

### 7.2 Absolute Limits

- Maximum 3 Break-Glass accesses per clinician per rolling 30 days before automatic escalation.
- Break-Glass does **NOT** grant access to Tier 4 (42 CFR Part 2) or Tier 5 records under any circumstances.
- Break-Glass window: 72 hours, then automatic expiry. No renewal without a new justification.
- Briefs generated under Break-Glass are flagged `break_glass = true` — visible to Privacy Officer, not to the clinician.
- Break-Glass is **never** available to the `admin` role.

---

## 8. PHI Encryption Standards

### 8.1 Data at Rest

| Data Category | Standard | Key Management |
|---|---|---|
| Database (RDS) | AES-256 (RDS native) | AWS KMS CMK — 90-day rotation |
| Column-level PHI (NHS no., DOB, raw_content) | AES-256-GCM (pgcrypto) | Separate KMS key per organisation |
| S3 document store | AES-256 SSE-KMS | Per-tenant KMS key |
| Mobile app local cache | AES-256-GCM (Keychain/Keystore) | Device-bound; destroyed on uninstall |
| Backup snapshots | AES-256 | Separate key; 2-person authorisation |

### 8.2 Data in Transit

| Connection | Standard | Additional Requirements |
|---|---|---|
| Browser to API Gateway | TLS 1.3 | HSTS; no TLS 1.0/1.1 |
| Mobile to API Gateway | TLS 1.3 | Certificate pinning |
| API to Database | TLS 1.2+ | Mutual TLS within VPC |
| API to Source Systems | TLS 1.2+ | Cert validation; no self-signed |
| WebSocket updates | WSS (TLS 1.3) | Token validated per frame |
| Inter-service (K8s) | mTLS via Istio | Auto cert rotation every 24h |

### 8.3 Key Management Hierarchy

```
AWS Account Master Key
  └── Organisation Master Key  (one per NHS trust / covered entity)
        ├── PHI Encryption Key        (patient data — RDS + S3)
        ├── Column Encryption Key     (NHS number, DOB, raw_content)
        ├── Backup Encryption Key     (snapshots — 2-person access)
        └── Audit Log Signing Key     (tamper evidence)

Rotation:  PHI 90 days | Backup 180 days | Emergency < 4h after compromise
Access:    HSM-backed; no human sees raw key; all usage in CloudTrail; MFA out-of-hours
```

### 8.4 Prohibited Patterns

> These patterns are HIPAA violations. Caught by automated code review, WAF rules, and penetration tests.

```
❌ PHI in URL:      /brief?patient_id=485-777-3321&dob=1958-03-12
❌ PHI in logs:     INFO: Processing brief for J. Patel (DOB 12/03/1958)
❌ PHI in route:    /brief/j-patel-1958
❌ PHI in errors:   500: Failed to load records for NHS 485777332

✅ CORRECT — opaque identifiers only:
   /brief/enc_7f3a9b2c
   INFO: Processing encounter enc_7f3a9b2c
   500: Error loading brief — reference req_abc123
```

### 8.5 Mobile PHI Security

- **Offline cache:** max 10 briefs, AES-256-GCM, device-bound key, auto-purge after 24h, purged on logout / biometric change / MDM wipe / jailbreak detection.
- **Screen:** iOS `UIScreen.isCaptured` blur; Android `FLAG_SECURE`; screenshot prevention on all PHI screens.
- **Memory:** PHI zeroed after use; no PHI in crash reports; clipboard restricted; no PHI in push notification bodies.

---

## 9. Audit & Accountability

HIPAA Security Rule 164.312(b) requires mechanisms that record and examine ePHI activity.

### 9.1 Events That Must Be Audited

| Category | Events |
|---|---|
| Authentication | Login success/failure, logout, session timeout, MFA challenge/failure, lockout |
| PHI Access | Brief viewed, section viewed, source document opened, patient searched |
| PHI Modification | Consent updated, flag acknowledged, brief marked reviewed, reconciliation completed |
| Access Denied | No treatment relationship, role insufficient, opted-out, tier restricted |
| Break-Glass | Initiated (justification logged), Privacy Officer review outcome |
| Administrative | Account created/modified/deactivated, role changed, source added/removed |
| System | Brief generated, aggregation triggered, source offline, anomaly alert fired |
| Export/Print | Brief printed, audit log exported, reconciliation report exported |

### 9.2 Extended audit_logs Schema

```sql
CREATE TABLE audit_logs (
  id                        BIGSERIAL PRIMARY KEY,   -- sequential, tamper-evident
  actor_id                  UUID NOT NULL,
  actor_type                VARCHAR(20) NOT NULL,    -- clinician | system | patient | admin
  actor_role                VARCHAR(50),
  action                    VARCHAR(100) NOT NULL,
  resource_type             VARCHAR(50),
  resource_id               UUID,
  patient_id                UUID,
  organisation_id           UUID NOT NULL,
  ip_address                INET,
  device_id                 VARCHAR(100),
  session_id                VARCHAR(100),
  user_agent                TEXT,
  -- HIPAA-specific fields
  access_result             VARCHAR(20) NOT NULL,    -- granted | denied | break_glass
  denial_reason             VARCHAR(100),
  -- no_treatment_relationship | role_insufficient | consent_opted_out | tier_restricted
  sensitivity_tier_accessed INTEGER,
  break_glass_id            UUID REFERENCES break_glass_events(id),
  phi_categories_accessed   TEXT[],
  timestamp                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                  JSONB
);

-- Append-only enforcement
REVOKE UPDATE, DELETE ON audit_logs FROM audit_writer;
```

### 9.3 Retention

| Log Type | Minimum Retention | Storage |
|---|---|---|
| PHI access logs | 6 years | Hot 2y PostgreSQL; cold 4y+ S3 Glacier |
| Authentication logs | 6 years | Same |
| Break-glass events | 6 years; Privacy Officer approval to delete | Hot storage only |
| System events | 2 years | PostgreSQL then S3 |
| Export/print events | 6 years | Same as PHI access |

### 9.4 Anomaly Detection Thresholds

| Pattern | Threshold | Severity |
|---|---|---|
| One clinician, many patients | 20+ unique patients in 1 hour | Critical |
| Access outside ward/department | 5+ outside scope in 1 day | High |
| Repeated break-glass | 3+ in 30 days | High |
| Unusual location | New country or city | High |
| Failed logins | 5 in 10 minutes | High |
| After-hours T3–T5 access | 22:00–06:00 | Medium |
| Bulk export | Single export > 100 records | High |

---

## 10. Breach Detection & Response

### 10.1 HIPAA Notification Deadlines

- **Individual notification:** within 60 days of discovery.
- **HHS notification:** within 60 days; if 500+ individuals in a state, also notify prominent media.
- **Annual HHS report:** for breaches affecting fewer than 500 individuals per state.

### 10.2 Breach Classification

| Category | Definition | Examples |
|---|---|---|
| Confirmed Breach | Unauthorised acquisition/access/use/disclosure of unsecured PHI | Access with no relationship; exfiltration; stolen unencrypted device |
| Security Incident | Attempted but unsuccessful attack | Failed login storm; blocked SQL injection |
| Impermissible Use | Authorised user exceeds minimum necessary scope | GP viewing another practice's full records |
| Incidental Disclosure | Limited, unpreventable, incidental to permitted use | Patient glimpsing a screen briefly |

### 10.3 Response Workflow

| Timeline | Phase | Actions |
|---|---|---|
| Day 0 | Detection | Alert or report; Security Team notified within 1h; incident reference assigned |
| Days 0–3 | Containment | Accounts suspended; access revoked; Legal + Privacy Officer engaged |
| Days 3–10 | Investigation | Forensic audit review; scope determined; root cause identified |
| Days 10–60 | Notification | Patients notified; HHS notified; media if 500+; BAA partners notified |
| Day 60+ | Remediation | Corrective plan; controls updated; retraining; follow-up HHS submission |

### 10.4 breach_events Table

```sql
CREATE TABLE breach_events (
  id                           UUID PRIMARY KEY,
  detected_at                  TIMESTAMPTZ NOT NULL,
  detected_by                  VARCHAR(100),
  breach_type                  VARCHAR(50),
  description                  TEXT NOT NULL,
  affected_patient_count       INTEGER,
  affected_phi_categories      TEXT[],
  investigation_status         VARCHAR(30),  -- open | investigating | closed
  confirmed_breach             BOOLEAN,
  hhs_notification_sent_at     TIMESTAMPTZ,
  patient_notification_sent_at TIMESTAMPTZ,
  root_cause                   TEXT,
  corrective_actions           TEXT,
  closed_at                    TIMESTAMPTZ,
  organisation_id              UUID NOT NULL
);
```

---

## 11. Business Associate Agreements (BAA)

Under HIPAA 45 CFR 164.502(e), a Covered Entity must have a signed BAA with any party that creates, receives, maintains, or transmits PHI on its behalf. ClinIQ is both a Business Associate to the healthcare organisations it serves and a Covered Entity requiring BAAs from its own subcontractors.

### 11.1 BAA Required With

| Vendor / Partner | PHI Exposure | Requirement |
|---|---|---|
| AWS (cloud) | All ePHI storage & processing | AWS BAA before any PHI is stored |
| LLM provider (OpenAI/Anthropic) | PHI in LLM prompts | BAA required OR de-identify OR self-host (see 11.2) |
| EHR vendors (SystmOne, EMIS) | PHI via GP Connect / HL7 | BAA with each vendor |
| DataDog (observability) | Logs may contain PHI | BAA + PHI scrubbing pipeline |
| Sentry / Crashlytics | Stack traces may contain PHI | BAA + PHI scrubbing in error boundary |
| Email / SMS provider | Patient contact details | BAA — contact data is PHI |

> **⚠ CRITICAL — LLM / AI Subprocessor BAA Gap**
>
> Sending patient PHI to an external LLM API without a signed BAA is a HIPAA violation, regardless of whether a breach occurs. Three permitted options:
>
> 1. **(PREFERRED)** BAA with the LLM provider. AWS Bedrock (Claude/Llama), Azure OpenAI, and OpenAI Enterprise all offer HIPAA-eligible services with BAA coverage.
> 2. De-identify before sending — strip all 18 HIPAA identifiers, re-insert locally after. Complex; creates re-identification risk.
> 3. Self-host an open-weight model (Llama 3, Mistral) inside the covered entity's infrastructure. PHI never leaves. Most secure; highest cost.

### 11.2 baa_agreements Table

```sql
CREATE TABLE baa_agreements (
  id                     UUID PRIMARY KEY,
  vendor_name            VARCHAR(100) NOT NULL,
  vendor_type            VARCHAR(50),
  executed_at            DATE NOT NULL,
  valid_until            DATE,
  phi_categories_covered TEXT[],
  signed_by              VARCHAR(100),
  vendor_signed_by       VARCHAR(100),
  document_ref           VARCHAR(200),
  status                 VARCHAR(20),   -- active | expired | terminated
  organisation_id        UUID NOT NULL
);
```

---

## 12. Patient Rights

### 12.1 HIPAA Patient Rights

| Right | HIPAA Citation | ClinIQ Implementation |
|---|---|---|
| Right of Access | § 164.524 | Patient portal (post-MVP): copy of aggregated brief data within 30 days |
| Right to Amend | § 164.526 | Patient flags inaccuracies; routed to treating clinician for source correction |
| Accounting of Disclosures | § 164.528 | List of all disclosures in last 6 years, generated from `audit_logs` |
| Right to Restrict | § 164.522(a) | Restrict specific source categories independent of full opt-out |
| Confidential Communications | § 164.522(b) | Preferred contact method/address for system communications |
| Right to Complain | § 164.530(d) | Link to HHS complaint portal in patient-facing materials |

### 12.2 Patient Rights Data Model

```sql
CREATE TABLE patient_data_requests (
  id            UUID PRIMARY KEY,
  patient_id    UUID NOT NULL REFERENCES patients(id),
  request_type  VARCHAR(50),
  -- Values: 'access' | 'amendment' | 'accounting' | 'restriction' | 'complaint'
  submitted_at  TIMESTAMPTZ NOT NULL,
  details       TEXT,
  status        VARCHAR(30),   -- received | processing | fulfilled | denied
  fulfilled_at  TIMESTAMPTZ,
  denial_reason TEXT,
  -- HIPAA: must respond within 30 days (extendable to 60 with notice)
  due_by        TIMESTAMPTZ GENERATED ALWAYS AS
                (submitted_at + INTERVAL '30 days') STORED
);

CREATE TABLE patient_data_restrictions (
  id                   UUID PRIMARY KEY,
  patient_id           UUID NOT NULL REFERENCES patients(id),
  restricted_category  VARCHAR(50),
  restricted_source_id UUID REFERENCES source_systems(id),
  reason               TEXT,
  effective_from       TIMESTAMPTZ NOT NULL,
  effective_until      TIMESTAMPTZ,   -- NULL = permanent
  created_by           VARCHAR(50)
);
```

---

## 13. De-identification Standards

### 13.1 When Required

| Use Case | De-identification Required? | Additional Conditions |
|---|---|---|
| Clinical brief to treating clinician | No | Treatment purpose, TRV verified |
| AI model training | Yes | Ethics approval + research consent |
| Performance analytics | Yes | Aggregate metrics only |
| Research use | Yes | Ethics + consent + data sharing agreement |
| Vendor support tickets | Yes | Synthetic data or opaque IDs only |
| QA / staging environments | Yes | Synthea synthetic data only |

### 13.2 HIPAA Safe Harbor — 18 Identifiers to Remove

Under 45 CFR 164.514(b), de-identification requires removal of all 18 identifiers, confirmed by automated scan before data leaves production for any non-treatment purpose:

1. Names (all components)
2. Geographic subdivisions smaller than state (ZIP, county, city, street)
3. All dates except year (DOB, admission, discharge, date of death)
4. Telephone numbers
5. Fax numbers
6. Email addresses
7. SSN / NHS numbers
8. Medical record numbers
9. Health plan beneficiary numbers
10. Account numbers
11. Certificate / licence numbers
12. Vehicle identifiers and serial numbers including licence plates
13. Device identifiers and serial numbers
14. Web URLs
15. IP addresses
16. Biometric identifiers (fingerprints, voiceprints, retinal scans)
17. Full-face photographs and comparable images
18. Any other unique identifying number, code, or characteristic

### 13.3 Synthetic Data Policy

- All dev, staging, and QA environments use **Synthea-generated** synthetic patient data only.
- Production database snapshots **cannot** be used in non-production environments under any circumstances.
- Developers have zero access to production PHI; production access requires: senior sponsorship + Privacy Officer approval + individual BAA + training completion.

---

## 14. UI / Frontend Security Requirements

These requirements govern the web and mobile interfaces. They are mandatory across every page and component.

### 14.1 PHI Display Rules

| UI Element | Non-Compliant (v1.0) | Required (v2.0) |
|---|---|---|
| Patient header | Full NHS: 485 777 3321 | Masked: `*** *** **21` |
| Page URL | `/brief/j-patel-1958` | `/brief/enc_7f3a9b2c` (opaque UUID only) |
| Browser tab title | `J. Patel — ClinIQ` | `Patient Brief — ClinIQ` |
| Search results | Full name, DOB, NHS | Name + birth year + last 2 NHS digits |
| Error messages | Patient identifiers | Opaque reference IDs only |
| Print output | Full identifiers by default | Masked by default; full only on confirmed print |

### 14.2 Mandatory Security Components

| Component | Purpose | Mandatory Behaviour |
|---|---|---|
| `TreatmentRelationshipGuard` | Wraps every patient page | Checks TRV on mount and route change; renders AccessDenied if fails |
| `AccessDeniedScreen` | Shown when TRV fails | No PHI visible; writes audit event; break-glass option for eligible roles |
| `BreakGlassConfirmDialog` | Emergency override | Legal warning; 20+ char justification; confirm disabled until met |
| `BreakGlassActiveBanner` | Active break-glass session | Non-dismissible; shows scope (T1+T2) and time remaining |
| `SensitivityTierWarning` | T3–T5 records excluded | States which tiers restricted; links to authorisation workflow |
| `SessionTimeoutWarning` | 13-min inactivity | 2-min countdown; auto-logout at 15 min |
| `PHIMaskingLayer` | Window blur / screen share | Blurs all PHI; cannot be disabled |
| `PHIValue` | Renders any PHI string | All PHI passes through masking; bare PHI in JSX prohibited |

### 14.3 Session Auto-Logoff

*(HIPAA Security Rule 164.312(a)(2)(iii) — Automatic Logoff)*

```
Inactivity timer:  15 minutes (org-configurable; 15-min minimum; cannot disable)
Resets on:         Mouse move, keyboard, touch event, successful API call
At 13 minutes:     SessionTimeoutWarning modal with 2-minute countdown
At 15 minutes:     Server session revoked; PHI cleared from memory + storage
                   User redirected to /login

Mobile additions:
  App locks after 5 min background; biometric required to re-enter
  Biometric unlock does NOT extend the server session
```

---

## 15. System Constraints

### 15.1 SC-01 Regulatory Classification

ClinIQ is a Class IIa Medical Device under UK MDR 2002 (as retained post-Brexit). UKCA marking is required before clinical deployment. The AI summarisation module must be validated as Software as a Medical Device (SaMD) per MHRA guidelines. A Clinical Safety Case must be produced and approved per DCB0129 and DCB0160.

### 15.2 SC-02 AI Model Constraints

The AI model SHALL NOT produce diagnostic conclusions or therapeutic recommendations. All output is restricted to factual summarisation of available, authorised source records. Hallucination risk is mitigated by:

- Grounding all outputs to source documents with explicit citation.
- Constrained system prompts reviewed and approved by the Clinical Safety Officer.
- Human-in-the-loop design — every brief requires clinician review; no auto-action is taken.
- Regular output audits comparing AI summaries against source records.

### 15.3 SC-03 Data Residency

All patient data SHALL remain within UK jurisdiction (NHS residency requirements). Cloud infrastructure SHALL use UK-region data centres only (AWS eu-west-2 or equivalent). No patient-identifiable data SHALL be used for AI model training without explicit consent and ethics approval.

### 15.4 SC-04 Clinical Safety Design Principles

- No brief item shall result in automatic clinical action — all items require human review.
- Source system downtime shall never produce a 'false complete' brief — missing sources are always made visible.
- Conflicting information is always surfaced, never silently resolved.
- The system shall fail safe — if brief generation fails, the clinician is notified and can proceed without the brief.

### 15.5 SC-05 Compliance Constraints *(NEW in v2.0)*

- No deployment may proceed without all 20 items in the Compliance Validation Checklist (Section 21) signed off.
- No PHI may be processed before a signed BAA is in place with every PHI-handling vendor (Section 11).
- No production PHI may exist in any non-production environment (Section 13).

---

## 16. Technology Stack

ClinIQ is built on a cloud-native, NHS-compliant, FHIR-first stack designed for horizontal scalability, independent service deployment, and HIPAA/GDPR compliance.

### Frontend — Web & Mobile

| Technology | Role | Rationale |
|---|---|---|
| Next.js 14 | Web application framework | App Router, server components, SSR for fast clinical load |
| React Native | Mobile app (iOS / Android) | Single codebase for bedside mobile; certificate pinning |
| Tailwind CSS | UI styling | Consistent, accessible components (WCAG 2.1 AA) |
| TanStack Query | Server state & caching | Background refresh; stale-while-revalidate for live briefs |

### Backend — API & Services

| Technology | Role | Rationale |
|---|---|---|
| Node.js + Fastify | API Gateway | High throughput, TypeScript, plugin architecture |
| Python + FastAPI | AI Inference Service | Best ML/NLP ecosystem; async; OpenAI-compatible interface |
| Apache Kafka (MSK) | Event / trigger bus | Reliable ordered delivery of encounter triggers at scale |
| Redis | Cache + session store | Sub-ms brief caching; pub/sub for real-time updates |
| Celery + Beat | Background scheduler | Pre-appointment aggregation; retry with dead-letter queues |

### AI & Machine Learning

| Technology | Role | Rationale |
|---|---|---|
| AWS Bedrock (Claude/Llama) | Clinical summarisation LLM | HIPAA-eligible with BAA; citation grounding; structured output |
| LangChain | LLM orchestration | Retrieval chains, structured output, hallucination guardrails |
| spaCy + scispaCy | Clinical NLP | Medical NER; medication extraction; ICD-10 / SNOMED linking |
| Tesseract OCR | Document digitisation | Text from scanned letters, discharge summaries, handwritten notes |
| pgvector / FAISS | Vector store | Semantic search across patient history; contextual retrieval |

### Infrastructure — AWS UK

| Technology | Role | Rationale |
|---|---|---|
| AWS (eu-west-2) | Cloud platform | NHS data residency; mature FHIR & healthcare tooling |
| Kubernetes (EKS) | Container orchestration | Independent scaling of AI inference vs data pipeline vs API |
| Terraform | Infrastructure as Code | Reproducible, auditable infra for NHS security reviews |
| AWS KMS | Key management | Per-tenant encryption keys; 90-day rotation; HSM-backed |
| DataDog | Observability | Clinical-grade monitoring; SLO tracking; PHI-scrubbed logs |

### Integration — Interoperability

| Technology | Role | Rationale |
|---|---|---|
| HL7 FHIR R4 (HAPI) | Primary standard | NHS mandate; SMART on FHIR auth; universal EHR compatibility |
| GP Connect | GP record access | NHS API for SystmOne / EMIS structured records |
| NHS Spine | Demographics + SCR | PDS, Summary Care Record, NHS number validation |
| MuleSoft / Azure APIM | Integration middleware | Protocol translation (HL7v2 → FHIR); legacy adapters |

### Security & Compliance Tooling

| Technology | Role | Rationale |
|---|---|---|
| Istio service mesh | mTLS between services | Automatic certificate rotation every 24h |
| AWS WAF | Web application firewall | Blocks PHI-in-URL patterns; SQL injection; rate limiting |
| Synthea | Synthetic data generator | Realistic synthetic patients for all non-production environments |
| PostgreSQL RLS | Database access control | Enforces tenant + treatment-relationship isolation at database layer |

---

## 17. Database Architecture & Schema

### 17.1 Technology

Primary database: **PostgreSQL 16** with the pgvector extension. Deployed on AWS RDS Multi-AZ for high availability. Row Level Security enforces multi-tenant and treatment-relationship isolation at the database layer.

### 17.2 Core Tables

**patients** — Core patient identity, demographics, consent status

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Internal identifier |
| `nhs_number` | VARCHAR(10) | Validated; encrypted at column level (AES-256-GCM) |
| `date_of_birth` | DATE | Encrypted at rest |
| `gender` | ENUM | FHIR AdministrativeGender |
| `consent_status` | ENUM | `active` \| `opted_out` \| `restricted` |
| `consent_updated_at` | TIMESTAMPTZ | Last consent change |
| `organisation_id` | UUID FK | Multi-tenancy — RLS key |
| `created_at / updated_at` | TIMESTAMPTZ | Record lifecycle |

---

**encounters** — Clinical encounter events that trigger brief generation

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `patient_id` | UUID FK | References `patients` |
| `encounter_type` | ENUM | `emergency` \| `outpatient` \| `inpatient` \| `referral` \| `ward_round` |
| `department` | VARCHAR(100) | Clinical department / specialty |
| `clinician_id` | UUID FK | Responsible clinician |
| `scheduled_at` | TIMESTAMPTZ | Planned time |
| `triggered_at` | TIMESTAMPTZ | Aggregation trigger time |
| `status` | ENUM | `scheduled` \| `triggered` \| `brief_ready` \| `reviewed` \| `cancelled` |
| `source_system` | VARCHAR(50) | `PAS` \| `HIS` \| `manual` |
| `organisation_id` | UUID FK | RLS key |

---

**clinical_briefs** — Generated AI patient summaries — one per encounter

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `encounter_id` | UUID FK | Parent encounter |
| `patient_id` | UUID FK | Denormalised for query performance |
| `generated_at` | TIMESTAMPTZ | |
| `model_version` | VARCHAR(50) | AI model used |
| `brief_json` | JSONB | Full structured brief — versioned schema |
| `sources_used` | JSONB[] | Source references with timestamps |
| `sources_failed` | JSONB[] | Sources unavailable at generation |
| `flags_count` | INTEGER | Clinical flags raised |
| `reviewed_by / reviewed_at` | UUID FK / TIMESTAMPTZ | Null until reviewed |
| `break_glass` | BOOLEAN | True if accessed under break-glass (Section 7) |
| `generation_latency_ms` | INTEGER | SLO tracking |

---

**source_records** — Normalised FHIR R4 records from all connected sources

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `patient_id` | UUID FK | |
| `source_system_id` | UUID FK | References `source_systems` |
| `record_type` | ENUM | `medication` \| `diagnosis` \| `lab` \| `letter` \| `imaging` \| `allergy` \| `note` |
| `record_date` | DATE | Clinical date |
| `fetched_at` | TIMESTAMPTZ | Retrieval time |
| `fhir_resource_type` | VARCHAR(50) | MedicationRequest, Condition, etc. |
| `fhir_resource_json` | JSONB | Normalised FHIR R4 — GIN indexed |
| `raw_content` | TEXT (encrypted) | Original text, column-encrypted |
| `embedding_vector` | VECTOR(1536) | Semantic search via pgvector |
| `sensitivity_tier` | INTEGER | 1–5; drives access control (Section 6) |
| `legal_basis` | VARCHAR(100) | `standard_treatment` \| `42_cfr_part2` \| … |
| `special_auth_obtained` | BOOLEAN | T3–5 authorisation flag |
| `is_active` | BOOLEAN | Soft-delete |
| `organisation_id` | UUID FK | RLS key |

---

**clinical_flags** — Detected discrepancies and safety alerts

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `brief_id` | UUID FK | Brief that raised the flag |
| `patient_id` | UUID FK | Denormalised |
| `flag_type` | ENUM | `allergy_conflict` \| `med_discrepancy` \| `duplicate_test` \| `missing_result` \| `contraindication` |
| `severity` | ENUM | `critical` \| `high` \| `medium` \| `low` |
| `description` | TEXT | Human-readable detail |
| `source_record_ids` | UUID[] | Records that triggered the flag |
| `acknowledged_by / at` | UUID FK / TIMESTAMPTZ | Null until acknowledged |
| `created_at` | TIMESTAMPTZ | |

---

**clinicians** — Healthcare professional accounts, roles, preferences

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `nhs_smartcard_id` | VARCHAR(50) | Encrypted at column level |
| `role` | ENUM | `emergency_physician` \| `gp` \| `specialist` \| `pharmacist` \| `nurse` \| `ward_doctor` \| `admin` \| `privacy_officer` |
| `department` | VARCHAR(100) | |
| `organisation_id` | UUID FK | RLS key |
| `brief_template_id` | UUID FK | Assigned role template |
| `training_status` | ENUM | `current` \| `expired` (gates access — Section 19) |
| `is_active` | BOOLEAN | Soft-delete for leavers |
| `created_at` | TIMESTAMPTZ | |

---

**source_systems** — Connected data source registry and health monitoring

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | VARCHAR(100) | e.g. SystmOne, PathologyLIS |
| `system_type` | ENUM | `ehr` \| `gp` \| `lab` \| `pharmacy` \| `pacs` \| `discharge` \| `pas` |
| `integration_protocol` | ENUM | `fhir_r4` \| `hl7v2` \| `rest` \| `direct_db` \| `gp_connect` |
| `base_url` | TEXT (encrypted) | Endpoint — encrypted |
| `auth_config` | JSONB (encrypted) | Credentials — encrypted |
| `health_status` | ENUM | `healthy` \| `degraded` \| `offline` |
| `last_health_check` | TIMESTAMPTZ | Updated every 60s |
| `organisation_id` | UUID FK | |

### 17.3 Security & Compliance Tables

Six additional tables enforce the HIPAA requirements. Their full schemas appear in the referenced sections:

- `treatment_relationships` — Section 5.5.1
- `audit_logs` — Section 9.2
- `breach_events` — Section 10.4
- `baa_agreements` — Section 11.2
- `patient_data_requests` — Section 12.2
- `patient_data_restrictions` — Section 12.2

### 17.4 Key Design Decisions

| Decision | Rationale |
|---|---|
| pgvector extension | Semantic similarity search across `source_records` embeddings without a separate vector DB |
| JSONB for FHIR resources | Native, queryable, indexable storage; schema-flexible as FHIR evolves |
| Immutable audit log (BIGSERIAL) | Sequential PK + append-only permissions provide tamper evidence |
| Column-level encryption | NHS number, DOB, `raw_content` encrypted via pgcrypto; keys in AWS KMS |
| Row Level Security | Tenant + treatment-relationship isolation enforced at the database, not just app layer |
| `sensitivity_tier` column | Drives tier-based access control (Section 6) at the row level |

---

## 18. System Data Flow

### 18.1 Scheduled Encounter Flow

End-to-end flow for a scheduled outpatient appointment, with access control enforced at each step:

```
Step  Actor                  Action
────────────────────────────────────────────────────────────────────
1     Scheduling System      Publishes EncounterScheduled event to Kafka
2     TRV Service            Creates/verifies treatment relationship (Section 5)
3     Aggregation Worker     Consumes event; initiates parallel source queries
4     FHIR Integration       Fetches records via FHIR R4 / GP Connect / HL7
5     RLS Layer              Database returns only authorised, tier-permitted records
6     Normalisation Engine   Converts to FHIR R4 canonical; stores in source_records
7     Conflict Detector      Compares across sources; writes clinical_flags
8     AI Inference Service   Role-scoped grounded prompt; calls LLM (BAA-covered)
9     Brief Builder          Parses output; writes brief_json to clinical_briefs
10    Cache Layer (Redis)    Caches rendered brief for dashboard access
11    Notification Service   Pushes 'Brief Ready' (no PHI in notification body)
12    Clinician              Reviews brief; marks reviewed (audit logged)
```

### 18.2 Emergency Trigger Flow

For emergency admissions the same pipeline runs at elevated priority, targeting P95 < 3 minutes. Source queries run in parallel with a 90-second per-source timeout. Treatment relationship is auto-created from the admission event; if none exists, the Break-Glass protocol (Section 7) is invoked before any data is shown. Tier 3–5 records remain blocked even in emergency.

### 18.3 Access-Denied Flow

When a clinician requests a brief without an active treatment relationship, no aggregation occurs. The access-denied screen is shown, an audit event is written, and (for eligible roles) the Break-Glass option is offered. No PHI is fetched, cached, or rendered.

---

## 19. Workforce & Training Requirements

### 19.1 Mandatory Training Before PHI Access

No clinician account may be activated until all applicable training modules are recorded as complete. Activation is blocked programmatically (`clinicians.training_status` gates access).

| Training Module | Audience | Frequency |
|---|---|---|
| HIPAA Privacy Rule Fundamentals | All users | Onboarding + annually |
| Minimum Necessary Standard | All clinical users | Onboarding + annually |
| ClinIQ Acceptable Use Policy | All users | Onboarding + on policy revision |
| Break-Glass Protocol & Consequences | All clinical users | Onboarding + annually |
| Incident & Breach Reporting | All users | Onboarding + annually |
| PHI Handling on Mobile Devices | Mobile users | First mobile access + annually |

### 19.2 Workforce Security Policies

- **Sanction Policy:** Documented, consistently applied consequences for violations — from retraining to termination to criminal referral.
- **Termination Procedures:** Accounts deactivated within 2 hours of departure — including resignations, terminations, and role transfers.
- **Access Review:** Quarterly review of all active accounts against the current workforce list; 90-day-inactive accounts reviewed.
- **Privacy Officer Designation:** A named, trained individual oversees compliance, breach response, and break-glass review.

---

## 20. MVP Scope

Defines the in-scope and out-of-scope boundaries for the Minimum Viable Product release. Security and compliance controls (Sections 5–14) are **NOT optional** and are fully in MVP scope.

| MVP In-Scope | Post-MVP (Future Releases) |
|---|---|
| Core brief generation (outpatient + emergency) | Ward round batch generation (UC-03) |
| FHIR R4 integration (EHR, labs, pharmacy) | PACS / imaging report integration |
| GP Connect integration (SystmOne / EMIS) | Cross-trust patient matching |
| Web dashboard for clinicians | EHR embedded widget (SMART on FHIR iFrame) |
| Role-based brief templates (Minimum Necessary) | Clinician-level template personalisation |
| Treatment Relationship Verification (Section 5) | Automated duplicate-test detection |
| Break-Glass protocol (Section 7) | Patient-facing portal (right-of-access UI) |
| Full audit logging + anomaly detection | Advanced analytics & outcome dashboard |
| Patient consent management + opt-out | Biometric mobile authentication |
| Encryption at rest + in transit (Section 8) | Self-hosted LLM option |
| NHS Smartcard / NHS Login SSO + auto-logoff | Genetic / pharmacogenomic tier handling (T5) |

---

## 21. Compliance Validation Checklist

Before ClinIQ is deployed in any clinical environment, every item must be individually verified and signed off by the named responsible party. **No exceptions; no partial deployments.**

| # | Check Item | Owner | Status |
|---|---|---|---|
| C-01 | BAA executed with ClinIQ (or template reviewed by legal) | Legal / Privacy Officer | ☐ Pending |
| C-02 | BAA executed with AWS for HIPAA-eligible services | Infrastructure Lead | ☐ Pending |
| C-03 | BAA executed with LLM provider OR LLM running on-premise | CTO | ☐ Pending |
| C-04 | BAA executed with all EHR / source system vendors | Integration Lead | ☐ Pending |
| C-05 | Treatment Relationship Verification tested for all 6 relationship types | Engineering + QA | ☐ Pending |
| C-06 | Minimum Necessary role templates approved by Chief Clinical Officer | Clinical Lead | ☐ Pending |
| C-07 | Break-Glass workflow + Privacy Officer review tested | Privacy Officer | ☐ Pending |
| C-08 | PHI encryption at rest verified (AWS KMS audit, all 5 categories) | Security Lead | ☐ Pending |
| C-09 | No PHI in URLs, logs, or error messages (automated scan passed) | Security Lead | ☐ Pending |
| C-10 | Auto-logoff at 15 minutes tested on web and mobile | QA | ☐ Pending |
| C-11 | Tier 3–5 records excluded from all standard briefs in all roles | QA + Clinical Safety | ☐ Pending |
| C-12 | Audit log captures all mandatory events (Section 9.1) | Engineering | ☐ Pending |
| C-13 | Anomaly detection active and alerting to Privacy Officer | Security Lead | ☐ Pending |
| C-14 | Breach response procedure documented and tabletop-tested | Privacy Officer | ☐ Pending |
| C-15 | No production PHI in development or staging environments | Infrastructure Lead | ☐ Pending |
| C-16 | NHS number / SSN masked to last 2 digits in all UI contexts | Engineering + QA | ☐ Pending |
| C-17 | Patient search scoped to own-care patients only | Engineering + QA | ☐ Pending |
| C-18 | All staff completed mandatory HIPAA training | HR / Privacy Officer | ☐ Pending |
| C-19 | Annual penetration test completed; findings remediated | Security Lead | ☐ Pending |
| C-20 | Clinical Safety Case reviewed per DCB0129 / DCB0160 | Clinical Safety Officer | ☐ Pending |

---

## Appendix A — Regulatory Reference Index

| Regulation | Citation | Topic | Section |
|---|---|---|---|
| HIPAA Privacy Rule | 45 CFR 164.502(b) | Minimum Necessary Standard | 6 |
| HIPAA Privacy Rule | 45 CFR 164.506(c) | Treatment, Payment, Operations | 5 |
| HIPAA Privacy Rule | 45 CFR 164.508 | Authorisation requirements | 6 |
| HIPAA Privacy Rule | 45 CFR 164.522(a) | Right to request restrictions | 12 |
| HIPAA Privacy Rule | 45 CFR 164.524 | Patient right of access | 12 |
| HIPAA Privacy Rule | 45 CFR 164.528 | Accounting of disclosures | 12 |
| HIPAA Privacy Rule | 45 CFR 164.502(e) | Business Associate requirements | 11 |
| HIPAA Security Rule | 45 CFR 164.312(a)(2)(iii) | Automatic logoff | 14.3 |
| HIPAA Security Rule | 45 CFR 164.312(a)(2)(iv) | Encryption of ePHI | 8 |
| HIPAA Security Rule | 45 CFR 164.312(b) | Audit controls | 9 |
| HIPAA Security Rule | 45 CFR 164.312(d) | Person/entity authentication | 5 |
| HIPAA Security Rule | 45 CFR 164.312(e) | Transmission security | 8 |
| HIPAA Breach Rule | 45 CFR 164.400–414 | Breach notification | 10 |
| 42 CFR Part 2 | 42 CFR 2.13 | Substance use disorder records | 6.1 |
| HIPAA De-identification | 45 CFR 164.514(b) | Safe Harbor — 18 identifiers | 13 |
| GINA | 29 USC 1182 | Genetic information protections | 6.1 |
| UK GDPR / DPA 2018 | UK statute | Lawful basis, minimisation | 1.3, 4 |
| NHS Caldicott | Caldicott Report 2013 | 7+1 principles | Appendix B |
| NHS DSP Toolkit | NHS England | Annual evidence submission | 4 (NFR-03) |
| UK MDR 2002 | SI 2002/618 (retained) | Class IIa Medical Device | 15.1 |
| DCB0129 / DCB0160 | NHS Digital | Clinical Safety Case | 15.1 |

---

## Appendix B — HIPAA / NHS Caldicott Mapping

| HIPAA Requirement | NHS Caldicott Equivalent | ClinIQ Implementation |
|---|---|---|
| Minimum Necessary (164.502(b)) | Principle 3: minimum necessary | Role-scoped brief templates (Section 6) |
| Treatment Relationship (164.506(c)) | Principle 2: use only when necessary | TRV system (Section 5) |
| Audit Controls (164.312(b)) | Principle 7: comply with the law | Immutable audit log (Section 9) |
| Access Control (164.312(a)) | Principle 4: need-to-know access | RBAC + ABAC + RLS (Section 5) |
| Patient Consent (164.522) | Principle 1: justify the purpose | Consent management (Section 12) |
| Breach Notification (164.400) | DSPT mandatory incident reporting | Breach workflow (Section 10) |
| De-identification (164.514) | Principle 5: aware of responsibilities | Safe Harbor + synthetic data (Section 13) |

---

## Appendix C — Glossary & Acronyms

| Term | Meaning |
|---|---|
| ABAC | Attribute-Based Access Control |
| BAA | Business Associate Agreement (HIPAA) |
| Break-Glass | Controlled emergency PHI access override |
| CMK | Customer Master Key (AWS KMS) |
| DSPT | NHS Data Security and Protection Toolkit |
| EHR / EPR | Electronic Health Record / Electronic Patient Record |
| ePHI | Electronic Protected Health Information |
| FHIR | Fast Healthcare Interoperability Resources (HL7 R4) |
| GINA | Genetic Information Non-discrimination Act |
| HHS | US Department of Health and Human Services |
| HIPAA | Health Insurance Portability and Accountability Act |
| HIS / PAS | Hospital Information System / Patient Administration System |
| KMS | Key Management Service (AWS) |
| LIS | Laboratory Information System |
| mTLS | Mutual Transport Layer Security |
| NER | Named Entity Recognition |
| PHI | Protected Health Information |
| RBAC | Role-Based Access Control |
| RLS | Row Level Security (PostgreSQL) |
| RTO / RPO | Recovery Time Objective / Recovery Point Objective |
| SaMD | Software as a Medical Device |
| SCR | Summary Care Record (NHS Spine) |
| SUS | System Usability Scale |
| TRV | Treatment Relationship Verification |

---

## Document Sign-Off

This complete SRS takes effect upon signature by all parties below. No deployment of ClinIQ may proceed until this page is signed and all 20 checklist items (Section 21) are verified.

| Role | Name (Print) | Signature | Date |
|---|---|---|---|
| Product Owner | | | |
| Chief Technology Officer | | | |
| Privacy Officer / HIPAA Compliance Lead | | | |
| Clinical Safety Officer | | | |
| Chief Clinical Officer / Medical Director | | | |
| Head of Information Security | | | |
| Legal Counsel | | | |

---

*ClinIQ Software Requirements Specification v2.0 (Complete & Consolidated)*
*Supersedes SRS v1.0 and HIPAA Compliance Spec v1.0 in their entirety.*
*Classification: Confidential. Do not distribute outside the ClinIQ programme.*
