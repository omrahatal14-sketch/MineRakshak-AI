import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/auth/me — Return current user profile
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const doc = await db.collection("users").doc(req.user.uid).get();
    if (doc.exists) {
      return res.json({ id: doc.id, ...doc.data() });
    }
    return res.json(req.user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/profile — Sync/update user profile
router.post("/profile", requireAuth, async (req, res, next) => {
  try {
    const { name, role, mineId, mineName } = req.body;
    const updateData = {
      ...(name && { name }),
      ...(role && { role }),
      ...(mineId !== undefined && { mineId }),
      ...(mineName !== undefined && { mineName }),
      updatedAt: new Date(),
    };
    await db.collection("users").doc(req.user.uid).set(updateData, { merge: true });
    await logAudit(req.user.uid, "update_profile", "user", req.user.uid, null, updateData, req.user.role);
    res.json({ success: true, user: { uid: req.user.uid, ...updateData } });
  } catch (err) {
    next(err);
  }
});

export default router;
