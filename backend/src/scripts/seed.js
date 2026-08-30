import { db } from "../config/firebaseAdmin.js";

export const SEED_MINES = [
  { id: "KCM-01", name: "Kusmunda Coal Mine", code: "KCM-01", zone: "Chhattisgarh", latitude: 22.309, longitude: 82.679, status: "active", annualTargetMT: 45.0 },
  { id: "GCM-02", name: "Gevra Open Cast Mine", code: "GCM-02", zone: "Chhattisgarh", latitude: 22.331, longitude: 82.591, status: "active", annualTargetMT: 50.0 },
  { id: "JCM-03", name: "Jharia Underground Coal Mine", code: "JCM-03", zone: "Jharkhand", latitude: 23.739, longitude: 86.414, status: "active", annualTargetMT: 15.0 },
  { id: "MCM-04", name: "Mugma Coal Mine", code: "MCM-04", zone: "Jharkhand", latitude: 23.694, longitude: 86.150, status: "active", annualTargetMT: 12.5 },
  { id: "KOR-05", name: "Korba Coal Field", code: "KOR-05", zone: "Chhattisgarh", latitude: 22.085, longitude: 82.195, status: "active", annualTargetMT: 35.0 },
  { id: "UMR-06", name: "Umrer Open Cast Mine", code: "UMR-06", zone: "Maharashtra", latitude: 21.826, longitude: 79.080, status: "active", annualTargetMT: 18.0 },
  { id: "SNG-07", name: "Singrauli Coal Basin", code: "SNG-07", zone: "Madhya Pradesh", latitude: 23.270, longitude: 81.972, status: "active", annualTargetMT: 40.0 },
  { id: "JAY-08", name: "Jayant Open Cast Project", code: "JAY-08", zone: "Madhya Pradesh", latitude: 24.186, longitude: 83.801, status: "active", annualTargetMT: 25.0 },
  { id: "DIP-09", name: "Dipka Mine Expansion", code: "DIP-09", zone: "Chhattisgarh", latitude: 22.098, longitude: 82.770, status: "active", annualTargetMT: 38.0 },
  { id: "WCL-10", name: "Nagpur Coal Division", code: "WCL-10", zone: "Maharashtra", latitude: 21.190, longitude: 79.390, status: "active", annualTargetMT: 22.0 },
];

export const SEED_USERS = [
  { uid: "demo_field_officer_uid", name: "Ramesh Kumar (Field Officer)", email: "field.officer@minerakshak.gov.in", role: "field_officer", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", status: "active" },
  { uid: "demo_mine_official_uid", name: "Suresh Sharma (Mine Official)", email: "mine.official@minerakshak.gov.in", role: "mine_official", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", status: "active" },
  { uid: "demo_contractor_uid", name: "Vikram Singh (Contractor Company)", email: "contractor@minerakshak.gov.in", role: "contractor", mineId: "KCM-01", mineName: "Kusmunda Coal Mine", companyName: "SafeMine Engineering Pvt. Ltd.", status: "active" },
  { uid: "demo_corporate_uid", name: "Pooja Verma (Corporate HQ)", email: "corporate@minerakshak.gov.in", role: "corporate", mineId: null, mineName: null, status: "active" },
  { uid: "demo_admin_uid", name: "Rajesh Gupta (System Administrator)", email: "admin@minerakshak.gov.in", role: "admin", mineId: null, mineName: null, status: "active" },
  { uid: "fo_2", name: "Amitabh Sen (Safety Inspector)", email: "amitabh.sen@minerakshak.gov.in", role: "field_officer", mineId: "GCM-02", mineName: "Gevra Open Cast Mine", status: "active" },
  { uid: "fo_3", name: "Kavita Nair (Ventilation Officer)", email: "kavita.nair@minerakshak.gov.in", role: "field_officer", mineId: "JCM-03", mineName: "Jharia Underground Coal Mine", status: "active" },
];

export const SEED_COMPLIANCE = [
  { id: "cmp-1", title: "Quarterly DGMS Haul Road Gradient & Berm Safety Audit", category: "Safety", dueDate: "2026-09-15", status: "pending", isRecurring: true, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Verify haul road width is ≥ 3 times largest dump truck width and continuous 1.5m berm height." },
  { id: "cmp-2", title: "Monthly Airborne Respirable Dust Suppression Verification", category: "Environmental", dueDate: "2026-08-20", status: "overdue", isRecurring: true, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Gravimetric dust samplers must confirm PM10 < 3.0 mg/m3 at active transfer crusher points." },
  { id: "cmp-3", title: "Heavy Earth Moving Machinery (HEMM) Pre-Shift Braking & Steering Logbook", category: "Equipment", dueDate: "2026-08-28", status: "completed", isRecurring: false, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Daily operator pre-shift checklist verified for CAT 777D dumpers and hydraulic excavators." },
  { id: "cmp-4", title: "Pit Slope & Highwall Radar Stability Monitoring Telemetry Check", category: "Structural", dueDate: "2026-09-05", status: "pending", isRecurring: true, mineId: "KCM-01", mineName: "Kusmunda Coal Mine", description: "Continuous ground probe radar telemetry review for tension crack displacement." },
  { id: "cmp-5", title: "Statutory Form IV Workman Compensation & Register Audit", category: "Documentation", dueDate: "2026-08-15", status: "overdue", isRecurring: true, mineId: "GCM-02", mineName: "Gevra Open Cast Mine", description: "Bi-monthly statutory muster roll and contractor compliance certificate submission." },
  { id: "cmp-6", title: "Underground Methane (CH4) & CO Gas Sensor Calibration", category: "Safety", dueDate: "2026-09-01", status: "pending", isRecurring: true, mineId: "JCM-03", mineName: "Jharia Underground Coal Mine", description: "Optical flame safety lamps and multi-gas detector sensor bump test verification." },
  { id: "cmp-7", title: "Effluent Treatment Plant (ETP) Heavy Metals Discharge Test", category: "Environmental", dueDate: "2026-09-20", status: "pending", isRecurring: true, mineId: "UMR-06", mineName: "Umrer Open Cast Mine", description: "CPCB statutory discharge standards verification for acid mine drainage." },
  { id: "cmp-8", title: "Conveyor Emergency Pull-Wire & Audio-Visual Warning Alarm Audit", category: "Safety", dueDate: "2026-08-29", status: "completed", isRecurring: true, mineId: "SNG-07", mineName: "Singrauli Coal Basin", description: "Physical trip test of continuous 2.4km overland coal conveyor pull-wire trip switches." },
];

export const SEED_INSPECTIONS = [
  {
    id: "insp-101",
    title: "Quarterly Haul Road & Highwall Bench Stability Audit",
    type: "Slope Stability & Bench Inspection",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 West Bench",
    inspectorId: "demo_field_officer_uid",
    inspectorName: "Ramesh Kumar (Field Officer)",
    scheduledDate: "2026-08-28",
    priority: "critical",
    status: "submitted",
    summary: "Conducted exhaustive on-site audit of Pit 2 West crest. Observed 1 critical mechanical defect on Conveyor 4B and crest crack along bench 3.",
    observations: [
      {
        id: "obs-101-1",
        category: "Heavy Machinery & Conveyor",
        severity: "critical",
        location: "Conveyor 4B Drive Head Pulley",
        description: "Missing mechanical protective steel mesh guard around high-speed drive pulley. Immediate worker entanglement risk.",
        recommendations: "Immediate stop-work on drive pulley until certified guard is fitted and interlocked.",
        evidence: [{ name: "conveyor_drive_exposed.jpg", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80", type: "image/jpeg" }],
      },
      {
        id: "obs-101-2",
        category: "Structural",
        severity: "high",
        location: "Pit 2 Bench 3 Crest",
        description: "15-meter longitudinal tension crack (width 40mm) observed 2.5m from crest edge.",
        recommendations: "Erect danger signage, demarcate 5m exclusion zone, install displacement prism markers.",
        evidence: [{ name: "bench_crack_photo.jpg", url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&q=80", type: "image/jpeg" }],
      },
    ],
    submittedAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: "insp-102",
    title: "Electrical Substation & Fire Protection Statutory Audit",
    type: "Electrical & Substation Safety",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "East Substation 33kV",
    inspectorId: "demo_field_officer_uid",
    inspectorName: "Ramesh Kumar (Field Officer)",
    scheduledDate: "2026-08-30",
    priority: "medium",
    status: "in_progress",
    summary: "Transformers 1 & 2 operational. Fire extinguisher hydro-test check underway.",
    observations: [
      {
        id: "obs-102-1",
        category: "Fire Protection",
        severity: "medium",
        location: "Transformer Bay 2",
        description: "Dry chemical powder (DCP) fire extinguisher pressure gauge indicating recharge required.",
        recommendations: "Replace DCP extinguisher with serviced unit immediately.",
        evidence: [],
      },
    ],
  },
  {
    id: "insp-103",
    title: "Overland Coal Handling Plant (CHP) Dust Suppression Verification",
    type: "Environmental & Dust Compliance",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "CHP Transfer Tower 1",
    inspectorId: "demo_field_officer_uid",
    inspectorName: "Ramesh Kumar (Field Officer)",
    scheduledDate: "2026-08-25",
    priority: "high",
    status: "reviewed",
    summary: "Water atomizing mist cannons operational at crusher intake. Verified PM10 levels within statutory limits.",
    reviewNotes: "Audit verified and endorsed by Mine Manager. Dust suppression records uploaded to DGMS portal.",
    reviewedByName: "Suresh Sharma (Mine Official)",
    reviewedAt: new Date(Date.now() - 86400000 * 2),
    observations: [],
  },
  {
    id: "insp-104",
    title: "Monthly Heavy Earth Moving Machinery (HEMM) Braking Test",
    type: "Heavy Earth Moving Machinery (HEMM)",
    mineId: "GCM-02",
    mineName: "Gevra Open Cast Mine",
    zone: "Central HEMM Workshop",
    inspectorId: "fo_2",
    inspectorName: "Amitabh Sen (Safety Inspector)",
    scheduledDate: "2026-09-02",
    priority: "high",
    status: "assigned",
    observations: [],
  },
];

export const SEED_VIOLATIONS = [
  {
    id: "viol-201",
    title: "Exposed High-Speed Conveyor 4B Drive Pulley",
    category: "Heavy Machinery & Conveyor",
    severity: "critical",
    status: "open",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Conveyor 4B Drive Head",
    location: "Drive Pulley 4B",
    description: "Missing mechanical protective safety mesh guard around high-speed drive pulley. Violation of CMR 2017 Regulation 184.",
    inspectionId: "insp-101",
    aiRiskScore: 88,
    createdAt: new Date(Date.now() - 3600000 * 8),
  },
  {
    id: "viol-202",
    title: "Pit 2 Highwall Crest Tension Crack without Demarcation",
    category: "Structural",
    severity: "high",
    status: "in_progress",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 Bench 3 Crest",
    location: "Bench 3 Crest",
    description: "15m longitudinal crack along highwall crest posing bench failure hazard.",
    inspectionId: "insp-101",
    aiRiskScore: 74,
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    id: "viol-203",
    title: "Expired Fire Extinguisher in 33kV Substation",
    category: "Fire Protection",
    severity: "medium",
    status: "open",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "East Substation 33kV",
    location: "Transformer Bay 2",
    description: "Fire extinguisher depressurized.",
    inspectionId: "insp-102",
    aiRiskScore: 42,
    createdAt: new Date(Date.now() - 3600000 * 3),
  },
  {
    id: "viol-204",
    title: "Inadequate Dust Suppression on South Haul Road Switchback",
    category: "Environmental",
    severity: "high",
    status: "open",
    mineId: "GCM-02",
    mineName: "Gevra Open Cast Mine",
    zone: "South Haul Road",
    location: "Switchback 4",
    description: "Water bowser missed schedule, fugitive dust exceeding statutory limits.",
    aiRiskScore: 68,
    createdAt: new Date(Date.now() - 86400000 * 1),
  },
];

export const SEED_ACTIONS = [
  {
    id: "act-301",
    title: "Fabricate & Install Certified Steel Mesh Guard on Conveyor 4B",
    description: "Design, fabricate and bolt a certified 10-gauge steel mesh guard with electrical safety interlock around Conveyor 4B head pulley.",
    category: "Heavy Machinery & Conveyor",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Conveyor 4B Drive Head",
    priority: "critical",
    targetDate: "2026-08-26",
    status: "assigned",
    assignedTo: "demo_field_officer_uid",
    assignedToName: "Ramesh Kumar",
    responsibleCompany: "SECL Heavy Mechanical Works Ltd",
    aiRiskScore: 88,
  },
  {
    id: "act-302",
    title: "Install Highwall Optical Displacement Prisms on Bench 3",
    description: "Deploy 4 automated prisms and configure total station monitoring telemetry for active slope displacement.",
    category: "Structural",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "Pit 2 Bench 3 Crest",
    priority: "high",
    targetDate: "2026-09-02",
    status: "in_progress",
    assignedTo: "demo_field_officer_uid",
    assignedToName: "Ramesh Kumar",
    responsibleCompany: "GeoTech Mining Solutions India",
    aiRiskScore: 74,
  },
  {
    id: "act-303",
    title: "Recharge and Certify DCP Fire Extinguishers in Substation",
    description: "Replace unpressurized DCP cylinders and record test certificate on DGMS safety log.",
    category: "Fire Protection",
    mineId: "KCM-01",
    mineName: "Kusmunda Coal Mine",
    zone: "East Substation 33kV",
    priority: "medium",
    targetDate: "2026-08-29",
    status: "resolved",
    assignedTo: "demo_field_officer_uid",
    assignedToName: "Ramesh Kumar",
    responsibleCompany: "Central Mine Fire Safety Services",
    resolutionNotes: "Installed new 10kg DCP cylinder with certified hydrostatic test pressure stamp. Tag attached.",
    resolutionEvidence: [{ name: "cylinder_replaced.jpg", url: "https://images.unsplash.com/photo-1542013936693-884638332954?w=500&q=80" }],
    resolvedAt: new Date(Date.now() - 3600000 * 2),
    aiRiskScore: 42,
  },
  {
    id: "act-304",
    title: "Grade and Stabilize Pit 3 Haul Road Shoulder with 1.5m Berm",
    description: "Rebuild 1.5m boulder berm along outer curve to prevent haul truck wheel drop risk.",
    category: "Haul Road & Transport",
    mineId: "GCM-02",
    mineName: "Gevra Open Cast Mine",
    zone: "Pit 3 South Ramp",
    priority: "high",
    targetDate: "2026-08-20",
    status: "closed",
    assignedTo: "fo_2",
    assignedToName: "Amitabh Sen",
    responsibleCompany: "Earthmoving Infrastructure Logistics Ltd",
    verificationNotes: "Physical verification confirmed continuous 1.5m compacted rock berm completed.",
    verifiedByName: "Suresh Sharma (Mine Official)",
    verifiedAt: new Date(Date.now() - 86400000 * 3),
    aiRiskScore: 68,
  },
];

export const SEED_DOCUMENTS = [
  {
    id: "doc-401",
    fileName: "DGMS_Circular_Haul_Road_Safety_2024.pdf",
    relatedEntityType: "compliance",
    fileType: "application/pdf",
    uploadedBy: "demo_admin_uid",
    uploadedAt: new Date(Date.now() - 86400000 * 10),
    ocrText: `DIRECTORATE GENERAL OF MINES SAFETY (DGMS)\nSTATUTORY SAFETY CIRCULAR NO. 04 OF 2024\n\nSUBJECT: MANDATORY ROAD GRADIENT & BERM HEIGHT REGULATIONS IN OPEN CAST COAL MINES (CMR 2017 REGULATION 178)\n\n1. It has been observed in recent audits that haul road berms are frequently degraded by heavy dump truck traffic.\n2. All Coal Mine Managers are directed to ensure:\n   a. Maximum road gradient shall not exceed 1 in 16.\n   b. Continuous compacted rock berms of height not less than the axle diameter of the largest vehicle (minimum 1.5 meters) shall be maintained at all outer edges.\n   c. Night shift operations must have continuous illumination exceeding 15 lux on switchback curves.\n\nSd/-\nChief Inspector of Mines, Dhanbad`,
  },
  {
    id: "doc-402",
    fileName: "HEMM_Braking_Efficiency_Test_Certificate.jpg",
    relatedEntityType: "inspection",
    fileType: "image/jpeg",
    uploadedBy: "demo_field_officer_uid",
    uploadedAt: new Date(Date.now() - 86400000 * 4),
    ocrText: `CENTRAL MINE PLANNING & DESIGN INSTITUTE (CMPDI)\nMECHANICAL TESTING DIVISION — STATUTORY BRAKE RETARDATION TEST REPORT\n\nEQUIPMENT: Caterpillar 777D Off-Highway Dump Truck (Fleet No. HD-24)\nSERIAL NO: CAT-0777D-89412\nMINE: Kusmunda Coal Mine (SECL)\nDATE OF TEST: 24-AUG-2026\n\nTEST RESULTS:\n- Service Brake Stopping Distance from 30 km/h: 9.8 meters (Standard: <= 12.0m) — PASS\n- Emergency Brake Deceleration: 2.85 m/s2 — PASS\n- Secondary Steering Accumulator Discharge: 4 cycles — PASS\n- Retarder Oil Temperature Rise: 62 deg C — NORMAL\n\nCERTIFICATION: Equipment is certified for active coal haulage operations for 90 days.`,
  },
  {
    id: "doc-403",
    fileName: "Air_Quality_Dust_Suppression_Audit_Aug2026.png",
    relatedEntityType: "environmental",
    fileType: "image/png",
    uploadedBy: "demo_mine_official_uid",
    uploadedAt: new Date(Date.now() - 86400000 * 2),
    ocrText: `ENVIRONMENTAL POLLUTION CONTROL BOARD (CPCB) COMPLIANCE AUDIT\nKUSMUNDA OPEN CAST PROJECT — AMBIENT AIR QUALITY MONITORING\n\nLOCATION: Transfer Chute 3 / In-Pit Coal Crusher\nSAMPLING PERIOD: 24 Hours Continuous Gravimetric\n\nPARAMETERS RECORDED:\n- Respirable Dust (PM10): 2.14 mg/m3 (Statutory Limit: 3.00 mg/m3) — COMPLIANT\n- Fine Particulate (PM2.5): 58.4 ug/m3 (Standard: 60.0 ug/m3) — COMPLIANT\n- Sulfur Dioxide (SO2): 18.2 ug/m3 — COMPLIANT\n- Nitrogen Dioxide (NOx): 24.6 ug/m3 — COMPLIANT\n\nREMARKS: Fog cannon misting system effectively reducing fugitive dust by 78%.`,
  },
];

export const SEED_NOTIFICATIONS = [
  { id: "notif-1", title: "Statutory Inspection Submitted", message: "Ramesh Kumar submitted 'Quarterly Haul Road & Highwall Stability Audit' for your review.", isRead: false, createdAt: new Date(Date.now() - 3600000 * 5) },
  { id: "notif-2", title: "Critical Hazard Detected (AI Vision)", message: "AI Incident Vision flagged 'Exposed High-Speed Conveyor Pulley' on Conveyor 4B (Risk Score 88/100).", isRead: false, createdAt: new Date(Date.now() - 3600000 * 8) },
  { id: "notif-3", title: "Compliance Requirement Overdue", message: "Monthly Airborne Respirable Dust Suppression Verification is 10 days overdue.", isRead: false, createdAt: new Date(Date.now() - 86400000 * 2) },
  { id: "notif-4", title: "Corrective Action Ready for Sign-Off", message: "Substation Fire Extinguisher replacement has been resolved with proof photo. Awaiting verification.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 2) },
];

export const SEED_AUDIT_LOGS = [
  { action: "system_initialization", actorId: "system_admin", actorRole: "admin", entityType: "system", newValue: { message: "Seeded complete statutory Indian coal mining governance dataset." }, createdAt: new Date(Date.now() - 86400000 * 5) },
  { action: "create_mine", actorId: "demo_admin_uid", actorRole: "admin", entityType: "mine", entityId: "KCM-01", newValue: { name: "Kusmunda Coal Mine", zone: "Chhattisgarh" }, createdAt: new Date(Date.now() - 86400000 * 4) },
  { action: "create_compliance_requirement", actorId: "demo_mine_official_uid", actorRole: "mine_official", entityType: "complianceRequirement", entityId: "cmp-1", newValue: { title: "Quarterly DGMS Haul Road Gradient Audit" }, createdAt: new Date(Date.now() - 86400000 * 3) },
  { action: "create_inspection", actorId: "demo_mine_official_uid", actorRole: "mine_official", entityType: "inspection", entityId: "insp-101", newValue: { title: "Quarterly Haul Road & Highwall Stability Audit", priority: "critical" }, createdAt: new Date(Date.now() - 86400000 * 2) },
  { action: "submit_inspection", actorId: "demo_field_officer_uid", actorRole: "field_officer", entityType: "inspection", entityId: "insp-101", newValue: { observationsCount: 2, summary: "Completed physical slope inspection." }, createdAt: new Date(Date.now() - 3600000 * 5) },
  { action: "create_corrective_action", actorId: "demo_mine_official_uid", actorRole: "mine_official", entityType: "correctiveAction", entityId: "act-301", newValue: { title: "Install Certified Steel Mesh Guard on Conveyor 4B", priority: "critical" }, createdAt: new Date(Date.now() - 3600000 * 4) },
  { action: "upload_document", actorId: "demo_admin_uid", actorRole: "admin", entityType: "document", entityId: "doc-401", newValue: { fileName: "DGMS_Circular_Haul_Road_Safety_2024.pdf" }, createdAt: new Date(Date.now() - 86400000 * 1) },
];

export async function seedDatabase() {
  console.log("Seeding MineRakshak AI rich statutory coal mining dataset...");

  // 1. Mines
  for (const m of SEED_MINES) {
    await db.collection("mines").doc(m.id).set(m, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_MINES.length} Coal Mine Facilities (Chhattisgarh, Jharkhand, MP, Maharashtra)`);

  // 2. Users
  for (const u of SEED_USERS) {
    await db.collection("users").doc(u.uid).set(u, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_USERS.length} User Accounts across all 4 Personas`);

  // 3. Compliance Requirements
  for (const c of SEED_COMPLIANCE) {
    await db.collection("complianceRequirements").doc(c.id).set(c, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_COMPLIANCE.length} Statutory Compliance Requirements`);

  // 4. Inspections
  for (const i of SEED_INSPECTIONS) {
    await db.collection("inspections").doc(i.id).set(i, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_INSPECTIONS.length} Statutory Inspections`);

  // 5. Violations
  for (const v of SEED_VIOLATIONS) {
    await db.collection("violations").doc(v.id).set(v, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_VIOLATIONS.length} Open & In-Progress Hazards/Violations`);

  // 6. Corrective Actions
  for (const a of SEED_ACTIONS) {
    await db.collection("correctiveActions").doc(a.id).set(a, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_ACTIONS.length} Corrective Action Remediations (Overdue, In-Progress, Resolved)`);

  // 7. Documents & OCR
  for (const d of SEED_DOCUMENTS) {
    await db.collection("documents").doc(d.id).set(d, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_DOCUMENTS.length} Scanned Statutory Documents with OCR Text`);

  // 8. Notifications
  for (const n of SEED_NOTIFICATIONS) {
    await db.collection("notifications").doc(n.id).set(n, { merge: true });
  }
  console.log(`✓ Seeded ${SEED_NOTIFICATIONS.length} In-App Notifications & Priority Alerts`);

  // 9. Audit Logs
  for (const l of SEED_AUDIT_LOGS) {
    await db.collection("auditLogs").add(l);
  }
  console.log(`✓ Seeded ${SEED_AUDIT_LOGS.length} Immutable Audit Log Records`);

  console.log("\n=======================================================");
  console.log("  ALL 4 DASHBOARDS & 9 MODULES FULLY POPULATED WITH DATA!");
  console.log("=======================================================");
}

if (process.argv[1]?.endsWith("seed.js")) {
  seedDatabase().then(() => process.exit(0)).catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
}
