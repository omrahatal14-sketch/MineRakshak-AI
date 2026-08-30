import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./modules/auth/routes.js";
import userRoutes from "./modules/users/routes.js";
import mineRoutes from "./modules/mines/routes.js";
import inspectionRoutes from "./modules/inspections/routes.js";
import observationRoutes from "./modules/observations/routes.js";
import violationRoutes from "./modules/violations/routes.js";
import complianceRoutes from "./modules/compliance/routes.js";
import correctiveActionRoutes from "./modules/correctiveActions/routes.js";
import incidentRoutes from "./modules/incidents/routes.js";
import documentRoutes from "./modules/documents/routes.js";
import notificationRoutes from "./modules/notifications/routes.js";
import dashboardRoutes from "./modules/dashboard/routes.js";
import reportRoutes from "./modules/reports/routes.js";
import auditLogRoutes from "./modules/auditLogs/routes.js";

const app = express();

app.use(
  cors({
    origin: true, // Automatically accepts requests from Vercel, localhost, and custom domains
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.get("/health", (req, res) => res.json({ status: "ok", service: "minerakshak-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mines", mineRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/compliance-requirements", complianceRoutes);
app.use("/api/corrective-actions", correctiveActionRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditLogRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`MineRakshak backend listening on port ${env.port}`);
});

export default app;
