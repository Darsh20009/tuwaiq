import { Router } from "express";
import * as usersController from "./users.controller";
import { requireAuth, requireRole } from "../../core/auth.middleware";

const router = Router();

// All routes are protected by admin role
router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", usersController.getUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.patch("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);
router.post("/:id/toggle-status", usersController.toggleUserStatus);

export default router;
