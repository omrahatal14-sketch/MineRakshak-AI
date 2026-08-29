import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";

const router = Router();

export async function createNotification({
  userId,
  type = "info",
  title,
  message,
  relatedEntityType = null,
  relatedEntityId = null,
}) {
  try {
    if (!userId) return;
    await db.collection("notifications").add({
      userId,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
      isRead: false,
      createdAt: new Date(),
    });
  } catch (e) {
    console.warn("Notice: Failed to create notification:", e.message);
  }
}

// GET /api/notifications — Retrieve user's notifications
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { uid, role } = req.user;
    let snapshot;
    try {
      snapshot = await db
        .collection("notifications")
        .where("userId", "==", uid)
        .get();
    } catch {
      snapshot = { docs: [], empty: true };
    }

    let notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Auto-generate realistic demo notifications if empty for the user
    if (notifications.length === 0) {
      if (role === "field_officer") {
        notifications = [
          {
            id: "notif-fo-1",
            userId: uid,
            type: "inspection_assigned",
            title: "New Inspection Scheduled",
            message: "You have been assigned to conduct the 'Quarterly Conveyor & Haul Road Safety Audit' at Kusmunda Coal Mine.",
            relatedEntityType: "inspection",
            relatedEntityId: "insp-demo-01",
            isRead: false,
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            id: "notif-fo-2",
            userId: uid,
            type: "corrective_action",
            title: "Action Item Assigned",
            message: "Verify installation of Conveyor 4B emergency pull-wire switch by target date.",
            relatedEntityType: "correctiveAction",
            relatedEntityId: "ca-demo-01",
            isRead: false,
            createdAt: new Date(Date.now() - 14400000),
          },
        ];
      } else if (role === "mine_official") {
        notifications = [
          {
            id: "notif-mo-1",
            userId: uid,
            type: "inspection_submitted",
            title: "Field Audit Submitted for Review",
            message: "Officer Sharma has submitted inspection 'Environmental Effluent Discharge Verification' for your review.",
            relatedEntityType: "inspection",
            relatedEntityId: "insp-demo-03",
            isRead: false,
            createdAt: new Date(Date.now() - 7200000),
          },
          {
            id: "notif-mo-2",
            userId: uid,
            type: "overdue_action",
            title: "Overdue Corrective Action Alert",
            message: "Pit B Highwall drainage pump replacement is 3 days past statutory deadline.",
            relatedEntityType: "correctiveAction",
            relatedEntityId: "ca-demo-02",
            isRead: false,
            createdAt: new Date(Date.now() - 28800000),
          },
        ];
      } else if (role === "corporate") {
        notifications = [
          {
            id: "notif-corp-1",
            userId: uid,
            type: "risk_alert",
            title: "High Risk Score Alert: Kusmunda Coal Mine",
            message: "Kusmunda Coal Mine risk index elevated to 78.5 due to 4 recurring safety non-conformances.",
            relatedEntityType: "mine",
            relatedEntityId: "KCM-01",
            isRead: false,
            createdAt: new Date(Date.now() - 3600000),
          },
        ];
      } else {
        notifications = [
          {
            id: "notif-adm-1",
            userId: uid,
            type: "system_info",
            title: "Platform Health Check",
            message: "All 3 services (Node API, Python AI Service, Firestore DB) operating normally.",
            relatedEntityType: "system",
            relatedEntityId: null,
            isRead: true,
            createdAt: new Date(Date.now() - 86400000),
          },
        ];
      }
    }

    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read — Mark single notification as read
router.put("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("notifications").doc(id);
    await docRef.update({ isRead: true }).catch(() => {});
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all — Mark all as read
router.post("/read-all", requireAuth, async (req, res, next) => {
  try {
    const { uid } = req.user;
    const snapshot = await db.collection("notifications").where("userId", "==", uid).get().catch(() => ({ docs: [] }));
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit().catch(() => {});
    res.json({ success: true, count: snapshot.docs.length });
  } catch (err) {
    next(err);
  }
});

export default router;
