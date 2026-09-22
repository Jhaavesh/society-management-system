import { Router } from "express";
import { listFlatsController, createFlatController, getFlatController, updateFlatController } from "../controllers/index.js";
import { validate, createFlatSchema, updateFlatSchema, flatIdParamSchema, flatQuerySchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, validate(flatQuerySchema), listFlatsController);
router.post("/", requireRole(...managers), requireSocietyAccess, validate(createFlatSchema), createFlatController);
router.get("/:id", requireSocietyAccess, validate(flatIdParamSchema), getFlatController);
router.patch("/:id", requireRole(...managers), requireSocietyAccess, validate(flatIdParamSchema), validate(updateFlatSchema), updateFlatController);

export default router;
