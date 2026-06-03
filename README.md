# ClinIQ — AI Clinical Information Aggregation System

ClinIQ is an AI-powered clinical aggregation and briefing system designed to compile, normalise, and summarise a patient's clinical history before each clinical encounter. It addresses the endemic issue of missing clinical information in outpatient and inpatient settings (modeled on PMC3118108 research).

This repository contains the Next.js frontend implementation, incorporating strict healthcare security and compliance standards (HIPAA, UK GDPR, NHS Caldicott Principles).

---

## 🚀 Key Features & Pages Implemented

The frontend app contains the following secure screens:

1. **Secure Authentication (`/login`)**:
   - Simulated Smartcard reader PIN insertion with text monospace tracking and validation.
   - Mandated HIPAA/GDPR annual training confirmation gate check to unlock sign-in actions.
   - Automated window blur masking protection.

2. **Clinician Dashboard (`/dashboard`)**:
   - Dr. Ahmed's active consultation workspace.
   - Bento-style summary blocks for encounters tracking, ready AI briefs, and alerts status.
   - Interactive patient queue list featuring **Click-and-Hold PHI masking** for NHS numbers (unblurs on click/hold, blurs on release).
   - Real-time session countdown timer that triggers warning alerts when under 5 minutes left.

3. **Ward Round View (`/rounds`)**:
   - Ward 4B General Medicine attendant dashboard for Dr. Henderson.
   - Scoped ward metrics tracking (capacity progress bar, bed allocations, brief sync indicators).
   - Scrollable chronological overnight patient changes feed logs (e.g. creatinine increases, NEWS alerts).
   - "Generate All Briefs" transition loader simulation.
   - Focus loss security shield.

4. **Emergency Brief / Fast Mode (`/emergency`)**:
   - High-density clinical layout for critical A&E admissions.
   - Progressive disclosure data loading indicator (`LOADING SOURCES: 4/5`).
   - Four-Quadrant Bento Grid:
     - **Quadrant 1**: Allergies & Reactions (Penicillin / Aspirin).
     - **Quadrant 2**: Critical Flags (DNACPR orders, high falls risk) with quick "Acknowledge All" action.
     - **Quadrant 3**: Prescriptions (Warfarin, Metformin, Bisoprolol, Atorvastatin).
     - **Quadrant 4**: Conditions (T2DM, CKD) and kidney lab trend charts.
   - Keydown hotkey navigation listeners:
     - Pressing `1`–`4` highlights the corresponding quadrant with a color-coded ring border for 1 second.
     - Pressing `A`/`a` triggers clinical flags acknowledgment.

5. **Patient Brief View (`/patient/[id]`)**:
   - Scoped cardiology patient file summary for J. Patel.
   - Hover-unblur masking logic on NHS numbers.
   - Critical allergy alerts banner and Tier 3 psychiatric restricted records notification.
   - Detailed bento metrics (medications cards, ECG diagnostics, troponin measurements).
   - Shift check progress note and review validations controls.

---

## 🔒 Implemented Security & Compliance Features

ClinIQ frontend implements strict HIPAA security rule measures:
- **Visual PHI Protection**: Window focus monitoring triggers screen-wide blur masks immediately when the window loses focus (`blur`), preventing visual data leaks.
- **Dynamic Masking Layer**: Core identifiers (such as NHS numbers) are masked with CSS filters by default and are only revealed temporarily on hover or click-and-hold.
- **Inactivity Session Tracker**: Tracks session duration, updating timer states and animating warnings prior to auto-logout thresholds.
- **Sensitive Data Tier Limits**: Visual restrictions block Tier 3-5 sensitive records (e.g., mental health or substance use) by default, requiring audit-logged override requests.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Runtime**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (configured via css theme properties)
- **Iconography**: Google Material Symbols Outlined

---

## 📂 Folder Structure

```
ClinIQ/
├── ClinIQ_SRS_Complete_v2.md     # Authoritative Software Requirements Spec
└── frontend/                     # Next.js Application Root
    ├── public/                   # Static assets
    └── src/
        └── app/                  # App Router Routes
            ├── globals.css       # Tailwind v4 configuration and custom patterns
            ├── layout.tsx        # Font loads (DM Sans, DM Serif Display) & Icons
            ├── page.tsx          # Index redirect route
            ├── login/            # Secure Smartcard login page
            ├── dashboard/        # Clinician dashboard workspace
            ├── rounds/           # Ward round capacity tracker
            ├── emergency/        # Emergency Brief (Fast Mode) Bento layout
            └── patient/[id]/     # Dynamic Patient Brief View
```

---

## ⚙️ Development Setup

To run the Next.js frontend app locally:

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

4. **Build for production**:
   ```bash
   npm run build
   ```
