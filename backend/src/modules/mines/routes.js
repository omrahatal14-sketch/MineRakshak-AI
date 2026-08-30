import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/mines — List all mines
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const snap = await db.collection("mines").get();
    const mines = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(mines);
  } catch (err) {
    next(err);
  }
});

// GET /api/mines/:id — Get specific mine
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await db.collection("mines").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Mine not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
});

// POST /api/mines — Create mine (Admin only)
router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { name, code, zone, latitude, longitude, status = "active", annualTargetMT = 0 } = req.body;
    const id = code || `mine_${Date.now()}`;
    const mineData = {
      id,
      name,
      code: code || id,
      zone,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status,
      annualTargetMT: Number(annualTargetMT),
      createdAt: new Date(),
    };
    await db.collection("mines").doc(id).set(mineData);
    await logAudit(req.user.uid, "create_mine", "mine", id, null, mineData, req.user.role);
    res.status(201).json(mineData);
  } catch (err) {
    next(err);
  }
});

// PUT /api/mines/:id — Update mine (Admin only)
router.put("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection("mines").doc(id).set(updateData, { merge: true });
    await logAudit(req.user.uid, "update_mine", "mine", id, null, updateData, req.user.role);
    res.json({ success: true, id, ...updateData });
  } catch (err) {
    next(err);
  }
});

export default router;
