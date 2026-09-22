import { Router } from "express";
import { listBillsController, createBillController, getBillController, updateBillController } from "../controllers/index.js";
import { validate, createBillSchema, updateBillSchema, billIdParamSchema, billQuerySchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, validate(billQuerySchema), listBillsController);
router.post("/", requireRole(...managers), requireSocietyAccess, validate(createBillSchema), createBillController);
router.get("/:id", requireSocietyAccess, validate(billIdParamSchema), getBillController);
router.patch("/:id", requireRole(...managers), requireSocietyAccess, validate(billIdParamSchema), validate(updateBillSchema), updateBillController);

export default router;
