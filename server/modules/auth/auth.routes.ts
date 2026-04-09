import { Router } from "express";
import { authController } from "./auth.controller";
import { authLimiter, requireAuth } from "../../core";

const router = Router();

// Public routes with rate limiting
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

// Protected routes
router.get("/me", requireAuth, authController.me);

export default router;
