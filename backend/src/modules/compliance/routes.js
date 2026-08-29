import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/compliance-requirements — List statutory compliance requirements
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { role, mineId } = req.user;
    const { mine, category, status } = req.query;

    let snapshot;
    try {
      snapshot = await db.collection("complianceRequirements").get();
    } catch {
      snapshot = { docs: [], empty: true };
    }

    let requirements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (requirements.length === 0) {
      requirements = [
        {
          id: "cr-01",
          title: "Quarterly Geotechnical Slope Stability Review",
          description: "Mandatory DGMS circular compliance for active pit highwall slopes.",
          category: "Structural",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
          status: "pending",
          isRecurring: true,
          createdAt: new Date(),
        },
        {
          id: "cr-02",
          title: "Continuous Ambient Dust & Air Quality Monitoring",
          description: "Daily and weekly PM10 / PM2.5 automated air quality logging at boundary sensors.",
          category: "Environmental",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          status: "completed",
          isRecurring: true,
          createdAt: new Date(),
        },
        {
          id: "cr-03",
          title: "Heavy Earth Moving Machinery (HEMM) Fitness Certification",
          description: "Bi-annual mechanical and brake inspection for dumpers and excavators.",
          category: "Equipment",
          mineId: "GCM-02",
          mineName: "Gevra Coal Mine",
          dueDate: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
          status: "overdue",
          isRecurring: true,
          createdAt: new Date(),
        },
      ];
      for (const r of requirements) {
        const { id, ...data } = r;
        await db.collection("complianceRequirements").doc(id).set(data).catch(() => {});
      }
    }

    if (role === "mine_official" && mineId) {
      requirements = requirements.filter((r) => !r.mineId || r.mineId === mineId);
    }
    if (mine && mine !== "all") {
      requirements = requirements.filter((r) => r.mineId === mine);
    }
    if (category && category !== "all") {
      requirements = requirements.filter((r) => r.category === category);
    }
    if (status && status !== "all") {
      requirements = requirements.filter((r) => r.status === status);
    }

    res.json(requirements);
  } catch (err) {
    next(err);
  }
});

// POST /api/compliance-requirements — Create compliance requirement (Mine Official / Admin)
router.post("/", requireAuth, requireRole("mine_official", "admin", "corporate"), async (req, res, next) => {
  try {
    const { title, description, category, mineId, mineName, dueDate, isRecurring } = req.body;
    const newReq = {
      title: title.trim(),
      description: description ? description.trim() : "",
      category: category || "Safety",
      mineId: mineId || req.user.mineId || "KCM-01",
      mineName: mineName || "Mine Facility",
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "pending",
      isRecurring: Boolean(isRecurring),
      createdById: req.user.uid,
      createdAt: new Date(),
    };

    const docRef = await db.collection("complianceRequirements").add(newReq);
    await logAudit(req.user.uid, "create_compliance_requirement", "complianceRequirement", docRef.id, null, newReq, req.user.role);

    res.status(201).json({ id: docRef.id, ...newReq });
  } catch (err) {
    next(err);
  }
});

export default router;
