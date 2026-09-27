import { Router } from "express";
import { listResidentsController, createResidentController, getResidentController, updateResidentController, assignFlatController, removeResidentController } from "../controllers/index.js";
import { validate, createResidentSchema, residentQuerySchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("platform_admin", "society_admin", "accountant"));

router.get("/", requireSocietyAccess, validate(residentQuerySchema), listResidentsController);
router.post("/", requireSocietyAccess, validate(createResidentSchema), createResidentController);
router.get("/:id", requireSocietyAccess, getResidentController);
router.patch("/:id", requireSocietyAccess, updateResidentController);
router.post("/:id/assign-flat", requireSocietyAccess, assignFlatController);
router.delete("/:id", requireSocietyAccess, removeResidentController);

export default router;
