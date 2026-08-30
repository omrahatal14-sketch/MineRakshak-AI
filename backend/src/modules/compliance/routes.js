import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/compliance-requirements — List compliance items
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { mine, category, status } = req.query;
    const snap = await db.collection("complianceRequirements").get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (mine && mine !== "all") {
      items = items.filter((c) => c.mineId === mine);
    }
    if (category && category !== "all") {
      items = items.filter((c) => c.category === category);
    }
    if (status && status !== "all") {
      items = items.filter((c) => c.status === status);
    }

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/compliance-requirements — Create compliance requirement
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const id = `cmp_${Date.now()}`;
    const compData = {
      id,
      ...req.body,
      status: req.body.status || "pending",
      createdAt: new Date(),
    };
    await db.collection("complianceRequirements").doc(id).set(compData);
    await logAudit(req.user.uid, "create_compliance", "complianceRequirement", id, null, compData, req.user.role);
    res.status(201).json(compData);
  } catch (err) {
    next(err);
  }
});

export default router;
