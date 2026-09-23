import { Router } from "express";
import { listComplaintsController, createComplaintController, getComplaintController, updateComplaintController, deleteComplaintController } from "../controllers/index.js";
import { validate, createComplaintSchema, updateComplaintSchema, complaintIdParamSchema, complaintQuerySchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "security", "accountant"];

router.get("/", requireSocietyAccess, validate(complaintQuerySchema), listComplaintsController);
router.post("/", requireRole("resident", ...managers), requireSocietyAccess, validate(createComplaintSchema), createComplaintController);
router.get("/:id", requireSocietyAccess, validate(complaintIdParamSchema), getComplaintController);
router.patch("/:id", requireRole(...managers), requireSocietyAccess, validate(complaintIdParamSchema), validate(updateComplaintSchema), updateComplaintController);
router.delete("/:id", requireRole(...managers), requireSocietyAccess, validate(complaintIdParamSchema), deleteComplaintController);

export default router;
