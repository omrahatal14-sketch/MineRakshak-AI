import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/inspections — List inspections
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, mine, search } = req.query;
    const snap = await db.collection("inspections").get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (req.user.role === "field_officer" && req.user.mineId) {
      items = items.filter((i) => i.mineId === req.user.mineId || i.inspectorId === req.user.uid);
    }
    if (status && status !== "all") {
      items = items.filter((i) => i.status === status);
    }
    if (mine && mine !== "all") {
      items = items.filter((i) => i.mineId === mine);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => (i.title || "").toLowerCase().includes(q) || (i.mineName || "").toLowerCase().includes(q));
    }

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/inspections/:id — Get inspection detail
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await db.collection("inspections").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Inspection not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
});

// POST /api/inspections — Create inspection
router.post("/", requireAuth, requireRole("admin", "mine_official", "corporate"), async (req, res, next) => {
  try {
    const { title, type, mineId, mineName, zone, inspectorId, inspectorName, scheduledDate, priority = "medium" } = req.body;
    const id = `insp_${Date.now()}`;
    const inspectionData = {
      id,
      title,
      type: type || "General Safety Inspection",
      mineId,
      mineName,
      zone: zone || "Primary Operational Pit",
      inspectorId: inspectorId || req.user.uid,
      inspectorName: inspectorName || req.user.name,
      scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
      priority,
      status: "assigned",
      observations: [],
      createdAt: new Date(),
    };
    await db.collection("inspections").doc(id).set(inspectionData);
    await logAudit(req.user.uid, "create_inspection", "inspection", id, null, inspectionData, req.user.role);
    res.status(201).json(inspectionData);
  } catch (err) {
    next(err);
  }
});

// PUT /api/inspections/:id — Update inspection
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection("inspections").doc(id).set(updateData, { merge: true });
    await logAudit(req.user.uid, "update_inspection", "inspection", id, null, updateData, req.user.role);
    res.json({ success: true, id, ...updateData });
  } catch (err) {
    next(err);
  }
});

// POST /api/inspections/:id/submit — Submit inspection from field
router.post("/:id/submit", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { summary, observations = [] } = req.body;
    const doc = await db.collection("inspections").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Inspection not found" });

    const updateData = {
      status: "submitted",
      ...(summary && { summary }),
      ...(observations.length > 0 && { observations }),
      submittedAt: new Date(),
      submittedBy: req.user.uid,
    };
    await db.collection("inspections").doc(id).set(updateData, { merge: true });
    await logAudit(req.user.uid, "submit_inspection", "inspection", id, null, updateData, req.user.role);
    res.json({ success: true, message: "Inspection submitted for official review.", id, ...updateData });
  } catch (err) {
    next(err);
  }
});

// POST /api/inspections/:id/review — Review inspection (Mine Official / Admin)
router.post("/:id/review", requireAuth, requireRole("admin", "mine_official"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNotes, status = "reviewed" } = req.body;
    const updateData = {
      status,
      reviewNotes: reviewNotes || "Inspection findings reviewed and endorsed.",
      reviewedByName: req.user.name,
      reviewedBy: req.user.uid,
      reviewedAt: new Date(),
    };
    await db.collection("inspections").doc(id).set(updateData, { merge: true });
    await logAudit(req.user.uid, "review_inspection", "inspection", id, null, updateData, req.user.role);
    res.json({ success: true, message: "Inspection reviewed.", id, ...updateData });
  } catch (err) {
    next(err);
  }
});

// POST /api/inspections/:id/observations — Add observation
router.post("/:id/observations", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const obs = req.body;
    const doc = await db.collection("inspections").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Inspection not found" });

    const currentObs = doc.data()?.observations || [];
    const obsId = obs.id || `obs_${Date.now()}`;
    const newObs = { id: obsId, ...obs, createdAt: new Date() };
    const updatedObs = [...currentObs, newObs];

    await db.collection("inspections").doc(id).update({ observations: updatedObs });
    await logAudit(req.user.uid, "add_observation", "observation", obsId, null, newObs, req.user.role);
    res.status(201).json(newObs);
  } catch (err) {
    next(err);
  }
});

export default router;
