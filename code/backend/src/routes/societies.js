import { Router } from "express";
import { listSocietiesController, createSocietyController, getSocietyController, updateSocietyController } from "../controllers/index.js";
import { validate, createSocietySchema, updateSocietySchema, societyIdParamSchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listSocietiesController);
router.post("/", requireRole("platform_admin"), validate(createSocietySchema), createSocietyController);
router.get("/:societyId", requireSocietyAccess, validate(societyIdParamSchema), getSocietyController);
router.patch("/:societyId", requireRole("platform_admin"), requireSocietyAccess, validate(societyIdParamSchema), validate(updateSocietySchema), updateSocietyController);

export default router;
