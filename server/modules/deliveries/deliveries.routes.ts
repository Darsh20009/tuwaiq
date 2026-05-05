import { Router } from "express";
import { deliveriesController } from "./deliveries.controller";
import { requireAuth, requireRole } from "../../core/auth.middleware";

const router = Router();

// All delivery routes are protected and require admin, employee, or delivery roles
router.use(requireAuth);

router.get(
  "/",
  requireRole("admin", "employee", "delivery"),
  deliveriesController.getDeliveries
);

router.post(
  "/",
  requireRole("admin", "employee"),
  deliveriesController.createDelivery
);

router.get(
  "/:id",
  requireRole("admin", "employee", "delivery"),
  deliveriesController.getDeliveryById
);

router.patch(
  "/:id",
  requireRole("admin", "employee", "delivery"),
  deliveriesController.updateDelivery
);

router.patch(
  "/:id/assign",
  requireRole("admin", "employee"),
  deliveriesController.assignDeliveryPerson
);

router.patch(
  "/:id/confirm",
  requireRole("admin", "employee", "delivery"),
  deliveriesController.confirmDelivery
);

export default router;
