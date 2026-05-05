import { Router } from "express";
import * as controller from "./payments.controller";
import { requireAuth, requireRole, optionalAuth } from "../../core/auth.middleware";
import { donationLimiter } from "../../core/rateLimiter";

const router = Router();

router.post("/rajhi", donationLimiter, optionalAuth, controller.initiateRajhi);
router.post("/rajhi-callback", controller.rajhiCallback);

router.post("/bank-transfer", donationLimiter, optionalAuth, controller.initiateBankTransfer);

router.get("/", requireAuth, requireRole("admin", "manager", "accountant"), controller.getPayments);

export default router;
