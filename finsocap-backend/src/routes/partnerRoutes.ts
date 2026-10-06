import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  registerPartner,
  approvePartner,
  updatePartner,
  togglePartnerStatus,
  changePartnerPassword,
} from "../controllers/partnerController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// Public: Apply for branch from Flutter app or landing page
router.post("/register", registerPartner);

// Partner self change password from Flutter App
router.post("/:id/change-password", changePartnerPassword);

// Partner / Admin routes
router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.patch("/:id/approve", approvePartner);
router.patch("/:id/toggle-status", togglePartnerStatus);
router.put("/:id", updatePartner);

export default router;
