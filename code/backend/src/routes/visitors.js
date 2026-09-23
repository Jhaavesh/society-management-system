import { Router } from "express";
import { listVisitorsController, createVisitorController, getVisitorController, updateVisitorController, deleteVisitorController } from "../controllers/index.js";
import { validate, createVisitorSchema, updateVisitorSchema, visitorIdParamSchema, visitorQuerySchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "security"];

router.get("/", requireSocietyAccess, validate(visitorQuerySchema), listVisitorsController);
router.post("/", requireRole("resident", ...managers), requireSocietyAccess, validate(createVisitorSchema), createVisitorController);
router.get("/:id", requireSocietyAccess, validate(visitorIdParamSchema), getVisitorController);
router.patch("/:id", requireRole(...managers), requireSocietyAccess, validate(visitorIdParamSchema), validate(updateVisitorSchema), updateVisitorController);
router.delete("/:id", requireRole(...managers), requireSocietyAccess, validate(visitorIdParamSchema), deleteVisitorController);

export default router;
