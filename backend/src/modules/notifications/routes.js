import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";

const router = Router();

// GET /api/notifications — List notifications
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const snap = await db.collection("notifications").get();
    let notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filter for current user or global notifications
    notifs = notifs.filter((n) => !n.userId || n.userId === req.user.uid);
    notifs.sort((a, b) => new Date(b.createdAt?._seconds ? b.createdAt._seconds * 1000 : b.createdAt || 0) - new Date(a.createdAt?._seconds ? a.createdAt._seconds * 1000 : a.createdAt || 0));

    res.json(notifs);
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications — Create a new notification (e.g. SOS)
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { type, title, message, priority, recipients } = req.body;
    
    // In a real app, we'd loop through recipients or broadcast based on roles.
    // For this prototype, we'll create a global notification.
    const notif = {
      type: type || "ALERT",
      title: title || "New Notification",
      message: message || "",
      priority: priority || "medium",
      isRead: false,
      createdAt: new Date().toISOString(),
      sourceUserId: req.user.uid
    };
    
    const docRef = await db.collection("notifications").add(notif);
    res.json({ id: docRef.id, ...notif });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read — Mark notification as read
router.put("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.collection("notifications").doc(id).set({ isRead: true }, { merge: true });
    res.json({ success: true, id, isRead: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all — Mark all notifications as read
router.post("/read-all", requireAuth, async (req, res, next) => {
  try {
    const snap = await db.collection("notifications").get();
    for (const doc of snap.docs) {
      await db.collection("notifications").doc(doc.id).set({ isRead: true }, { merge: true });
    }
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
});

export default router;
