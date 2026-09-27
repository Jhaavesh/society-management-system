import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
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
import { errorHandler } from "./errors/index.js";
import { getConnectionStats } from "./config/db.js";

const app = express();

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
});

// Enhanced Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// CORS configuration with proper origin validation
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Logging
app.use(morgan("combined", {
  skip: (req, res) => req.path === "/health",
}));

// Global rate limiter (lenient)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
}));

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later" },
});

// Stricter rate limiter for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many payment requests, please try again later" },
});

// Health check with DB connectivity
app.get("/health", async (req, res) => {
  const dbStats = getConnectionStats();
  const isHealthy = dbStats.readyState === 1;
  res.status(isHealthy ? 200 : 503).json({
    ok: isHealthy,
    service: "society-os-api",
    version: process.env.npm_package_version || "0.1.0",
    timestamp: new Date().toISOString(),
    database: {
      connected: isHealthy,
      host: dbStats.host,
      name: dbStats.name,
    },
  });
});

// API routes with versioning
const apiPrefix = "/api/v1";
app.use(apiPrefix + "/auth", authLimiter, authRoutes);
app.use(apiPrefix + "/societies", societyRoutes);
app.use(apiPrefix + "/dashboard", dashboardRoutes);
app.use(apiPrefix + "/buildings", buildingRoutes);
app.use(apiPrefix + "/flats", flatRoutes);
app.use(apiPrefix + "/residents", residentRoutes);
app.use(apiPrefix + "/maintenance", maintenanceRoutes);
app.use(apiPrefix + "/payments", paymentLimiter, paymentRoutes);
app.use(apiPrefix + "/complaints", complaintRoutes);
app.use(apiPrefix + "/notices", noticeRoutes);
app.use(apiPrefix + "/visitors", visitorRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Error handler
app.use(errorHandler);

export default app;
