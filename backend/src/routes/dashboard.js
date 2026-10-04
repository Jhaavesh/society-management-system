import { Router } from "express";
import { getDashboardController } from "../controllers/index.js";
import { requireAuth, requireRole, requireSocietyAccess, requireActiveUser } from "../middleware/auth.js";

const router = Router();
router.get("/:societyId", requireAuth, requireActiveUser, requireRole("platform_admin", "society_admin", "accountant", "security"), requireSocietyAccess, getDashboardController);

export default router;
