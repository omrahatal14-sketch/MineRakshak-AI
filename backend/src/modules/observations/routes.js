import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/observations — List observations
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { inspectionId } = req.query;
    let snap;
    if (inspectionId) {
      snap = await db.collection("observations").where("inspectionId", "==", inspectionId).get();
    } else {
      snap = await db.collection("observations").get();
    }
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/observations — Create observation
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const id = `obs_${Date.now()}`;
    const obsData = { id, ...req.body, createdBy: req.user.uid, createdAt: new Date() };
    await db.collection("observations").doc(id).set(obsData);
    await logAudit(req.user.uid, "create_observation", "observation", id, null, obsData, req.user.role);
    res.status(201).json(obsData);
  } catch (err) {
    next(err);
  }
});

export default router;
