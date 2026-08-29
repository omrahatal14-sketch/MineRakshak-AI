import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db, auth } from "../../config/firebaseAdmin.js";

const router = Router();

function inferRoleFromEmail(email) {
  if (!email) return "field_officer";
  const lower = email.toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("corp")) return "corporate";
  if (lower.includes("official") || lower.includes("mine")) return "mine_official";
  if (lower.includes("inspector") || lower.includes("field")) return "field_officer";
  return "field_officer";
}

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email || "";

    // 1. Check doc by uid
    let userDoc = await db.collection("users").doc(uid).get().catch(() => null);

    // 2. If not found by doc(uid), search by email
    if (!userDoc || !userDoc.exists) {
      if (email) {
        const snap = await db.collection("users").where("email", "==", email).get().catch(() => ({ empty: true }));
        if (!snap.empty) {
          userDoc = snap.docs[0];
        }
      }
    }

    if (userDoc && userDoc.exists) {
      const data = userDoc.data();
      const role = data.role || req.user.role || inferRoleFromEmail(email);
      const mineId = data.mineId || req.user.mineId || (["mine_official", "field_officer"].includes(role) ? "KCM-01" : null);

      try {
        await auth.setCustomUserClaims(uid, { role, mineId });
      } catch (e) {
        // silent
      }

      return res.json({ uid, ...data, role, mineId });
    }

    // Auto-create profile in Firestore for this user with inferred role
    const inferredRole = req.user.role || inferRoleFromEmail(email);
    const inferredMineId = ["mine_official", "field_officer"].includes(inferredRole) ? "KCM-01" : null;
    const cleanName = email
      ? email.split("@")[0].replace(/([a-zA-Z]+)(\d+)?/, (_, t, n) => t.charAt(0).toUpperCase() + t.slice(1) + (n ? ` ${n}` : ""))
      : "User";

    const newProfile = {
      uid,
      email,
      name: cleanName,
      role: inferredRole,
      mineId: inferredMineId,
      mineName: inferredMineId ? "Kusmunda Coal Mine" : null,
      status: "active",
      createdAt: new Date(),
    };

    await db.collection("users").doc(uid).set(newProfile, { merge: true }).catch(() => {});
    try {
      await auth.setCustomUserClaims(uid, { role: inferredRole, mineId: inferredMineId });
    } catch {}

    return res.json(newProfile);
  } catch (err) {
    next(err);
  }
});

router.post("/register", requireAuth, async (req, res, next) => {
  try {
    const { name, role, mineId } = req.body;
    const uid = req.user.uid;
    const email = req.user.email;
    const validRole = ["field_officer", "mine_official", "corporate", "admin"].includes(role)
      ? role
      : inferRoleFromEmail(email);

    try {
      await auth.setCustomUserClaims(uid, { role: validRole, mineId: mineId || null });
    } catch (e) {
      console.warn("Notice: Custom user claims not set via Admin SDK:", e.message);
    }

    const userData = {
      name: name || (email ? email.split("@")[0] : "User"),
      email,
      role: validRole,
      mineId: mineId || (["mine_official", "field_officer"].includes(validRole) ? "KCM-01" : null),
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").doc(uid).set(userData, { merge: true });
    return res.json({ uid, ...userData });
  } catch (err) {
    next(err);
  }
});

export default router;
