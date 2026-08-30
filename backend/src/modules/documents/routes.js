import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../config/firebaseAdmin.js";
import { logAudit } from "../../services/auditService.js";
import { analyzeDocumentOcr } from "../../services/documentAiService.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/documents — List documents
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { relatedEntityType } = req.query;
    const snap = await db.collection("documents").get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (relatedEntityType && relatedEntityType !== "all") {
      items = items.filter((d) => d.relatedEntityType === relatedEntityType);
    }

    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id — Get single document
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await db.collection("documents").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Document not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/upload — Upload document
router.post("/upload", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    const { relatedEntityType = "general", relatedEntityId = null, mineId = null } = req.body;
    const docId = `doc_${Date.now()}`;

    const docData = {
      id: docId,
      fileName: file?.originalname || `uploaded_${Date.now()}`,
      fileType: file?.mimetype || "application/octet-stream",
      fileSize: file?.size || 0,
      relatedEntityType,
      relatedEntityId,
      mineId,
      uploadedBy: req.user.uid,
      uploadedByName: req.user.name,
      uploadedAt: new Date(),
      ocrText: `DOCUMENT METADATA LOG\nFilename: ${file?.originalname || "document"}\nTimestamp: ${new Date().toISOString()}\nVerified: Statutory Audit Records`,
    };

    await db.collection("documents").doc(docId).set(docData);
    await logAudit(req.user.uid, "upload_document", "document", docId, null, docData, req.user.role);
    res.status(201).json(docData);
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/ai-ocr — Process Document with AI OCR
router.post("/ai-ocr", requireAuth, async (req, res, next) => {
  try {
    const { fileName, entityType, base64Image } = req.body;
    const result = await analyzeDocumentOcr({ fileName, entityType, base64Image });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/ocr — Save OCR text
router.post("/:id/ocr", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ocrText } = req.body;
    await db.collection("documents").doc(id).set({ ocrText, ocrProcessedAt: new Date() }, { merge: true });
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

export default router;
