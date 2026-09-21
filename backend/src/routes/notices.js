import { Router } from "express";
import Notice from "../models/notice.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try { res.json(await Notice.find({ societyId: req.societyId }).populate("publishedBy", "name").sort({ createdAt: -1 }).lean()); } catch (error) { next(error); }
});
router.post("/", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const { title, content, validTill } = req.body;
    if (!title || !content) return res.status(400).json({ message: "title and content are required" });
    res.status(201).json(await Notice.create({ title, content, validTill, societyId: req.societyId, publishedBy: req.user.sub }));
  } catch (error) { next(error); }
});

export default router;
