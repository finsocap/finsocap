import { Router } from "express";
import { loginUser, loginPartner, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// POST /api/auth/login -> Web Admin Login
router.post("/login", loginUser);

// POST /api/auth/partner-login -> Flutter Mobile Partner Login
router.post("/partner-login", loginPartner);

// GET /api/auth/me -> Current Session Info
router.get("/me", authenticateToken, getMe);

export default router;
