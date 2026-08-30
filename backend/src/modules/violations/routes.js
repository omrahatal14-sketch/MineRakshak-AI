import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/violations — List violations
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, severity, mine } = req.query;
    const snap = await db.collection("violations").get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (req.user.role === "field_officer" && req.user.mineId) {
      items = items.filter((v) => v.mineId === req.user.mineId);
    }
    if (status && status !== "all") {
      items = items.filter((v) => v.status === status);
    }
    if (severity && severity !== "all") {
      items = items.filter((v) => v.severity === severity);
    }
    if (mine && mine !== "all") {
      items = items.filter((v) => v.mineId === mine);
    }

    // Sort newest first
    items.sort((a, b) => {
      const dateA = new Date(a.createdAt?._seconds ? a.createdAt._seconds * 1000 : a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt?._seconds ? b.createdAt._seconds * 1000 : b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/violations — Create violation
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const id = `viol_${Date.now()}`;
    const violData = {
      id,
      title: req.body.title || req.body.detectedHazard || "Safety Violation",
      description: req.body.description || req.body.recommendations || "Hazard requires corrective action.",
      ...req.body,
      status: req.body.status || "open",
      createdAt: new Date(),
    };
    await db.collection("violations").doc(id).set(violData);
    await logAudit(req.user.uid, "create_violation", "violation", id, null, violData, req.user.role);
    res.status(201).json(violData);
  } catch (err) {
    next(err);
  }
});

export default router;
