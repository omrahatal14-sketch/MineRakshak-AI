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
      title: req.body.title || req.body.detectedHazard || "Corrective Remediation",
      description: req.body.description || req.body.recommendations || "Statutory hazard remediation required.",
      category: req.body.category || "Safety",
      mineId: req.body.mineId || "KCM-01",
      mineName: req.body.mineName || "Kusmunda Coal Mine",
      zone: req.body.zone || "Pit A - Primary Extraction Zone",
      priority: req.body.priority || "high",
      targetDate: req.body.targetDate || req.body.deadline || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      assignedTo: req.body.assignedTo || req.body.inspectorId || req.user.uid,
      assignedToName: req.body.assignedToName || req.body.inspectorName || "Field Inspector",
      responsibleCompany: req.body.responsibleCompany || req.body.responsibleParty || "Plant Maintenance Contractor",
      status: req.body.status || "assigned",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("correctiveActions").doc(id).set(actionData);
    await logAudit(req.user.uid, "create_corrective_action", "correctiveAction", id, null, actionData, req.user.role);
    res.status(201).json(actionData);
  } catch (err) {
    next(err);
  }
});

// POST /api/corrective-actions/:id/resolve — Submit resolution proof (Field Officer / Contractor)
router.post("/:id/resolve", requireAuth, async (req, res, next) => {
  try {
    const { notes, evidence = [] } = req.body;
    const docRef = db.collection("correctiveActions").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Action not found" });

    const updateData = {
      status: "resolved",
      resolutionNotes: notes,
      resolutionEvidence: evidence,
      resolvedAt: new Date(),
      resolvedById: req.user.uid,
      resolvedByName: req.user.name,
      updatedAt: new Date(),
    };

    await docRef.update(updateData);
    await logAudit(req.user.uid, "resolve_corrective_action", "correctiveAction", req.params.id, null, updateData, req.user.role);
    res.json({ id: req.params.id, ...doc.data(), ...updateData });
  } catch (err) {
    next(err);
  }
});

// POST /api/corrective-actions/:id/verify — Management sign-off and closure (Mine Official / Admin)
router.post("/:id/verify", requireAuth, async (req, res, next) => {
  try {
    const { status = "closed", notes } = req.body;
    const docRef = db.collection("correctiveActions").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Action not found" });

    const updateData = {
      status: status === "in_progress" ? "in_progress" : "closed",
      verificationNotes: notes,
      verifiedAt: new Date(),
      verifiedById: req.user.uid,
      verifiedByName: req.user.name,
      updatedAt: new Date(),
    };

    await docRef.update(updateData);
    await logAudit(req.user.uid, "verify_corrective_action", "correctiveAction", req.params.id, null, updateData, req.user.role);
    res.json({ id: req.params.id, ...doc.data(), ...updateData });
  } catch (err) {
    next(err);
  }
});

export default router;
