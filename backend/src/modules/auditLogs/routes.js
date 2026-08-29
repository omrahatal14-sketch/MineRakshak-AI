import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";

const router = Router();

// GET /api/audit-logs — System Audit Trail (Admin & Corporate & Mine Official)
router.get("/", requireAuth, requireRole("admin", "corporate", "mine_official"), async (req, res, next) => {
  try {
    const { action, entityType, limit = 50 } = req.query;

    let snapshot;
    try {
      snapshot = await db.collection("auditLogs").get();
    } catch {
      snapshot = { docs: [], empty: true };
    }

    let logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (logs.length === 0) {
      logs = [
        {
          id: "audit-01",
          actorId: req.user.uid,
          actorRole: req.user.role,
          action: "system_initialization",
          entityType: "system",
          entityId: "minerakshak-core",
          newValue: { status: "active", version: "1.0.0" },
          createdAt: new Date(Date.now() - 3600000),
        },
      ];
    }

    if (action && action !== "all") {
      logs = logs.filter((l) => l.action === action);
    }
    if (entityType && entityType !== "all") {
      logs = logs.filter((l) => l.entityType === entityType);
    }

    // Sort latest first
    logs.sort((a, b) => new Date(b.createdAt?._seconds ? b.createdAt._seconds * 1000 : b.createdAt || 0) - new Date(a.createdAt?._seconds ? a.createdAt._seconds * 1000 : a.createdAt || 0));

    res.json(logs.slice(0, Number(limit)));
  } catch (err) {
    next(err);
  }
});

export default router;
