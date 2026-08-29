import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "minerakshak-backend" });
});

export default router;
