import { Router } from "express";
import { listPaymentsController, createPaymentController } from "../controllers/index.js";
import { validate, createPaymentSchema, paymentQuerySchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, validate(paymentQuerySchema), listPaymentsController);
router.post("/", requireRole(...managers), requireSocietyAccess, validate(createPaymentSchema), createPaymentController);

export default router;
