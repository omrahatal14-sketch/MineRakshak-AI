import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { analyzeHazardVision } from "../../services/hazardVisionService.js";
import { logAudit } from "../../services/auditService.js";
import { createNotification } from "../notifications/routes.js";

const router = Router();

// 1. POST /api/incidents/ai-analyze — Run AI Vision on incident photo
router.post("/ai-analyze", requireAuth, async (req, res, next) => {
  try {
    const { fileName, contextText, mineId } = req.body;
    const analysis = await analyzeHazardVision({
      fileName: fileName || "hazard_inspection.jpg",
      contextText: contextText || "",
      mineId: mineId || req.user.mineId || "KCM-01",
    });
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

// 2. POST /api/incidents/dispatch — Save incident, create action, set deadline, and dispatch dual alerts
router.post("/dispatch", requireAuth, requireRole("mine_official", "admin", "corporate"), async (req, res, next) => {
  try {
    const {
      image,
      aiAnalysis,
      mineId,
      mineName,
      zone,
      inspectorId,
      inspectorName,
      responsibleCompany,
      customDeadline,
      notes,
    } = req.body;

    if (!aiAnalysis || !inspectorId) {
      return res.status(400).json({ error: "AI analysis and assigned field officer are required" });
    }

    const effectiveDeadline = customDeadline || aiAnalysis.calculatedDeadline || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    const targetCompany = responsibleCompany || aiAnalysis.suggestedResponsibleParty || "Plant Mechanical & Maintenance Contractor";

    // 1. Record Observation / Incident in Firestore
    const observationData = {
      title: aiAnalysis.detectedHazard,
      category: aiAnalysis.category || "Safety",
      severity: aiAnalysis.severity || "high",
      mineId: mineId || req.user.mineId || "KCM-01",
      mineName: mineName || "Kusmunda Coal Mine",
      zone: zone || "Pit Extraction Sector",
      description: aiAnalysis.description,
      recommendations: aiAnalysis.recommendations,
      evidence: image ? [image] : [],
      aiRiskScore: aiAnalysis.riskScore,
      aiConfidence: aiAnalysis.confidence,
      status: "open",
      createdById: req.user.uid,
      createdByName: req.user.name || req.user.email,
      createdAt: new Date(),
    };

    const obsRef = await db.collection("observations").add(observationData);

    // 2. Create Tracked Corrective Action with AI Deadline
    const correctiveActionData = {
      title: aiAnalysis.detectedHazard,
      description: `${aiAnalysis.description}\n\nOfficial Remarks: ${notes || "Immediate remediation mandated."}`,
      category: aiAnalysis.category || "Safety",
      mineId: mineId || req.user.mineId || "KCM-01",
      mineName: mineName || "Kusmunda Coal Mine",
      zone: zone || "Pit Extraction Sector",
      priority: aiAnalysis.severity || "high",
      targetDate: effectiveDeadline,
      assignedTo: inspectorId,
      assignedToName: inspectorName || "Field Officer",
      responsibleCompany: targetCompany,
      observationId: obsRef.id,
      aiRiskScore: aiAnalysis.riskScore,
      aiConfidence: aiAnalysis.confidence,
      aiGenerated: true,
      evidence: image ? [image] : [],
      status: "assigned",
      createdById: req.user.uid,
      createdByName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const actionRef = await db.collection("correctiveActions").add(correctiveActionData);

    // 3. Dispatch Notification to Inspector / Field Officer
    await createNotification({
      userId: inspectorId,
      type: "hazard_alert",
      title: `🚨 AI Hazard Dispatched: ${aiAnalysis.detectedHazard}`,
      message: `Statutory defect identified by AI at ${observationData.mineName} (${observationData.zone}). Remediation deadline: ${effectiveDeadline}. Responsible Company: ${targetCompany}.`,
      relatedEntityType: "correctiveAction",
      relatedEntityId: actionRef.id,
    });

    // 4. Dispatch Notification to Corporate Management
    const corpUsersSnap = await db.collection("users").where("role", "==", "corporate").get().catch(() => ({ docs: [] }));
    for (const doc of corpUsersSnap.docs) {
      await createNotification({
        userId: doc.id,
        type: "risk_escalation",
        title: `⚠️ Company Remediation Alert: ${aiAnalysis.detectedHazard}`,
        message: `${observationData.mineName} reported a ${aiAnalysis.severity.toUpperCase()} hazard. Assigned to ${targetCompany} with fix deadline ${effectiveDeadline}.`,
        relatedEntityType: "correctiveAction",
        relatedEntityId: actionRef.id,
      });
    }

    // 5. System Audit Trail Logging
    await logAudit(
      req.user.uid,
      "ai_incident_dispatched",
      "correctiveAction",
      actionRef.id,
      null,
      {
        hazard: aiAnalysis.detectedHazard,
        severity: aiAnalysis.severity,
        riskScore: aiAnalysis.riskScore,
        deadline: effectiveDeadline,
        responsibleCompany: targetCompany,
        assignedInspector: inspectorName,
      },
      req.user.role
    );

    res.status(201).json({
      success: true,
      observationId: obsRef.id,
      correctiveActionId: actionRef.id,
      aiAnalysis,
      effectiveDeadline,
      responsibleCompany: targetCompany,
      message: `Incident analyzed and dispatched to ${inspectorName} and ${targetCompany} with deadline ${effectiveDeadline}.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
