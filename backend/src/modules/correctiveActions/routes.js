import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/corrective-actions — List actions
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, priority, mine, search } = req.query;
    const snap = await db.collection("correctiveActions").get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (req.user.role === "field_officer" && req.user.mineId) {
      items = items.filter((a) => a.mineId === req.user.mineId || a.assignedTo === req.user.uid);
    }
    if (status && status !== "all") {
      items = items.filter((a) => a.status === status);
    }
    if (priority && priority !== "all") {
      items = items.filter((a) => a.priority === priority);
    }
    if (mine && mine !== "all") {
      items = items.filter((a) => a.mineId === mine);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((a) => (a.title || "").toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q));
    }

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/corrective-actions/:id — Get action by ID
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await db.collection("correctiveActions").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Action not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
});

// POST /api/corrective-actions — Create action
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const id = `act_${Date.now()}`;
    const actionData = {
      id,
      ...req.body,
      status: req.body.status || "assigned",
      createdAt: new Date(),
    };
    await db.collection("correctiveActions").doc(id).set(actionData);
    await logAudit(req.user.uid, "create_corrective_action", "correctiveAction", id, null, actionData, req.user.role);
    res.status(201).json(actionData);
  } catch (err) {
    next(err);
  }
});

// PUT /api/corrective-actions/:id — Update action
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection("correctiveActions").doc(id).set(updateData, { merge: true });
    await logAudit(req.user.uid, "update_corrective_action", "correctiveAction", id, null, updateData, req.user.role);
    res.json({ success: true, id, ...updateData });
  } catch (err) {
    next(err);
  }
});

// POST /api/corrective-actions/:id/verify — Verify action
router.post("/:id/verify", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationNotes, status = "closed" } = req.body;
    const updateData = {
      status,
      verificationNotes: verificationNotes || "Action verified and closed by authorized authority.",
      verifiedByName: req.user.name,
      verifiedBy: req.user.uid,
      verifiedAt: new Date(),
    };
    await db.collection("correctiveActions").doc(id).set(updateData, { merge: true });
    await logAudit(req.user.uid, "verify_corrective_action", "correctiveAction", id, null, updateData, req.user.role);
    res.json({ success: true, message: "Action verified and closed.", id, ...updateData });
  } catch (err) {
    next(err);
  }
});

export default router;
