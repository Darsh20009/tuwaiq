import { Router } from "express";
import { beneficiariesController } from "./beneficiaries.controller";
import { requireAuth, requireRole } from "../../core/auth.middleware";

const router = Router();

// All routes require authentication and admin/employee role
router.use(requireAuth);
router.use(requireRole("admin", "employee"));

router.get("/", (req, res) => beneficiariesController.getBeneficiaries(req, res));
router.get("/:id", (req, res) => beneficiariesController.getBeneficiaryById(req, res));
router.post("/", (req, res) => beneficiariesController.createBeneficiary(req, res));
router.patch("/:id", (req, res) => beneficiariesController.updateBeneficiary(req, res));
router.delete("/:id", (req, res) => beneficiariesController.deleteBeneficiary(req, res));
router.patch("/:id/status", (req, res) => beneficiariesController.updateStatus(req, res));

export default router;
