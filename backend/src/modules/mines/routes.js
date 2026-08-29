import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

const DEFAULT_MINES = [
  { id: "KCM-01", name: "Kusmunda Coal Mine", code: "KCM-01", zone: "Chhattisgarh", status: "active", latitude: 22.309, longitude: 82.679 },
  { id: "GCM-02", name: "Gevra Coal Mine", code: "GCM-02", zone: "Chhattisgarh", status: "active", latitude: 22.331, longitude: 82.591 },
  { id: "JCF-03", name: "Jharia Coalfield", code: "JCF-03", zone: "Jharkhand", status: "active", latitude: 23.739, longitude: 86.414 },
];

// GET /api/mines — List active mines
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const snapshot = await db.collection("mines").get();
    if (snapshot.empty) {
      const batch = db.batch();
      DEFAULT_MINES.forEach((m) => {
        const ref = db.collection("mines").doc(m.id);
        batch.set(ref, { ...m, createdAt: new Date() });
      });
      await batch.commit().catch(() => {});
      return res.json(DEFAULT_MINES);
    }

    const mines = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(mines);
  } catch (err) {
    res.json(DEFAULT_MINES);
  }
});

// POST /api/mines — Create Mine (Admin Only)
router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { name, code, zone, latitude, longitude, status = "active" } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: "Mine name and code are required" });
    }

    const mineId = code.toUpperCase();
    const newMine = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      zone: zone || "Central Zone",
      latitude: latitude ? Number(latitude) : 22.3,
      longitude: longitude ? Number(longitude) : 82.6,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("mines").doc(mineId).set(newMine);
    await logAudit(req.user.uid, "create_mine", "mine", mineId, null, newMine, req.user.role);

    res.status(201).json({ id: mineId, ...newMine });
  } catch (err) {
    next(err);
  }
});

// PUT /api/mines/:id — Update Mine (Admin Only)
router.put("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("mines").doc(id);
    const doc = await docRef.get();

    const current = doc.exists ? doc.data() : {};
    const { name, zone, latitude, longitude, status } = req.body;

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(zone && { zone }),
      ...(latitude && { latitude: Number(latitude) }),
      ...(longitude && { longitude: Number(longitude) }),
      ...(status && { status }),
      updatedAt: new Date(),
    };

    await docRef.set(updateData, { merge: true });
    await logAudit(req.user.uid, "update_mine", "mine", id, current, updateData, req.user.role);

    res.json({ id, ...current, ...updateData });
  } catch (err) {
    next(err);
  }
});

export default router;
