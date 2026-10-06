import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load Environment Variables
dotenv.config();

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import crmRoutes from "./routes/crmRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import dscRoutes from "./routes/dscRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*", // Allows web dashboard and mobile Flutter app
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static upload folder for documents and certificates
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Check API
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "FinSoCap CRM & Operations Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Root API Welcome / Documentation
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to FinSoCap Central REST API Engine",
    endpoints: {
      auth: "/api/auth",
      partners: "/api/partners",
      services: "/api/services",
      tasks: "/api/tasks",
      crm: "/api/crm",
      wallet: "/api/wallet",
      dsc: "/api/dsc",
      chat: "/api/chat",
      blogs: "/api/blogs",
      analytics: "/api/analytics",
      upload: "/api/upload",
    },
    documentation: "Refer to finsocap-backend/README.md for complete API documentation for Flutter App & Dashboard.",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/dsc", dscRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);

// Global 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Internal Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error occurred",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 FinSoCap Backend Server listening on http://localhost:${PORT}`);
  console.log(`📡 Ready for Web Dashboard & Flutter Mobile App API requests!`);
});
