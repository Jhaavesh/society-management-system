import { Router } from "express";
import { listBuildingsController, createBuildingController, getBuildingController, updateBuildingController } from "../controllers/index.js";
import { validate, createBuildingSchema, updateBuildingSchema, buildingIdParamSchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, listBuildingsController);
router.post("/", requireRole(...managers), requireSocietyAccess, validate(createBuildingSchema), createBuildingController);
router.get("/:id", requireSocietyAccess, validate(buildingIdParamSchema), getBuildingController);
router.patch("/:id", requireRole(...managers), requireSocietyAccess, validate(buildingIdParamSchema), validate(updateBuildingSchema), updateBuildingController);

export default router;
