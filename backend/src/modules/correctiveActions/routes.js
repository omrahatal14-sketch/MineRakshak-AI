import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";
import { createNotification } from "../notifications/routes.js";

const router = Router();

function canAccessAction(user, action) {
  if (["admin", "corporate"].includes(user.role)) return true;
  if (user.role === "mine_official") {
    return !user.mineId || user.mineId === action.mineId;
  }
  if (user.role === "field_officer") {
    return user.uid === action.assignedTo;
  }
  return false;
}

// 1. GET /api/corrective-actions — List actions with role-scoping and filters
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { role, uid, mineId } = req.user;
    const { status, priority, mine, search } = req.query;

    let snapshot;
    try {
      snapshot = await db.collection("correctiveActions").get();
    } catch {
      snapshot = { docs: [], empty: true };
    }

    let actions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Auto-seed sample corrective actions if completely empty
    if (actions.length === 0) {
      const sampleActions = [
        {
          id: "ca-demo-01",
          title: "Install Conveyor 4B Trip Switch & Replace Broken Guard",
          description: "Emergency pull cord switch is detached and mechanical protection mesh is damaged. Install new certified switch and secure mesh.",
          category: "Safety",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          zone: "Pit A - Conveyor Transfer 3",
          priority: "high",
          status: "in_progress",
          assignedTo: uid,
          assignedToName: req.user.name || "Field Officer",
          targetDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
          createdById: "official1-id",
          createdByName: "Mine Official",
          createdAt: new Date(Date.now() - 2 * 86400000),
          updatedAt: new Date(),
        },
        {
          id: "ca-demo-02",
          title: "De-silt and Unclog Pit B Haul Road Sprinkler Nozzles",
          description: "Water sprinkler nozzle 3 is clogged with coal sediment. Flush piping and replace nozzle tip.",
          category: "Environmental",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          zone: "Pit B - Main Haul Route",
          priority: "medium",
          status: "assigned",
          assignedTo: uid,
          assignedToName: req.user.name || "Field Officer",
          targetDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
          createdById: "official1-id",
          createdByName: "Mine Official",
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
        },
        {
          id: "ca-demo-03",
          title: "Highwall Drainage Sump Pump Replacement",
          description: "Water accumulation near sector 4 highwall toe. Deploy standby 50HP dewatering pump.",
          category: "Structural",
          mineId: "GCM-02",
          mineName: "Gevra Coal Mine",
          zone: "North Face Toe Sector 4",
          priority: "critical",
          status: "resolved",
          assignedTo: "inspector-2",
          assignedToName: "Officer Sharma",
          targetDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          resolutionNotes: "50HP submersible pump installed and tested. Drainage rate verified at 1200 LPM.",
          resolutionEvidence: [{ name: "sump_pump_live.jpg", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop", type: "image/jpeg" }],
          resolvedAt: new Date(Date.now() - 3600000),
          createdById: "official2-id",
          createdByName: "Gevra Official",
          createdAt: new Date(Date.now() - 4 * 86400000),
          updatedAt: new Date(),
        },
      ];

      for (const sa of sampleActions) {
        const { id, ...data } = sa;
        await db.collection("correctiveActions").doc(id).set(data).catch(() => {});
      }
      actions = sampleActions;
    }

    // Role-based filtering
    if (role === "field_officer") {
      actions = actions.filter((a) => a.assignedTo === uid);
    } else if (role === "mine_official" && mineId) {
      actions = actions.filter((a) => !a.mineId || a.mineId === mineId);
    }

    // Query Filters
    if (status && status !== "all") {
      if (status === "overdue") {
        const today = new Date().toISOString().split("T")[0];
        actions = actions.filter((a) => a.targetDate < today && !["verified", "closed"].includes(a.status));
      } else {
        actions = actions.filter((a) => a.status === status);
      }
    }
    if (priority && priority !== "all") {
      actions = actions.filter((a) => a.priority === priority);
    }
    if (mine && mine !== "all") {
      actions = actions.filter((a) => a.mineId === mine);
    }
    if (search) {
      const q = search.toLowerCase();
      actions = actions.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.mineName?.toLowerCase().includes(q) ||
          a.assignedToName?.toLowerCase().includes(q)
      );
    }

    // Sort by targetDate ascending (most urgent first)
    actions.sort((a, b) => (a.targetDate || "").localeCompare(b.targetDate || ""));

    res.json(actions);
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/corrective-actions/:id — Single action details
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("correctiveActions").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Corrective action not found" });
    }

    const action = { id: doc.id, ...doc.data() };
    if (!canAccessAction(req.user, action)) {
      return res.status(403).json({ error: "Access denied to this corrective action" });
    }

    res.json(action);
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/corrective-actions — Create action (Mine Official, Admin, Corporate)
router.post("/", requireAuth, requireRole("mine_official", "admin", "corporate"), async (req, res, next) => {
  try {
    const {
      title,
      description,
      mineId,
      mineName,
      zone,
      category,
      priority,
      targetDate,
      assignedTo,
      assignedToName,
      observationId,
      violationId,
      inspectionId,
    } = req.body;

    if (!title || !description || !assignedTo) {
      return res.status(400).json({ error: "Title, description, and assigned officer are required" });
    }

    const newAction = {
      title: title.trim(),
      description: description.trim(),
      category: category || "Safety",
      mineId: mineId || req.user.mineId || "KCM-01",
      mineName: mineName || "Mine Facility",
      zone: zone || "Operational Zone",
      priority: priority || "high",
      targetDate: targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "assigned",
      assignedTo,
      assignedToName: assignedToName || "Field Officer",
      observationId: observationId || null,
      violationId: violationId || null,
      inspectionId: inspectionId || null,
      createdById: req.user.uid,
      createdByName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("correctiveActions").add(newAction);

    // Notify assigned officer
    await createNotification({
      userId: assignedTo,
      type: "corrective_action",
      title: "New Corrective Action Assigned",
      message: `Action '${newAction.title}' has been assigned to you. Target date: ${newAction.targetDate}.`,
      relatedEntityType: "correctiveAction",
      relatedEntityId: docRef.id,
    });

    // Audit log
    await logAudit(req.user.uid, "create_corrective_action", "correctiveAction", docRef.id, null, newAction, req.user.role);

    res.status(201).json({ id: docRef.id, ...newAction });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /api/corrective-actions/:id — Update progress / Submit resolution proof
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("correctiveActions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Corrective action not found" });
    }

    const current = doc.data();
    if (!canAccessAction(req.user, current)) {
      return res.status(403).json({ error: "Unauthorized to update this corrective action" });
    }

    const { status, resolutionNotes, resolutionEvidence, targetDate, priority } = req.body;

    const updateData = {
      ...(status && { status }),
      ...(resolutionNotes !== undefined && { resolutionNotes: resolutionNotes.trim() }),
      ...(resolutionEvidence !== undefined && { resolutionEvidence }),
      ...(targetDate && { targetDate }),
      ...(priority && { priority }),
      ...(status === "resolved" && { resolvedAt: new Date() }),
      updatedAt: new Date(),
    };

    await docRef.update(updateData);

    // If resolved, notify mine official
    if (status === "resolved" && current.createdById) {
      await createNotification({
        userId: current.createdById,
        type: "action_resolved",
        title: "Action Resolved — Verification Required",
        message: `Action '${current.title}' has been marked resolved by ${req.user.name || "assignee"}. Please verify.`,
        relatedEntityType: "correctiveAction",
        relatedEntityId: id,
      });
    }

    await logAudit(req.user.uid, "update_corrective_action", "correctiveAction", id, { status: current.status }, updateData, req.user.role);

    res.json({ id, ...current, ...updateData });
  } catch (err) {
    next(err);
  }
});

// 5. POST /api/corrective-actions/:id/verify — Verify & Close (Mine Official / Admin)
router.post("/:id/verify", requireAuth, requireRole("mine_official", "admin", "corporate"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationNotes, closeDirectly = true } = req.body;

    const docRef = db.collection("correctiveActions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Corrective action not found" });
    }

    const current = doc.data();
    const newStatus = closeDirectly ? "closed" : "verified";

    const updateData = {
      status: newStatus,
      verificationNotes: verificationNotes || "Rectification verified on-site by Mine Management.",
      verifiedBy: req.user.uid,
      verifiedByName: req.user.name || req.user.email || "Mine Official",
      verifiedAt: new Date(),
      ...(closeDirectly && { closedAt: new Date() }),
      updatedAt: new Date(),
    };

    await docRef.update(updateData);

    // Notify assigned officer that their action was verified & closed
    if (current.assignedTo) {
      await createNotification({
        userId: current.assignedTo,
        type: "action_verified",
        title: "Corrective Action Verified & Closed",
        message: `Your remediation for '${current.title}' was verified and closed.`,
        relatedEntityType: "correctiveAction",
        relatedEntityId: id,
      });
    }

    await logAudit(req.user.uid, "verify_corrective_action", "correctiveAction", id, { status: current.status }, updateData, req.user.role);

    res.json({ id, ...current, ...updateData, message: `Corrective action marked as ${newStatus}` });
  } catch (err) {
    next(err);
  }
});

export default router;
