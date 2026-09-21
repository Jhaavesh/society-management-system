import { Router } from "express";
import Society from "../models/society.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const filter = req.user.role === "platform_admin" ? {} : { _id: { $in: req.user.societyIds } };
    res.json(await Society.find(filter).sort({ createdAt: -1 }).lean());
  } catch (error) { next(error); }
});

router.post("/", requireRole("platform_admin"), async (req, res, next) => {
  try {
    const society = await Society.create({ ...req.body, createdBy: req.user.sub });
    res.status(201).json(society);
  } catch (error) { next(error); }
});

router.get("/:societyId", requireSocietyAccess, async (req, res, next) => {
  try {
    const society = await Society.findById(req.societyId).lean();
    if (!society) return res.status(404).json({ message: "Society not found" });
    res.json(society);
  } catch (error) { next(error); }
});

export default router;
