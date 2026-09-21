import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import societyRoutes from "./routes/societies.js";
import dashboardRoutes from "./routes/dashboard.js";
import buildingRoutes from "./routes/buildings.js";
import flatRoutes from "./routes/flats.js";
import residentRoutes from "./routes/residents.js";
import maintenanceRoutes from "./routes/maintenance.js";
import paymentRoutes from "./routes/payments.js";
import complaintRoutes from "./routes/complaints.js";
import noticeRoutes from "./routes/notices.js";
import visitorRoutes from "./routes/visitors.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get("/health", (req, res) => res.json({ ok: true, service: "society-os-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/societies", societyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/visitors", visitorRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected server error" });
});

const port = process.env.PORT || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`API listening on ${port}`))).catch((error) => {
  console.error("Database connection failed", error);
  process.exit(1);
});
