import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { analyzeHazardVision } from "../../services/hazardVisionService.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// POST /api/incidents/ai-analyze — Run AI Hazard Vision analysis
router.post("/ai-analyze", requireAuth, async (req, res, next) => {
  try {
    const { fileName, contextText, mineId } = req.body;
    const result = await analyzeHazardVision({ fileName, contextText, mineId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/incidents/dispatch — Dispatch AI incident as new violation & CAPA
router.post("/dispatch", requireAuth, async (req, res, next) => {
  try {
    const {
      detectedHazard,
      category,
      severity,
      riskScore,
      mineId,
      mineName,
      location,
      zone,
      description,
      recommendations,
      deadline,
      assignedTo,
      assignedToName,
      responsibleParty,
      evidence = [],
    } = req.body;

    const violId = `viol_${Date.now()}`;
    const actId = `act_${Date.now()}`;

    // 1. Create Violation
    const violation = {
      id: violId,
      title: detectedHazard,
      category: category || "Safety",
      severity: severity || "high",
      status: "open",
      mineId: mineId || "KCM-01",
      mineName: mineName || "Kusmunda Coal Mine",
      zone: zone || "Primary Operational Pit",
      location: location || "Hazard Detection Zone",
      description: description || detectedHazard,
      aiRiskScore: riskScore || 75,
      evidence,
      createdAt: new Date(),
    };
    await db.collection("violations").doc(violId).set(violation);

    // 2. Create Corrective Action
    const action = {
      id: actId,
      title: `Remediate: ${detectedHazard}`,
      description: recommendations || description,
      category: category || "Safety",
      mineId: mineId || "KCM-01",
      mineName: mineName || "Kusmunda Coal Mine",
      zone: zone || "Primary Operational Pit",
      priority: severity === "critical" ? "critical" : severity === "high" ? "high" : "medium",
      targetDate: deadline || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      status: "assigned",
      assignedTo: assignedTo || req.user.uid,
      assignedToName: assignedToName || req.user.name,
      responsibleCompany: responsibleParty || "Mine Safety Maintenance Contractors",
      violationId: violId,
      aiRiskScore: riskScore || 75,
      createdAt: new Date(),
    };
    await db.collection("correctiveActions").doc(actId).set(action);

    // 3. Create Notification
    await db.collection("notifications").add({
      title: `Critical Hazard Dispatched: ${detectedHazard}`,
      message: `AI Vision flagged high-risk hazard. Corrective action assigned with deadline ${action.targetDate}.`,
      isRead: false,
      createdAt: new Date(),
    });

    await logAudit(req.user.uid, "dispatch_ai_incident", "incident", violId, null, { violId, actId, detectedHazard }, req.user.role);

    res.status(201).json({
      success: true,
      message: "AI Hazard dispatched and assigned successfully.",
      violation,
      action,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
