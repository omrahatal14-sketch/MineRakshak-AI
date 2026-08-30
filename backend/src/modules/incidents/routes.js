import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { analyzeHazardVision } from "../../services/hazardVisionService.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// POST /api/incidents/ai-analyze — Run AI Hazard Vision analysis
router.post("/ai-analyze", requireAuth, async (req, res, next) => {
  try {
    const { fileName, contextText, mineId, base64Image } = req.body;
    const result = await analyzeHazardVision({ fileName, contextText, mineId, base64Image });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/incidents/dispatch — Dispatch AI incident as new violation & CAPA
router.post("/dispatch", requireAuth, async (req, res, next) => {
  try {
    const hazardTitle =
      req.body.detectedHazard ||
      req.body.aiAnalysis?.detectedHazard ||
      req.body.title ||
      "Safety Hazard Detected";

    const hazardCategory =
      req.body.category ||
      req.body.aiAnalysis?.category ||
      "Safety";

    const hazardSeverity =
      req.body.severity ||
      req.body.aiAnalysis?.severity ||
      "high";

    const hazardRiskScore =
      req.body.riskScore ||
      req.body.aiAnalysis?.riskScore ||
      75;

    const hazardDescription =
      req.body.description ||
      req.body.aiAnalysis?.description ||
      hazardTitle;

    const hazardRecommendations =
      req.body.recommendations ||
      req.body.aiAnalysis?.recommendations ||
      hazardDescription;

    const hazardDeadline =
      req.body.customDeadline ||
      req.body.deadline ||
      req.body.aiAnalysis?.calculatedDeadline ||
      new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];

    const targetInspectorId =
      req.body.inspectorId ||
      req.body.assignedTo ||
      req.user.uid;

    const targetInspectorName =
      req.body.inspectorName ||
      req.body.assignedToName ||
      "Field Inspector";

    const targetCompany =
      req.body.responsibleCompany ||
      req.body.responsibleParty ||
      req.body.aiAnalysis?.suggestedResponsibleParty ||
      "Plant Mechanical & Maintenance Contractor";

    const targetMineId =
      req.body.mineId ||
      req.user.mineId ||
      "KCM-01";

    const targetMineName =
      req.body.mineName ||
      "Kusmunda Coal Mine";

    const targetZone =
      req.body.zone ||
      req.body.location ||
      "Pit A - Primary Extraction Zone";

    const targetEvidence = req.body.image
      ? [req.body.image]
      : (Array.isArray(req.body.evidence) ? req.body.evidence : []);

    const violId = `viol_${Date.now()}`;
    const actId = `act_${Date.now()}`;

    // 1. Create Violation Record
    const violation = {
      id: violId,
      title: hazardTitle,
      category: hazardCategory,
      severity: hazardSeverity,
      status: "open",
      mineId: targetMineId,
      mineName: targetMineName,
      zone: targetZone,
      location: targetZone,
      description: hazardDescription,
      recommendations: hazardRecommendations,
      aiRiskScore: hazardRiskScore,
      evidence: targetEvidence,
      createdAt: new Date(),
    };
    await db.collection("violations").doc(violId).set(violation);

    // 2. Create Tracked Corrective Action
    const action = {
      id: actId,
      title: hazardTitle,
      description: `${hazardDescription}\n\nOfficial Remarks: ${req.body.notes || hazardRecommendations}`,
      category: hazardCategory,
      mineId: targetMineId,
      mineName: targetMineName,
      zone: targetZone,
      priority: hazardSeverity === "critical" ? "critical" : hazardSeverity === "high" ? "high" : "medium",
      targetDate: hazardDeadline,
      status: "assigned",
      assignedTo: targetInspectorId,
      assignedToName: targetInspectorName,
      responsibleCompany: targetCompany,
      violationId: violId,
      aiRiskScore: hazardRiskScore,
      evidence: targetEvidence,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("correctiveActions").doc(actId).set(action);

    // 3. Create Notifications
    await db.collection("notifications").add({
      title: `[Inspection Task] Hazard Dispatched: ${hazardTitle}`,
      message: `AI Vision flagged hazard at ${targetMineName} (${targetZone}). Assigned to ${targetInspectorName} for on-site audit & sign-off.`,
      recipientRole: "field_officer",
      recipientId: targetInspectorId,
      userId: targetInspectorId,
      isRead: false,
      createdAt: new Date(),
    });

    await db.collection("notifications").add({
      title: `[Statutory Deadline: ${hazardDeadline}] Rectification Assigned: ${targetCompany}`,
      message: `AI assigned fix deadline of ${hazardDeadline} for ${hazardTitle}. Assigned contractor: ${targetCompany}.`,
      recipientRole: "corporate",
      isRead: false,
      createdAt: new Date(),
    });

    // Notify Contractor Company
    await db.collection("notifications").add({
      title: `[Work Order] Repair Task Assigned: ${hazardTitle}`,
      message: `Your company (${targetCompany}) has been assigned a mandatory repair task at ${targetMineName} (${targetZone}). AI Risk: ${hazardRiskScore}/100. Statutory deadline: ${hazardDeadline}.`,
      recipientRole: "contractor",
      isRead: false,
      createdAt: new Date(),
    });

    await logAudit(
      req.user.uid,
      "dispatch_ai_incident",
      "incident",
      violId,
      null,
      { violId, actId, hazardTitle, responsibleCompany: targetCompany, deadline: hazardDeadline, assignedInspector: targetInspectorName },
      req.user.role
    );

    res.status(201).json({
      success: true,
      message: `AI Hazard dispatched successfully. Assigned to ${targetInspectorName} and ${targetCompany} with statutory deadline ${hazardDeadline}.`,
      effectiveDeadline: hazardDeadline,
      responsibleCompany: targetCompany,
      violation,
      action,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
