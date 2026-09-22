import { Router } from "express";
import { listNoticesController, createNoticeController } from "../controllers/index.js";
import { validate, createNoticeSchema, noticeQuerySchema } from "../validators/index.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, validate(noticeQuerySchema), listNoticesController);
router.post("/", requireRole(...managers), requireSocietyAccess, validate(createNoticeSchema), createNoticeController);

export default router;
