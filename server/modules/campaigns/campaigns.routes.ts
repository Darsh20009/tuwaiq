import { Router } from "express";
import { campaignsController } from "./campaigns.controller";
import { requireAuth, requireRole } from "../../core/auth.middleware";

const router = Router();

// Public routes
router.get("/", campaignsController.getCampaigns);
router.get("/active", campaignsController.getActiveCampaigns);
router.get("/:id", campaignsController.getCampaignById);

// Protected routes (Admin only)
router.post("/", requireAuth, requireRole("admin"), campaignsController.createCampaign);
router.patch("/:id", requireAuth, requireRole("admin"), campaignsController.updateCampaign);
router.delete("/:id", requireAuth, requireRole("admin"), campaignsController.deleteCampaign);

export default router;
