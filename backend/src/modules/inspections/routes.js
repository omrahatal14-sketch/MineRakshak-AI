import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";

const router = Router();

// Helper to check inspection access
function canAccessInspection(user, inspection) {
  if (["admin", "corporate"].includes(user.role)) return true;
  if (user.role === "mine_official") {
    return !user.mineId || user.mineId === inspection.mineId;
  }
  if (user.role === "field_officer") {
    return user.uid === inspection.inspectorId;
  }
  return false;
}

// 1. GET /api/inspections — List role-scoped inspections with search & status filters
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { role, uid, mineId } = req.user;
    const { status, mine, search } = req.query;

    let snapshot;
    try {
      snapshot = await db.collection("inspections").get();
    } catch (e) {
      snapshot = { docs: [], empty: true };
    }

    let inspections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Auto-seed sample inspections if database collection is completely empty
    if (inspections.length === 0) {
      const sampleInspections = [
        {
          id: "insp-demo-01",
          title: "Quarterly Conveyor & Haul Road Safety Audit",
          type: "Safety Audit",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          zone: "Pit A - Conveyor Transfer Point 3",
          inspectorId: uid,
          inspectorName: req.user.name || "Field Officer",
          scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
          priority: "high",
          status: "assigned",
          summary: "Inspect mechanical safety guards, haul road berm heights, and dust suppression systems.",
          createdAt: new Date(Date.now() - 2 * 86400000),
          updatedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
          id: "insp-demo-02",
          title: "Slope Stability & Drainage Monitoring",
          type: "Structural",
          mineId: mineId || "KCM-01",
          mineName: "Kusmunda Coal Mine",
          zone: "North Face Highwall Sector B",
          inspectorId: uid,
          inspectorName: req.user.name || "Field Officer",
          scheduledDate: new Date().toISOString().split("T")[0],
          priority: "critical",
          status: "in_progress",
          summary: "Routine bench displacement check following monsoon rainfall.",
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
        },
        {
          id: "insp-demo-03",
          title: "Environmental Effluent Discharge Verification",
          type: "Environmental",
          mineId: "GCM-02",
          mineName: "Gevra Coal Mine",
          zone: "Sedimentation Pond 2 Overflow",
          inspectorId: "inspector2-sample",
          inspectorName: "Officer Sharma",
          scheduledDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
          priority: "medium",
          status: "submitted",
          summary: "Water sample pH and turbidity measurements at outlet.",
          submittedAt: new Date(Date.now() - 86400000),
          createdAt: new Date(Date.now() - 5 * 86400000),
          updatedAt: new Date(Date.now() - 86400000),
        },
      ];

      // Save samples to Firestore if possible
      for (const sample of sampleInspections) {
        const { id, ...data } = sample;
        await db.collection("inspections").doc(id).set(data).catch(() => {});
      }
      inspections = sampleInspections;
    }

    // Role-based filtering
    if (role === "field_officer") {
      inspections = inspections.filter((i) => i.inspectorId === uid);
    } else if (role === "mine_official" && mineId) {
      inspections = inspections.filter((i) => !i.mineId || i.mineId === mineId);
    }

    // Query Filters
    if (status && status !== "all") {
      inspections = inspections.filter((i) => i.status === status);
    }
    if (mine && mine !== "all") {
      inspections = inspections.filter((i) => i.mineId === mine);
    }
    if (search) {
      const q = search.toLowerCase();
      inspections = inspections.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.mineName?.toLowerCase().includes(q) ||
          i.zone?.toLowerCase().includes(q) ||
          i.type?.toLowerCase().includes(q) ||
          i.id?.toLowerCase().includes(q)
      );
    }

    // Sort by scheduledDate descending
    inspections.sort((a, b) => new Date(b.scheduledDate || b.createdAt || 0) - new Date(a.scheduledDate || a.createdAt || 0));

    res.json(inspections);
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/inspections/:id — Inspection details with linked observations
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("inspections").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    const inspection = { id: doc.id, ...doc.data() };

    if (!canAccessInspection(req.user, inspection)) {
      return res.status(403).json({ error: "Access denied to this inspection" });
    }

    // Fetch linked observations
    const obsSnapshot = await db
      .collection("observations")
      .where("inspectionId", "==", id)
      .get()
      .catch(() => ({ docs: [] }));

    const observations = obsSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Sort observations by creation date
    observations.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    res.json({ ...inspection, observations });
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/inspections — Create/Assign Inspection (Restricted to Mine Official & Admin)
router.post("/", requireAuth, requireRole("admin", "mine_official"), async (req, res, next) => {
  try {
    const {
      title,
      type,
      mineId,
      mineName,
      zone,
      inspectorId,
      inspectorName,
      scheduledDate,
      priority,
      summary,
    } = req.body;

    if (!title || !mineId || !inspectorId) {
      return res.status(400).json({ error: "Title, Mine, and Inspector are required" });
    }

    const newInspection = {
      title: title.trim(),
      type: type || "Routine Safety",
      mineId,
      mineName: mineName || mineId,
      zone: zone ? zone.trim() : "Main Extraction Sector",
      inspectorId,
      inspectorName: inspectorName || "Field Officer",
      scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
      priority: priority || "medium",
      status: "assigned",
      summary: summary || "",
      createdById: req.user.uid,
      createdByName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("inspections").add(newInspection);
    res.status(201).json({ id: docRef.id, ...newInspection, observations: [] });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /api/inspections/:id — Update Draft Inspection
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("inspections").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    const current = doc.data();
    if (!canAccessInspection(req.user, current)) {
      return res.status(403).json({ error: "Unauthorized to modify this inspection" });
    }

    if (current.status === "reviewed" && req.user.role === "field_officer") {
      return res.status(400).json({ error: "Cannot modify an already reviewed inspection" });
    }

    const { title, zone, summary, status, priority, type } = req.body;
    const updateData = {
      ...(title && { title: title.trim() }),
      ...(zone !== undefined && { zone: zone.trim() }),
      ...(summary !== undefined && { summary: summary.trim() }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(type && { type }),
      updatedAt: new Date(),
    };

    await docRef.update(updateData);
    res.json({ id, ...current, ...updateData });
  } catch (err) {
    next(err);
  }
});

// 5. POST /api/inspections/:id/submit — Submit inspection for review
router.post("/:id/submit", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("inspections").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    const current = doc.data();
    if (!canAccessInspection(req.user, current)) {
      return res.status(403).json({ error: "Unauthorized to submit this inspection" });
    }

    const updateData = {
      status: "submitted",
      submittedAt: new Date(),
      updatedAt: new Date(),
      ...(req.body.summary && { summary: req.body.summary.trim() }),
    };

    await docRef.update(updateData);
    res.json({ id, ...current, ...updateData, message: "Inspection submitted successfully for review" });
  } catch (err) {
    next(err);
  }
});

// 6. POST /api/inspections/:id/review — Mine Official Review (Restricted)
router.post("/:id/review", requireAuth, requireRole("mine_official", "corporate", "admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNotes, decision } = req.body;
    const docRef = db.collection("inspections").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    const current = doc.data();
    const updateData = {
      status: decision === "needs_revision" ? "in_progress" : "reviewed",
      reviewNotes: reviewNotes || "Inspection findings reviewed and acknowledged by Mine Management.",
      reviewedBy: req.user.uid,
      reviewedByName: req.user.name || req.user.email || "Mine Official",
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.update(updateData);
    res.json({ id, ...current, ...updateData, message: "Inspection review recorded successfully" });
  } catch (err) {
    next(err);
  }
});

// 7. POST /api/inspections/:id/observations — Add observation
router.post("/:id/observations", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const inspectionDoc = await db.collection("inspections").doc(id).get();

    if (!inspectionDoc.exists) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    const inspection = inspectionDoc.data();
    if (!canAccessInspection(req.user, inspection)) {
      return res.status(403).json({ error: "Unauthorized to add observations to this inspection" });
    }

    const { category, severity, location, description, recommendations, evidence } = req.body;

    if (!description || !category) {
      return res.status(400).json({ error: "Category and description are required" });
    }

    const newObservation = {
      inspectionId: id,
      mineId: inspection.mineId,
      category: category || "Safety",
      severity: severity || "medium",
      location: location ? location.trim() : (inspection.zone || ""),
      description: description.trim(),
      recommendations: recommendations ? recommendations.trim() : "",
      evidence: Array.isArray(evidence) ? evidence : [],
      status: "open",
      createdById: req.user.uid,
      createdByName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("observations").add(newObservation);

    // If inspection was in 'assigned' state, auto-transition to 'in_progress'
    if (inspection.status === "assigned") {
      await db.collection("inspections").doc(id).update({
        status: "in_progress",
        updatedAt: new Date(),
      });
    }

    res.status(201).json({ id: docRef.id, ...newObservation });
  } catch (err) {
    next(err);
  }
});

// 8. PUT /api/inspections/:id/observations/:obsId — Update observation
router.put("/:id/observations/:obsId", requireAuth, async (req, res, next) => {
  try {
    const { obsId } = req.params;
    const obsRef = db.collection("observations").doc(obsId);
    const doc = await obsRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Observation not found" });
    }

    const { category, severity, location, description, recommendations, evidence, status } = req.body;
    const updateData = {
      ...(category && { category }),
      ...(severity && { severity }),
      ...(location !== undefined && { location: location.trim() }),
      ...(description && { description: description.trim() }),
      ...(recommendations !== undefined && { recommendations: recommendations.trim() }),
      ...(evidence && { evidence }),
      ...(status && { status }),
      updatedAt: new Date(),
    };

    await obsRef.update(updateData);
    res.json({ id: obsId, ...doc.data(), ...updateData });
  } catch (err) {
    next(err);
  }
});

// 9. DELETE /api/inspections/:id/observations/:obsId — Delete observation
router.delete("/:id/observations/:obsId", requireAuth, async (req, res, next) => {
  try {
    const { obsId } = req.params;
    const obsRef = db.collection("observations").doc(obsId);
    const doc = await obsRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Observation not found" });
    }

    await obsRef.delete();
    res.json({ success: true, id: obsId });
  } catch (err) {
    next(err);
  }
});

export default router;
