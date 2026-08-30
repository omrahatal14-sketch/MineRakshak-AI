import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// GET /api/users — List users with filters
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { role, mine, status, search } = req.query;
    const snap = await db.collection("users").get();
    let users = snap.docs.map((d) => ({ id: d.id, uid: d.id, ...d.data() }));

    if (role && role !== "all") {
      users = users.filter((u) => u.role === role);
    }
    if (mine && mine !== "all") {
      users = users.filter((u) => u.mineId === mine);
    }
    if (status && status !== "all") {
      users = users.filter((u) => u.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
    }

    res.json(users);
  } catch (err) {
    next(err);
  }
});

// POST /api/users — Create new user (Admin only)
router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, role, mineId, mineName, status = "active" } = req.body;
    const uid = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const userData = {
      uid,
      name,
      email,
      role: role || "field_officer",
      mineId: mineId || null,
      mineName: mineName || null,
      status,
      createdAt: new Date(),
    };
    await db.collection("users").doc(uid).set(userData);
    await logAudit(req.user.uid, "create_user", "user", uid, null, userData, req.user.role);
    res.status(201).json(userData);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:uid — Update user (Admin only)
router.put("/:uid", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { uid } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection("users").doc(uid).set(updateData, { merge: true });
    await logAudit(req.user.uid, "update_user", "user", uid, null, updateData, req.user.role);
    res.json({ success: true, uid, ...updateData });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:uid — Deactivate user (Admin only)
router.delete("/:uid", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { uid } = req.params;
    await db.collection("users").doc(uid).set({ status: "inactive", deactivatedAt: new Date() }, { merge: true });
    await logAudit(req.user.uid, "deactivate_user", "user", uid, null, { status: "inactive" }, req.user.role);
    res.json({ success: true, message: `User ${uid} deactivated.` });
  } catch (err) {
    next(err);
  }
});

export default router;
