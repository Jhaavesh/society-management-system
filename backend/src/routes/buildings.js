import { Router } from "express";
import Building from "../models/building.js";
import { requireAuth, requireRole, requireSocietyAccess } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const managers = ["platform_admin", "society_admin", "accountant"];

router.get("/", requireSocietyAccess, async (req, res, next) => {
  try { res.json(await Building.find({ societyId: req.societyId, active: true }).sort({ name: 1 }).lean()); } catch (error) { next(error); }
});
router.post("/", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try { res.status(201).json(await Building.create({ ...req.body, societyId: req.societyId })); } catch (error) { next(error); }
});
router.patch("/:id", requireRole(...managers), requireSocietyAccess, async (req, res, next) => {
  try {
    const building = await Building.findOneAndUpdate({ _id: req.params.id, societyId: req.societyId }, req.body, { new: true, runValidators: true });
    if (!building) return res.status(404).json({ message: "Building not found" });
    res.json(building);
  } catch (error) { next(error); }
});

export default router;
