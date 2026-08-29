// Seeds Firebase Auth + Firestore with realistic synthetic data for the MineRakshak AI demo.
// Run: node seed.js   (from firebase/seed, after `npm install`)
//
// Requires ../service-account.json (Firebase console → Project Settings → Service Accounts).

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(readFileSync(new URL("../service-account.json", import.meta.url)));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

const DEMO_PASSWORD = "MineRakshak@123";

const daysAgo = (n) => Timestamp.fromDate(new Date(Date.now() - n * 24 * 60 * 60 * 1000));
const daysFromNow = (n) => Timestamp.fromDate(new Date(Date.now() + n * 24 * 60 * 60 * 1000));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function upsertAuthUser({ email, name, role, mineId }) {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch {
    userRecord = await auth.createUser({ email, password: DEMO_PASSWORD, displayName: name });
  }
  await auth.setCustomUserClaims(userRecord.uid, { role, mineId: mineId ?? null });
  await db.collection("users").doc(userRecord.uid).set({
    name, email, role, mineId: mineId ?? null, status: "active", createdAt: daysAgo(120),
  });
  return userRecord.uid;
}

async function seed() {
  console.log("Seeding mines...");
  const mineDefs = [
    { name: "Kusmunda Coal Mine", code: "KCM-01", zone: "Chhattisgarh", latitude: 22.309, longitude: 82.679 },
    { name: "Gevra Coal Mine", code: "GCM-02", zone: "Chhattisgarh", latitude: 22.331, longitude: 82.591 },
    { name: "Jharia Coalfield", code: "JCF-03", zone: "Jharkhand", latitude: 23.739, longitude: 86.414 },
  ];
  const mineIds = [];
  for (const m of mineDefs) {
    const ref = await db.collection("mines").add({ ...m, status: "active", createdAt: daysAgo(200) });
    mineIds.push(ref.id);
  }

  console.log("Seeding users (one per role)...");
  const adminId = await upsertAuthUser({ email: "admin@minerakshak.demo", name: "System Admin", role: "admin" });
  const corporateId = await upsertAuthUser({ email: "corporate@minerakshak.demo", name: "Corporate Reviewer", role: "corporate" });
  const officialIds = [];
  for (const [i, mineId] of mineIds.entries()) {
    officialIds.push(await upsertAuthUser({ email: `official${i + 1}@minerakshak.demo`, name: `Mine Official ${i + 1}`, role: "mine_official", mineId }));
  }
  const inspectorIds = [];
  for (const [i, mineId] of mineIds.entries()) {
    inspectorIds.push(await upsertAuthUser({ email: `inspector${i + 1}@minerakshak.demo`, name: `Field Officer ${i + 1}`, role: "field_officer", mineId }));
  }

  console.log("Seeding compliance requirements...");
  const categories = ["Safety", "Environmental", "Structural", "Equipment", "Documentation"];
  for (const mineId of mineIds) {
    for (let i = 0; i < 4; i++) {
      await db.collection("complianceRequirements").add({
        mineId,
        title: `${pick(categories)} compliance review #${i + 1}`,
        description: "Statutory periodic compliance requirement.",
        category: pick(categories),
        dueDate: pick([daysFromNow(10), daysFromNow(30), daysAgo(5), daysAgo(20)]),
        status: pick(["pending", "pending", "overdue", "completed"]),
        isRecurring: i % 2 === 0,
        createdAt: daysAgo(90),
      });
    }
  }

  console.log("Seeding inspections, observations, violations, corrective actions...");
  const severities = ["low", "medium", "high", "critical"];
  for (const [idx, mineId] of mineIds.entries()) {
    const inspectorId = inspectorIds[idx];
    const officialId = officialIds[idx];

    for (let i = 0; i < 6; i++) {
      const ageDays = 5 + i * 12;
      const inspectionRef = await db.collection("inspections").add({
        mineId, inspectorId,
        inspectionDate: daysAgo(ageDays),
        status: i === 0 ? "submitted" : "reviewed",
        checklist: { areasCovered: pick(["Pit A", "Pit B", "Conveyor Zone", "Storage Yard"]), notes: "Routine field inspection." },
        createdAt: daysAgo(ageDays), updatedAt: daysAgo(ageDays - 1 > 0 ? ageDays - 1 : 0),
      });

      const observationRef = await db.collection("observations").add({
        inspectionId: inspectionRef.id,
        category: pick(categories),
        description: "Observed condition requiring review during routine inspection.",
        severity: pick(severities),
        status: pick(["open", "reviewed"]),
        createdAt: daysAgo(ageDays),
      });

      // ~half the observations escalate into a tracked violation
      if (i % 2 === 0) {
        const severity = pick(severities);
        const violationRef = await db.collection("violations").add({
          observationId: observationRef.id, inspectionId: inspectionRef.id, mineId,
          category: pick(categories), severity,
          description: "Non-conformance identified against compliance requirement.",
          status: pick(["open", "in_progress", "closed"]),
          detectedAt: daysAgo(ageDays), createdAt: daysAgo(ageDays),
        });

        const targetInPast = i % 4 === 0; // some deliberately overdue, for the demo
        await db.collection("correctiveActions").add({
          violationId: violationRef.id,
          assignedTo: officialId,
          description: "Assigned corrective action to address the identified violation.",
          targetDate: targetInPast ? daysAgo(3) : daysFromNow(14),
          status: targetInPast ? "overdue" : pick(["assigned", "in_progress"]),
          verifiedBy: null, verifiedAt: null,
          createdAt: daysAgo(ageDays - 1 > 0 ? ageDays - 1 : 0), updatedAt: daysAgo(1),
        });
      }
    }
  }

  console.log("Seeding a few notifications...");
  for (const officialId of officialIds) {
    await db.collection("notifications").add({
      userId: officialId, type: "overdue_action",
      title: "Corrective action overdue",
      message: "A corrective action assigned to you has passed its target date.",
      relatedEntityType: "correctiveAction", relatedEntityId: null,
      isRead: false, createdAt: daysAgo(1),
    });
  }

  console.log("\nDone. Demo logins (password for all: " + DEMO_PASSWORD + "):");
  console.log("  admin@minerakshak.demo        (System Admin)");
  console.log("  corporate@minerakshak.demo    (Corporate Management)");
  console.log("  official1@minerakshak.demo    (Mine Official — Kusmunda)");
  console.log("  inspector1@minerakshak.demo   (Field Officer — Kusmunda)");
  console.log("  ...official2/3, inspector2/3 for the other two mines");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
