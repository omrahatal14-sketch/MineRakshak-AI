import { db } from "../../config/firebaseAdmin.js";

export async function logAudit(actorId, action, entityType, entityId, oldValue = null, newValue = null, actorRole = null) {
  try {
    await db.collection("auditLogs").add({
      actorId: actorId || "system",
      actorRole: actorRole || "system",
      action,
      entityType,
      entityId: entityId || null,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.warn("Notice: Failed to write audit log:", err.message);
  }
}
