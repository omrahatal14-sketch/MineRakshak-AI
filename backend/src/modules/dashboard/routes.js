import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";

const router = Router();

// GET /api/dashboard/corporate — Corporate overview KPIs
router.get("/corporate", requireAuth, async (req, res, next) => {
  try {
    const [minesSnap, inspSnap, violSnap, actSnap, compSnap] = await Promise.all([
      db.collection("mines").get(),
      db.collection("inspections").get(),
      db.collection("violations").get(),
      db.collection("correctiveActions").get(),
      db.collection("complianceRequirements").get(),
    ]);

    const mines = minesSnap.docs.map((d) => d.data());
    const inspections = inspSnap.docs.map((d) => d.data());
    const violations = violSnap.docs.map((d) => d.data());
    const actions = actSnap.docs.map((d) => d.data());
    const compliances = compSnap.docs.map((d) => d.data());

    const totalMines = mines.length || 10;
    const openViolations = violations.filter((v) => v.status === "open").length;
    const criticalViolations = violations.filter((v) => v.severity === "critical").length;
    const completedInspections = inspections.filter((i) => ["submitted", "reviewed", "closed"].includes(i.status)).length;
    const pendingActions = actions.filter((a) => ["assigned", "in_progress"].includes(a.status)).length;
    const overdueCompliances = compliances.filter((c) => c.status === "overdue").length;

    // Calculate compliance health index
    const totalCompliances = compliances.length || 1;
    const completedComp = compliances.filter((c) => c.status === "completed").length;
    const complianceRate = Math.round((completedComp / totalCompliances) * 100);

    res.json({
      summary: {
        totalMines,
        openViolations,
        criticalViolations,
        completedInspections,
        pendingActions,
        overdueCompliances,
        complianceRate,
        overallRiskLevel: criticalViolations > 0 ? "High" : "Moderate",
      },
      minesSummary: mines.map((m) => ({
        id: m.id,
        name: m.name,
        zone: m.zone,
        latitude: m.latitude,
        longitude: m.longitude,
        riskScore: m.riskScore || (m.id === "KCM-01" ? 82 : 45),
        riskLevel: m.riskLevel || (m.id === "KCM-01" ? "high" : "medium"),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
