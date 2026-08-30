import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";

const router = Router();

// ==========================================
// 1. ATTENDANCE (GPS Check-In/Out)
// ==========================================
router.get("/attendance", requireAuth, async (req, res, next) => {
  try {
    const snap = await db.collection("worker_attendance")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/attendance/checkin", requireAuth, async (req, res, next) => {
  try {
    const { shift, coords } = req.body;
    const entry = {
      id: `att_${Date.now()}`,
      userId: req.user.uid,
      date: new Date().toISOString().split("T")[0],
      shift,
      checkInTime: new Date().toLocaleTimeString(),
      checkInCoords: coords,
      checkOutTime: null,
      checkOutCoords: null,
      status: "present",
      createdAt: new Date().toISOString(),
    };
    await db.collection("worker_attendance").doc(entry.id).set(entry);
    await logAudit("worker_checkin", "attendance", entry.id, req.user, { shift, coords });
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

router.post("/attendance/checkout", requireAuth, async (req, res, next) => {
  try {
    const { attendanceId, coords } = req.body;
    const ref = db.collection("worker_attendance").doc(attendanceId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Attendance not found" });
    
    const update = {
      checkOutTime: new Date().toLocaleTimeString(),
      checkOutCoords: coords,
      status: "completed",
      updatedAt: new Date().toISOString()
    };
    await ref.update(update);
    
    const updatedData = { ...doc.data(), ...update, id: attendanceId };
    await logAudit("worker_checkout", "attendance", attendanceId, req.user, { coords });
    res.json(updatedData);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. PPE COMPLIANCE
// ==========================================
router.get("/ppe", requireAuth, async (req, res, next) => {
  try {
    const date = new Date().toISOString().split("T")[0];
    const snap = await db.collection("worker_ppe")
      .where("userId", "==", req.user.uid)
      .where("date", "==", date)
      .limit(1)
      .get();
    if (snap.empty) return res.json(null);
    res.json(snap.docs[0].data());
  } catch (err) {
    next(err);
  }
});

router.post("/ppe", requireAuth, async (req, res, next) => {
  try {
    const { checklist } = req.body;
    const date = new Date().toISOString().split("T")[0];
    const id = `ppe_${req.user.uid}_${date}`;
    
    const record = {
      id,
      userId: req.user.uid,
      date,
      checklist,
      verifiedAt: new Date().toISOString()
    };
    
    await db.collection("worker_ppe").doc(id).set(record);
    await logAudit("ppe_verified", "ppe", id, req.user, { date });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. SAFETY TASKS
// ==========================================
router.get("/tasks", requireAuth, async (req, res, next) => {
  try {
    const snap = await db.collection("worker_tasks")
      .where("userId", "==", req.user.uid)
      .get();
      
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Seed default tasks if empty for demo purposes
    if (data.length === 0) {
      const defaultTasks = [
        { id: `wt_${Date.now()}_1`, userId: req.user.uid, title: "Clear loose coal debris from Face 2 conveyor return idlers", zone: "Face 2 / Pit Bottom", priority: "High", deadline: new Date(Date.now() + 4 * 3600000).toISOString(), status: "pending" },
        { id: `wt_${Date.now()}_2`, userId: req.user.uid, title: "Inspect primary sump pump water level and grease bearings", zone: "Main Sump Station", priority: "Medium", deadline: new Date(Date.now() + 6 * 3600000).toISOString(), status: "pending" },
      ];
      for (const t of defaultTasks) {
        await db.collection("worker_tasks").doc(t.id).set(t);
        data.push(t);
      }
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/tasks/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.collection("worker_tasks").doc(id).update({ status });
    
    const snap = await db.collection("worker_tasks").where("userId", "==", req.user.uid).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. TRAINING MODULES
// ==========================================
router.get("/training", requireAuth, async (req, res, next) => {
  try {
    const snap = await db.collection("worker_training")
      .where("userId", "==", req.user.uid)
      .get();
      
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Seed default training if empty for demo purposes
    if (data.length === 0) {
      const defaultTraining = [
        { id: `tr_${req.user.uid}_1`, userId: req.user.uid, title: "DGMS Opencast Slope & Bench Safety Protocol", progress: 100, status: "completed", lastAccessed: new Date(Date.now() - 30 * 86400000).toISOString() },
        { id: `tr_${req.user.uid}_2`, userId: req.user.uid, title: "Conveyor Lockout-Tagout (LOTO) & Pinch Point Safety", progress: 100, status: "completed", lastAccessed: new Date(Date.now() - 15 * 86400000).toISOString() },
        { id: `tr_${req.user.uid}_3`, userId: req.user.uid, title: "Heavy Machinery (HEMM) Proximity & Blind Spot Rules", progress: 45, status: "in-progress", lastAccessed: new Date().toISOString() },
      ];
      for (const t of defaultTraining) {
        await db.collection("worker_training").doc(t.id).set(t);
        data.push(t);
      }
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/training/:id/progress", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const status = progress === 100 ? "completed" : "in-progress";
    await db.collection("worker_training").doc(id).update({ 
      progress, 
      status, 
      lastAccessed: new Date().toISOString() 
    });
    
    const snap = await db.collection("worker_training").where("userId", "==", req.user.uid).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
