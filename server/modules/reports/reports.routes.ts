import { Router } from "express";
import { reportsController } from "./reports.controller";
import { requireAuth, requireRole } from "../../core/auth.middleware";

const router = Router();

// All report routes require authentication and specific roles (admin or accountant)
router.use(requireAuth);
router.use(requireRole("admin", "accountant", "manager"));

router.get("/donations/daily", (req, res) => reportsController.getDailyDonations(req, res));
router.get("/donations/monthly", (req, res) => reportsController.getMonthlyDonations(req, res));
router.get("/campaigns/performance", (req, res) => reportsController.getCampaignPerformance(req, res));
router.get("/donors/top", (req, res) => reportsController.getTopDonors(req, res));
router.get("/donors/repeat", (req, res) => reportsController.getRepeatDonors(req, res));
router.get("/donors/retention", (req, res) => reportsController.getDonorRetention(req, res));
router.get("/donations/deleted", (req, res) => reportsController.getDeletedDonations(req, res));

export default router;
