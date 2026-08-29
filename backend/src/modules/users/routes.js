import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { db, auth } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// 1. GET /api/users — List users with optional role and mine filter
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { role, mine, status, search } = req.query;

    let snapshot;
    try {
      snapshot = await db.collection("users").get();
    } catch {
      snapshot = { docs: [], empty: true };
    }

    let users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    if (users.length === 0) {
      users = [
        {
          uid: req.user.uid,
          name: req.user.name || "System Admin",
          email: req.user.email || "admin@minerakshak.demo",
          role: req.user.role || "admin",
          mineId: req.user.mineId || null,
          status: "active",
          createdAt: new Date(),
        },
        {
          uid: "user-fo-1",
          name: "Inspector Ramesh Kumar",
          email: "inspector1@minerakshak.demo",
          role: "field_officer",
          mineId: "KCM-01",
          mineName: "Kusmunda Coal Mine",
          status: "active",
          createdAt: new Date(),
        },
        {
          uid: "user-mo-1",
          name: "Official S. K. Verma",
          email: "official1@minerakshak.demo",
          role: "mine_official",
          mineId: "KCM-01",
          mineName: "Kusmunda Coal Mine",
          status: "active",
          createdAt: new Date(),
        },
        {
          uid: "user-corp-1",
          name: "Executive Director Corporate",
          email: "corporate@minerakshak.demo",
          role: "corporate",
          mineId: null,
          status: "active",
          createdAt: new Date(),
        },
      ];
      for (const u of users) {
        const { uid, ...data } = u;
        await db.collection("users").doc(uid).set(data).catch(() => {});
      }
    }

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
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q)
      );
    }

    res.json(users);
  } catch (err) {
    next(err);
  }
});

// 2. POST /api/users — Create User (Admin Only)
router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { email, password = "MineRakshak@123", name, role = "field_officer", mineId, mineName } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }

    let uid;
    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
      uid = userRecord.uid;
      await auth.setCustomUserClaims(uid, { role, mineId: mineId || null });
    } catch {
      uid = `user-${Date.now()}`;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      role,
      mineId: mineId || null,
      mineName: mineName || null,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").doc(uid).set(userData);
    await logAudit(req.user.uid, "create_user", "user", uid, null, userData, req.user.role);

    res.status(201).json({ uid, ...userData });
  } catch (err) {
    next(err);
  }
});

// 3. PUT /api/users/:uid — Update User Role, Mine, or Status (Admin Only)
router.put("/:uid", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { name, role, mineId, mineName, status } = req.body;

    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();

    const current = doc.exists ? doc.data() : {};
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(role && { role }),
      ...(mineId !== undefined && { mineId }),
      ...(mineName !== undefined && { mineName }),
      ...(status && { status }),
      updatedAt: new Date(),
    };

    await docRef.set(updateData, { merge: true });

    if (role) {
      try {
        await auth.setCustomUserClaims(uid, { role, mineId: mineId !== undefined ? mineId : current.mineId });
      } catch (e) {
        console.warn("Notice: Custom claim update warning:", e.message);
      }
    }

    await logAudit(req.user.uid, "update_user", "user", uid, current, updateData, req.user.role);

    res.json({ uid, ...current, ...updateData });
  } catch (err) {
    next(err);
  }
});

// 4. DELETE /api/users/:uid — Deactivate User (Admin Only)
router.delete("/:uid", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { uid } = req.params;
    const docRef = db.collection("users").doc(uid);
    await docRef.update({ status: "inactive", updatedAt: new Date() });
    await logAudit(req.user.uid, "deactivate_user", "user", uid, null, { status: "inactive" }, req.user.role);
    res.json({ success: true, uid, status: "inactive" });
  } catch (err) {
    next(err);
  }
});

export default router;
