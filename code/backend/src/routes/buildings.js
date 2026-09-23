import { Router } from "express";
import { listBuildingsController, createBuildingController, getBuildingController, updateBuildingController, deleteBuildingController } from "../controllers/index.js";
import { validate, createBuildingSchema, updateBuildingSchema, buildingIdParamSchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/:societyId", requireSocietyAccess, validate(buildingIdParamSchema), listBuildingsController);
router.post("/:societyId", requireRole(...managers), requireSocietyAccess, validate(createBuildingSchema), createBuildingController);
router.get("/:societyId/:id", requireSocietyAccess, validate(buildingIdParamSchema), getBuildingController);
router.patch("/:societyId/:id", requireRole(...managers), requireSocietyAccess, validate(buildingIdParamSchema), validate(updateBuildingSchema), updateBuildingController);
router.delete("/:societyId/:id", requireRole(...managers), requireSocietyAccess, validate(buildingIdParamSchema), deleteBuildingController);

export default router;
