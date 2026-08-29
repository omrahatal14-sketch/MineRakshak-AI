import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";

const router = Router();

// GET /api/reports/summary — Exportable compliance & inspection summary
router.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const [minesSnap, inspSnap, violSnap, actSnap] = await Promise.all([
      db.collection("mines").get().catch(() => ({ docs: [] })),
      db.collection("inspections").get().catch(() => ({ docs: [] })),
      db.collection("violations").get().catch(() => ({ docs: [] })),
      db.collection("correctiveActions").get().catch(() => ({ docs: [] })),
    ]);

    const mines = minesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const inspections = inspSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const violations = violSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const actions = actSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const report = {
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.email,
      fleetSummary: {
        totalMines: mines.length,
        totalInspections: inspections.length,
        reviewedInspections: inspections.filter((i) => i.status === "reviewed").length,
        openViolations: violations.filter((v) => v.status !== "closed").length,
        closedCorrectiveActions: actions.filter((a) => a.status === "closed" || a.status === "verified").length,
      },
      inspections: inspections.map((i) => ({
        id: i.id,
        title: i.title,
        mine: i.mineName || i.mineId,
        inspector: i.inspectorName,
        status: i.status,
        priority: i.priority,
        scheduledDate: i.scheduledDate,
      })),
      correctiveActions: actions.map((a) => ({
        id: a.id,
        title: a.title,
        mine: a.mineName,
        assignedTo: a.assignedToName,
        status: a.status,
        priority: a.priority,
        targetDate: a.targetDate,
      })),
    };

    res.json(report);
  } catch (err) {
    next(err);
  }
});

export default router;
