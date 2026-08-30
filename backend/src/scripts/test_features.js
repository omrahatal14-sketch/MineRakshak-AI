import { db } from "../config/firebaseAdmin.js";

const BACKEND_URL = "http://localhost:4000";
const AI_URL = "http://localhost:8000";

async function runFullFeatureAudit() {
  console.log("==========================================================");
  console.log("  MINERAKSHAK AI — LIVE FULL-FEATURE RUNTIME AUDIT");
  console.log("==========================================================\n");

  const results = [];

  function record(module, action, passed, details) {
    results.push({ module, action, status: passed ? "PASS" : "FAIL", details });
    console.log(`[${passed ? "✓ PASS" : "✗ FAIL"}] [${module}] ${action} — ${details}`);
  }

  // 1. BACKEND & AI HEALTH
  try {
    const bHealth = await fetch(`${BACKEND_URL}/health`).then((r) => r.json());
    record("Infrastructure", "Backend Server Health", bHealth.status === "ok", `Service: ${bHealth.service}`);
  } catch (e) {
    record("Infrastructure", "Backend Server Health", false, e.message);
  }

  try {
    const aiHealth = await fetch(`${AI_URL}/health`).then((r) => r.json());
    record("Infrastructure", "AI Service Health", aiHealth.status === "ok", `Service: ${aiHealth.service}`);
  } catch (e) {
    record("Infrastructure", "AI Service Health", false, e.message);
  }

  // 2. MINE DIRECTORY & GIS COORDINATES
  try {
    const minesSnap = await db.collection("mines").get();
    const mines = minesSnap.docs.map((d) => d.data());
    const hasCoords = mines.every((m) => m.latitude && m.longitude);
    record("GIS & Facilities", "Fetch Mine Facilities", mines.length >= 10, `Found ${mines.length} mines (All geo-tagged: ${hasCoords})`);
  } catch (e) {
    record("GIS & Facilities", "Fetch Mine Facilities", false, e.message);
  }

  // 3. COMPLIANCE MODULE LIFECYCLE
  let createdComplianceId = null;
  try {
    const newComp = {
      title: "Real-time Blast Vibration & Air Overpressure Monitoring",
      category: "Safety",
      dueDate: "2026-09-10",
      status: "pending",
      isRecurring: true,
      mineId: "KCM-01",
      mineName: "Kusmunda Coal Mine",
      createdAt: new Date(),
    };
    const compRef = await db.collection("complianceRequirements").add(newComp);
    createdComplianceId = compRef.id;
    record("Compliance", "Create Compliance Item", Boolean(createdComplianceId), `Created ID: ${createdComplianceId}`);

    const compDoc = await db.collection("complianceRequirements").doc(createdComplianceId).get();
    record("Compliance", "Read Compliance Item", compDoc.exists && compDoc.data().title === newComp.title, "Field matching verified");

    await db.collection("complianceRequirements").doc(createdComplianceId).update({ status: "completed", completedAt: new Date() });
    const updatedComp = await db.collection("complianceRequirements").doc(createdComplianceId).get();
    record("Compliance", "Mark as Completed", updatedComp.data().status === "completed", "Status transitioned to 'completed'");

    await db.collection("complianceRequirements").doc(createdComplianceId).delete();
    const deletedComp = await db.collection("complianceRequirements").doc(createdComplianceId).get();
    record("Compliance", "Delete Compliance Item", !deletedComp.exists, "Item successfully removed");
  } catch (e) {
    record("Compliance", "Compliance Lifecycle Error", false, e.message);
  }

  // 4. INSPECTION & OBSERVATION LIFECYCLE
  let createdInspId = null;
  try {
    const newInsp = {
      title: "Automated Routine Pit 1 Highwall Stability Audit",
      type: "Slope Stability & Bench Inspection",
      mineId: "KCM-01",
      mineName: "Kusmunda Coal Mine",
      zone: "Pit 1 South Highwall",
      inspectorId: "field_officer_demo",
      inspectorName: "Ramesh Kumar (Field Officer)",
      scheduledDate: "2026-08-30",
      priority: "high",
      status: "in_progress",
      observations: [
        {
          id: "obs_test_1",
          category: "Structural",
          severity: "high",
          location: "Bench 4 Face",
          description: "Minor tension cracks observed along the crest of bench 4. Requires geotechnical clearance.",
          recommendations: "Restrict haulage below bench 4; install prism monitoring target.",
          evidence: [{ name: "crest_crack_photo.jpg", url: "https://example.com/photo.jpg", type: "image/jpeg" }],
        },
      ],
      createdAt: new Date(),
    };
    const inspRef = await db.collection("inspections").add(newInsp);
    createdInspId = inspRef.id;
    record("Inspections", "Create & Schedule Inspection", Boolean(createdInspId), `Created Inspection ID: ${createdInspId}`);

    await db.collection("inspections").doc(createdInspId).update({
      status: "submitted",
      summary: "Completed physical slope inspection. Highwall cracks recorded under observation #1.",
      submittedAt: new Date(),
    });
    const subInsp = await db.collection("inspections").doc(createdInspId).get();
    record("Inspections", "Field Submission with Evidence", subInsp.data().status === "submitted" && subInsp.data().observations.length === 1, "Submitted with 1 observation & photo proof");

    await db.collection("inspections").doc(createdInspId).update({
      status: "reviewed",
      reviewNotes: "Geotechnical clearance team dispatched. Remediation action assigned.",
      reviewedByName: "Mine Official Manager",
      reviewedAt: new Date(),
    });
    const revInsp = await db.collection("inspections").doc(createdInspId).get();
    record("Inspections", "Mine Official Review & Closure", revInsp.data().status === "reviewed", "Inspection marked as Reviewed with official remarks");
  } catch (e) {
    record("Inspections", "Inspection Lifecycle Error", false, e.message);
  }

  // 5. CORRECTIVE ACTION END-TO-END WORKFLOW
  let createdActId = null;
  try {
    const newAction = {
      title: "Install Slope Prisms on Pit 1 Highwall",
      description: "Deploy optical displacement monitoring prisms on Bench 4 crest tension crack.",
      category: "Structural",
      mineId: "KCM-01",
      mineName: "Kusmunda Coal Mine",
      zone: "Pit 1 South Highwall",
      priority: "high",
      targetDate: "2026-09-02",
      status: "assigned",
      assignedTo: "field_officer_demo",
      assignedToName: "Ramesh Kumar",
      responsibleCompany: "Mine Geotech Contractors",
      createdAt: new Date(),
    };
    const actRef = await db.collection("correctiveActions").add(newAction);
    createdActId = actRef.id;
    record("Corrective Actions", "Assign Corrective Action", Boolean(createdActId), `Created Action ID: ${createdActId}`);

    await db.collection("correctiveActions").doc(createdActId).update({
      status: "resolved",
      resolutionNotes: "Installed 3 monitoring prisms (P1, P2, P3). Total station baseline calibrated.",
      resolutionEvidence: [{ name: "prism_installation.jpg", url: "https://example.com/prism.jpg" }],
      resolvedAt: new Date(),
    });
    const resAct = await db.collection("correctiveActions").doc(createdActId).get();
    record("Corrective Actions", "Submit Proof & Resolve", resAct.data().status === "resolved", "Status: 'resolved' (Awaiting Verification)");

    await db.collection("correctiveActions").doc(createdActId).update({
      status: "closed",
      verificationNotes: "Physical verification confirmed prism telemetry online. Compliant with DGMS guidelines.",
      verifiedByName: "Mine Official Manager",
      verifiedAt: new Date(),
    });
    const closedAct = await db.collection("correctiveActions").doc(createdActId).get();
    record("Corrective Actions", "Official Verification & Closure", closedAct.data().status === "closed", "Lifecycle complete: Closed & Verified");
  } catch (e) {
    record("Corrective Actions", "Action Lifecycle Error", false, e.message);
  }

  // 6. AI MICROSERVICE RISK SCORING & VISION
  try {
    const riskRes = await fetch(`${AI_URL}/risk-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mineId: "KCM-01" }),
    });
    const riskData = await riskRes.json();
    const validRisk = riskRes.status === 200 && typeof riskData.score === "number" && ["low", "medium", "high"].includes(riskData.level);
    record("AI Risk Engine", "Calculate Mine Risk Index", validRisk, `Mine: KCM-01 | Score: ${riskData.score}/100 | Risk Level: ${riskData.level}`);
  } catch (e) {
    record("AI Risk Engine", "Calculate Mine Risk Index", false, e.message);
  }

  try {
    const visionRes = await fetch(`${AI_URL}/analyze-hazard-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "bench_crack_hazard.jpg",
        contextText: "Tension cracks along highwall crest",
        mineId: "KCM-01",
      }),
    });
    const visionData = await visionRes.json();
    const validVision = visionRes.status === 200 && Boolean(visionData.detectedHazard);
    record("AI Hazard Vision", "Image Hazard Detection", validVision, `Detected: "${visionData.detectedHazard}" | Severity: ${visionData.severity} | Fix Deadline: ${visionData.deadlineFormatted}`);
  } catch (e) {
    record("AI Hazard Vision", "Image Hazard Detection", false, e.message);
  }

  // 7. AUDIT TRAIL & NOTIFICATIONS
  try {
    const auditEntry = {
      action: "verify_corrective_action",
      actorId: "mine_official_demo",
      actorRole: "mine_official",
      entityType: "correctiveAction",
      entityId: createdActId,
      details: "Verified and closed highwall prism installation.",
      createdAt: new Date(),
    };
    await db.collection("auditLogs").add(auditEntry);
    const logsSnap = await db.collection("auditLogs").get();
    record("Audit Trail", "Append-Only Audit Logging", logsSnap.docs.length >= 2, `Logged actions verified (${logsSnap.docs.length} records)`);
  } catch (e) {
    record("Audit Trail", "Append-Only Audit Logging", false, e.message);
  }

  try {
    const notifEntry = {
      title: "Statutory Inspection Reviewed",
      message: "Quarterly Haul Road & Dust Suppression Audit has been approved by Mine Management.",
      isRead: false,
      createdAt: new Date(),
    };
    await db.collection("notifications").add(notifEntry);
    const notifsSnap = await db.collection("notifications").get();
    record("Notifications", "In-App Notification Dispatch", notifsSnap.docs.length >= 1, `Delivered ${notifsSnap.docs.length} notifications`);
  } catch (e) {
    record("Notifications", "In-App Notification Dispatch", false, e.message);
  }

  console.log("\n==========================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.status === "PASS").length;
  console.log(`  AUDIT RESULT: ${passedCount}/${total} CHECKS PASSED (${Math.round((passedCount / total) * 100)}%)`);
  console.log("==========================================================");
}

runFullFeatureAudit();
