import { Router, urlencoded, json } from "express";
import * as controller from "./donations.controller";
import { requireAuth, requireRole, optionalAuth } from "../../core/auth.middleware";
import { donationLimiter } from "../../core/rateLimiter";

const router = Router();

router.post("/", donationLimiter, optionalAuth, controller.createDonation);
router.get("/", requireAuth, controller.getDonations);
router.get("/stats", requireAuth, requireRole("admin", "manager", "accountant"), controller.getDonationStats);
router.get("/hajj-stats", controller.getHajjStats);
router.get("/umrah-stats", controller.getUmrahStats);
router.get("/deleted", requireAuth, requireRole("admin", "manager"), controller.getDeletedDonations);
router.get("/top-donors", controller.getTopDonors);
router.get("/campaign/:campaignId", controller.getDonationsByCampaign);

// Rajhi integration diagnostic (admin only)
router.get("/rajhi-debug", requireAuth, requireRole("admin"), controller.rajhiDebug);

// View raw gateway callbacks saved in MongoDB (admin only)
router.get("/payment-callbacks", requireAuth, requireRole("admin"), controller.getPaymentCallbacks);

// Admin: batch recover all pending Rajhi donations by querying the gateway
router.post("/rajhi-recover", requireAuth, requireRole("admin", "manager"), controller.rajhiRecoverPending);

// Public donation status polling (for in-page payment overlay)
router.get("/status/:id", controller.getDonationStatus);

// Public: server-side Al Rajhi inquiry for a specific donation (no auth needed — donationId is opaque)
router.post("/inquiry/:id", controller.rajhiInquiry);

// Payment gateway callbacks — must be before /:id to avoid auth interception
// Al Rajhi may POST as application/x-www-form-urlencoded OR application/json (plain JSON array)
router.post(
  "/rajhi-callback",
  (req, res, next) => {
    const ct = (req.headers["content-type"] || "").toLowerCase();
    if (ct.includes("application/json")) {
      json({ type: "*/*" })(req, res, next);
    } else {
      urlencoded({ extended: true })(req, res, next);
    }
  },
  controller.handleRajhiCallback
);
router.get("/rajhi-callback", controller.handleRajhiCallback);

// Serve server-proxied Al Rajhi payment page (no browser POST needed)
router.get("/payment-page/:id", controller.serveRajhiPaymentPage);

router.get("/:id", requireAuth, controller.getDonationById);
router.delete("/:id", requireAuth, requireRole("admin", "manager"), controller.softDeleteDonation);

export default router;
