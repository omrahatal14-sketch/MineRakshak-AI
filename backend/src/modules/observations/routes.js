import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.status(501).json({ error: "observations module not yet implemented — see implementation roadmap" });
});

export default router;
