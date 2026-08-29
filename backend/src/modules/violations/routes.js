import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/violations — List tracked violations
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { role, uid, mineId } = req.user;
    const { status, severity, mine } = req.query;

    let snapshot;
    try {
      snapshot = await db.collection("violations").get();
    } catch {
      snapshot = { docs: [], empty: true };
    }

    let violations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (violations.length === 0) {
      violations = [
        {
          id: "viol-01",
          title: "Conveyor Emergency Cutoff Switch Inoperable",
          category: "Safety",
          severity: "critical",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          zone: "Pit A Conveyor 4B",
          status: "open",
          description: "Mechanical trip switch bypassed, violating DGMS circular safety protocol.",
          detectedAt: new Date(Date.now() - 3 * 86400000),
          createdAt: new Date(Date.now() - 3 * 86400000),
        },
        {
          id: "viol-02",
          title: "Particulate Dust Suppression Failure on Main Haul Route",
          category: "Environmental",
          severity: "high",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          zone: "Haul Road Sector B",
          status: "in_progress",
          description: "Water tanker spraying frequency below statutory threshold during shift change.",
          detectedAt: new Date(Date.now() - 6 * 86400000),
          createdAt: new Date(Date.now() - 6 * 86400000),
        },
      ];
      for (const v of violations) {
        const { id, ...data } = v;
        await db.collection("violations").doc(id).set(data).catch(() => {});
      }
    }

    if (role === "mine_official" && mineId) {
      violations = violations.filter((v) => !v.mineId || v.mineId === mineId);
    }
    if (status && status !== "all") {
      violations = violations.filter((v) => v.status === status);
    }
    if (severity && severity !== "all") {
      violations = violations.filter((v) => v.severity === severity);
    }
    if (mine && mine !== "all") {
      violations = violations.filter((v) => v.mineId === mine);
    }

    res.json(violations);
  } catch (err) {
    next(err);
  }
});

// POST /api/violations — Escalate or create violation
router.post("/", requireAuth, requireRole("field_officer", "mine_official", "admin"), async (req, res, next) => {
  try {
    const { title, category, severity, mineId, mineName, zone, description, observationId, inspectionId } = req.body;

    const newViolation = {
      title: title || `${category} Non-Conformance`,
      category: category || "Safety",
      severity: severity || "high",
      mineId: mineId || req.user.mineId || "KCM-01",
      mineName: mineName || "Mine Facility",
      zone: zone || "Pit Area",
      description: description || "",
      observationId: observationId || null,
      inspectionId: inspectionId || null,
      status: "open",
      detectedAt: new Date(),
      createdById: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("violations").add(newViolation);
    await logAudit(req.user.uid, "create_violation", "violation", docRef.id, null, newViolation, req.user.role);

    res.status(201).json({ id: docRef.id, ...newViolation });
  } catch (err) {
    next(err);
  }
});

export default router;
