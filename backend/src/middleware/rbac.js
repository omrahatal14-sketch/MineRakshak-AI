// Usage: router.post("/", requireAuth, requireRole("admin"), handler)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${allowedRoles.join(" or ")}` });
    }
    next();
  };
}

// Field Officers are additionally scoped to their own mine — used inside controllers where
// a role-only check isn't specific enough (e.g. "can view this inspection").
export function belongsToMine(req, targetMineId) {
  if (["mine_official", "corporate", "admin"].includes(req.user.role)) return true;
  return req.user.mineId === targetMineId;
}
